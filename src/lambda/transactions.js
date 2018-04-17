import axios from 'axios';
import {
  multiply,
  convertAmountToDisplay,
  convertAssetAmountToBigNumber,
  convertAmountToBigNumber,
  convertAssetAmountToNativeValue
} from '../helpers/bignumber';
import { apiGetHistoricalPrices } from '../helpers/api';
import { debounceRequest } from '../helpers/utilities';
import nativeCurrencies from '../libraries/native-currencies.json';

const parseAccountTransactions = async (data = null, address = '', network = '') => {
  if (!data || !data.docs) return null;

  let transactions = await Promise.all(
    data.docs.map(async (tx, idx) => {
      const hash = tx._id;
      const timestamp = {
        secs: tx.timeStamp,
        ms: `${tx.timeStamp}000`
      };
      const error = tx.isError === '1';
      let interaction = false;
      let from = tx.from;
      let to = tx.to;
      let asset = {
        name: 'Ethereum',
        symbol: 'ETH',
        address: null,
        decimals: 18
      };
      let value = {
        amount: tx.value,
        display: convertAmountToDisplay(tx.value, null, {
          symbol: 'ETH',
          decimals: 18
        })
      };
      let totalGas = multiply(tx.gasUsed, tx.gasPrice);
      let txFee = {
        amount: totalGas,
        display: convertAmountToDisplay(totalGas, null, {
          symbol: 'ETH',
          decimals: 18
        })
      };

      const includesTokenTransfer = (() => {
        if (tx.operations.length) {
          const tokenTransfers = tx.operations.filter(
            operation => operation.type === 'token_transfer'
          );
          if (tokenTransfers.length) {
            return true;
          }
        }
        return false;
      })();

      interaction = !includesTokenTransfer && tx.input !== '0x';

      let result = {
        hash,
        timestamp,
        from,
        to,
        error,
        interaction,
        value,
        txFee,
        native: {},
        pending: false,
        asset
      };

      if (includesTokenTransfer) {
        const tokenTransfers = [];
        if (tx.operations.length) {
          tx.operations.forEach((transferData, idx) => {
            const transferTx = {
              hash: `${result.hash}-${idx + 1}`,
              timestamp,
              from,
              to,
              error,
              interaction,
              value,
              txFee,
              native: {},
              pending: false,
              asset
            };
            transferTx.asset = {
              name: transferData.contract.name || 'Unknown Token',
              symbol: transferData.contract.symbol || '———',
              address: transferData.contract.address || '',
              decimals: transferData.contract.decimals || 18
            };

            transferTx.from = transferData.from;
            transferTx.to = transferData.to;
            const amount = convertAssetAmountToBigNumber(
              transferData.value,
              transferTx.asset.decimals
            );
            transferTx.value = {
              amount,
              display: convertAmountToDisplay(amount, null, transferTx.asset)
            };
            tokenTransfers.push(transferTx);
          });
          if (!Number(tx.value)) {
            result = [...tokenTransfers];
          } else {
            result.hash = `${result.hash}-0`;
            result = [...tokenTransfers, result];
          }
        }
      }

      return result;
    })
  );
  let _transactions = [];

  transactions.forEach(tx => {
    if (Array.isArray(tx)) {
      tx.forEach(subTx => {
        _transactions.push(subTx);
      });
    } else {
      _transactions.push(tx);
    }
  });

  if (data.pages > data.page) {
    const newPageResponse = await axios.get(
      `https://${
        network === 'mainnet' ? `api` : network
      }.trustwalletapp.com/transactions?address=${address}&limit=50&page=${data.page + 1}`
    );
    const newPageTransations = await parseAccountTransactions(
      newPageResponse.data,
      address,
      network
    );
    _transactions = [..._transactions, ...newPageTransations];
  }

  _transactions = await Promise.all(
    _transactions.map(async (tx, idx) => {
      const timestamp = tx.timestamp ? tx.timestamp.secs : Date.now();
      const assetSymbol = tx.asset.symbol;
      if (!tx.native || (tx.native && Object.keys(tx.native).length < 1)) {
        const response = await debounceRequest(
          apiGetHistoricalPrices,
          [assetSymbol, timestamp],
          100 * idx
        );

        if (response.data.response === 'Error' || !response.data[assetSymbol]) {
          return tx;
        }

        await Promise.all(
          Object.keys(nativeCurrencies).map(async nativeCurrency => {
            const assetPriceAmount = convertAmountToBigNumber(
              response.data[assetSymbol][nativeCurrency]
            );
            let prices = { selected: nativeCurrencies[nativeCurrency] };
            prices[nativeCurrency] = {};
            prices[nativeCurrency][assetSymbol] = {
              price: { amount: assetPriceAmount, display: null }
            };
            const assetPriceDisplay = convertAmountToDisplay(assetPriceAmount, prices);
            prices[nativeCurrency][assetSymbol].price.display = assetPriceDisplay;
            const assetPrice = prices[nativeCurrency][assetSymbol].price;
            const valuePriceAmount = convertAssetAmountToNativeValue(
              tx.value.amount,
              tx.asset,
              prices
            );
            const valuePriceDisplay = convertAmountToDisplay(valuePriceAmount, prices);
            const valuePrice = !tx.error
              ? { amount: valuePriceAmount, display: valuePriceDisplay }
              : { amount: '', display: '' };
            const txFeePriceAmount = convertAssetAmountToNativeValue(
              tx.txFee.amount,
              tx.asset,
              prices,
              tx
            );
            const txFeePriceDisplay = convertAmountToDisplay(txFeePriceAmount, prices);
            const txFeePrice = { amount: txFeePriceAmount, display: txFeePriceDisplay };

            tx.native[nativeCurrency] = {
              price: assetPrice,
              value: valuePrice,
              txFee: txFeePrice
            };
          })
        );
      }
      return tx;
    })
  );

  return _transactions;
};

const apiProxyGetAccountTransactions = async (address = '', network = 'mainnet') => {
  try {
    const { data } = await axios.get(
      `https://${
        network === 'mainnet' ? `api` : network
      }.trustwalletapp.com/transactions?address=${address}&limit=50&page=1`
    );
    const transactions = await parseAccountTransactions(data, address, network);
    return transactions;
  } catch (error) {
    throw error;
  }
};

export const handler = async (event, context, callback) => {
  const { address, network } = event.queryStringParameters;
  try {
    const data = await apiProxyGetAccountTransactions(address, network);
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error(error);
    callback(null, {
      statusCode: 500,
      body: error
    });
  }
};
