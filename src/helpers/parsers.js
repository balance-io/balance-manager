import BigNumber from 'bignumber.js';
import lang from '../languages';
import axios from 'axios';
import {
  debounceRequest,
  convertStringToNumber,
  convertAmountToBigNumber,
  convertAmountFromBigNumber,
  convertAmountToDisplay,
  convertAmountToDisplaySpecific,
  convertAssetAmountToBigNumber,
  convertAssetAmountToNativeValue,
  convertAssetAmountToNativeAmount,
  saveLocal,
  getLocal
} from './utilities';
import { getAccountBalance, getTokenBalanceOf, getTransactionCount } from './web3';
import { getTimeString } from './time';
import nativeCurrencies from '../libraries/native-currencies.json';
import ethUnits from '../libraries/ethereum-units.json';
import timeUnits from '../libraries/time-units.json';
import { apiGetHistoricalPrices } from './api';

/**
 * @desc parse error code message
 * @param  {Error} error
 * @return {String}
 */

export const parseError = error => {
  if (error) {
    const msgEnd =
      error.message.indexOf('\n') !== -1 ? error.message.indexOf('\n') : error.message.length;
    let message = error.message.slice(0, msgEnd);
    if (error.message.includes('MetaMask') || error.message.includes('Returned error:')) {
      message = message
        .replace('Error: ', '')
        .replace('MetaMask ', '')
        .replace('Returned error: ', '');
      message = message.slice(0, 1).toUpperCase() + message.slice(1).toLowerCase();
      console.error(new Error(message));
      return message;
    }
    console.error(error);
    return message;
  }
  return `Something went wrong`;
};

/**
 * @desc parse ether gas prices
 * @param {Object} data
 * @param {Object} prices
 * @param {Number} gasLimit
 */
export const parseGasPrices = (data, prices, gasLimit) => {
  let gasPrices = {
    slow: null,
    average: null,
    fast: null
  };
  if (!data) {
    gasPrices.fast = {
      option: 'fast',
      estimatedTime: {
        amount: '30000',
        display: getTimeString('30000', 'ms')
      },
      value: {
        amount: '5000000000',
        display: '5 Gwei'
      }
    };
    gasPrices.fast.txFee = {
      value: {
        amount: BigNumber(gasPrices.fast.value.amount)
          .times(BigNumber(`${gasLimit}`))
          .toString(),
        display: convertAmountToDisplay(
          BigNumber(gasPrices.fast.value.amount)
            .times(BigNumber(`${gasLimit}`))
            .toString(),
          null,
          { symbol: 'ETH', decimals: 18 }
        )
      },
      native: null
    };

    gasPrices.average = {
      option: 'average',
      estimatedTime: {
        amount: '360000',
        display: getTimeString('360000', 'ms')
      },
      value: {
        amount: '2000000000',
        display: '2 Gwei'
      }
    };
    gasPrices.average.txFee = {
      value: {
        amount: BigNumber(gasPrices.average.value.amount)
          .times(BigNumber(`${gasLimit}`))
          .toString(),
        display: convertAmountToDisplay(
          BigNumber(gasPrices.average.value.amount)
            .times(BigNumber(`${gasLimit}`))
            .toString(),
          null,
          { symbol: 'ETH', decimals: 18 }
        )
      },
      native: null
    };

    gasPrices.slow = {
      option: 'slow',
      estimatedTime: {
        amount: '1800000',
        display: getTimeString('1800000', 'ms')
      },
      value: {
        amount: '1000000000',
        display: '1 Gwei'
      }
    };
    gasPrices.slow.txFee = {
      value: {
        amount: BigNumber(gasPrices.slow.value.amount)
          .times(BigNumber(`${gasLimit}`))
          .toString(),
        display: convertAmountToDisplay(
          BigNumber(gasPrices.slow.value.amount)
            .times(BigNumber(`${gasLimit}`))
            .toString(),
          null,
          { symbol: 'ETH', decimals: 18 }
        )
      },
      native: null
    };
  } else {
    gasPrices.fast = {
      option: 'fast',
      estimatedTime: {
        amount: BigNumber(`${data.fastWait}`)
          .times(BigNumber(`${timeUnits.ms.minute}`))
          .toString(),
        display: getTimeString(
          BigNumber(`${data.fastWait}`)
            .times(BigNumber(`${timeUnits.ms.minute}`))
            .toString(),
          'ms'
        )
      },
      value: {
        amount: `${BigNumber(`${data.fast}`)
          .dividedBy(10)
          .times(`${ethUnits.gwei}`)
          .toString()}`,
        display: `${BigNumber(`${data.fast}`).dividedBy(10)} Gwei`
      }
    };
    gasPrices.fast.txFee = {
      value: {
        amount: BigNumber(gasPrices.fast.value.amount)
          .times(BigNumber(`${gasLimit}`))
          .toString(),
        display: convertAmountToDisplay(
          BigNumber(gasPrices.fast.value.amount)
            .times(BigNumber(`${gasLimit}`))
            .toString(),
          null,
          { symbol: 'ETH', decimals: 18 }
        )
      },
      native: null
    };
    gasPrices.average = {
      option: 'average',
      estimatedTime: {
        amount: BigNumber(`${data.avgWait}`)
          .times(BigNumber(`${timeUnits.ms.minute}`))
          .toString(),
        display: getTimeString(
          BigNumber(`${data.avgWait}`)
            .times(BigNumber(`${timeUnits.ms.minute}`))
            .toString(),
          'ms'
        )
      },
      value: {
        amount: `${BigNumber(`${data.average}`)
          .dividedBy(10)
          .times(`${ethUnits.gwei}`)
          .toString()}`,
        display: `${BigNumber(`${data.average}`).dividedBy(10)} Gwei`
      }
    };
    gasPrices.average.txFee = {
      value: {
        amount: BigNumber(gasPrices.average.value.amount)
          .times(BigNumber(`${gasLimit}`))
          .toString(),
        display: convertAmountToDisplay(
          BigNumber(gasPrices.average.value.amount)
            .times(BigNumber(`${gasLimit}`))
            .toString(),
          null,
          { symbol: 'ETH', decimals: 18 }
        )
      },
      native: null
    };

    gasPrices.slow = {
      option: 'slow',
      estimatedTime: {
        amount: BigNumber(`${data.safeLowWait}`)
          .times(BigNumber(`${timeUnits.ms.minute}`))
          .toString(),
        display: getTimeString(
          BigNumber(`${data.safeLowWait}`)
            .times(BigNumber(`${timeUnits.ms.minute}`))
            .toString(),
          'ms'
        )
      },
      value: {
        amount: `${BigNumber(`${data.safeLow}`)
          .dividedBy(10)
          .times(`${ethUnits.gwei}`)
          .toString()}`,
        display: `${BigNumber(`${data.safeLow}`).dividedBy(10)} Gwei`
      }
    };
    gasPrices.slow.txFee = {
      value: {
        amount: BigNumber(gasPrices.slow.value.amount)
          .times(BigNumber(`${gasLimit}`))
          .toString(),
        display: convertAmountToDisplay(
          BigNumber(gasPrices.slow.value.amount)
            .times(BigNumber(`${gasLimit}`))
            .toString(),
          null,
          { symbol: 'ETH', decimals: 18 }
        )
      },
      native: null
    };
  }
  if (prices && prices.selected) {
    gasPrices.fast.txFee.native = {
      selected: prices.selected,
      value: {
        amount: convertAssetAmountToNativeAmount(
          gasPrices.fast.txFee.value.amount,
          { symbol: 'ETH' },
          prices
        ),
        display: convertAmountToDisplay(
          convertAssetAmountToNativeAmount(
            gasPrices.fast.txFee.value.amount,
            { symbol: 'ETH' },
            prices
          ),
          prices,
          null,
          2
        )
      }
    };
    gasPrices.average.txFee.native = {
      selected: prices.selected,
      value: {
        amount: convertAssetAmountToNativeAmount(
          gasPrices.average.txFee.value.amount,
          { symbol: 'ETH' },
          prices
        ),
        display: convertAmountToDisplay(
          convertAssetAmountToNativeAmount(
            gasPrices.average.txFee.value.amount,
            { symbol: 'ETH' },
            prices
          ),
          prices,
          null,
          2
        )
      }
    };
    gasPrices.slow.txFee.native = {
      selected: prices.selected,
      value: {
        amount: convertAssetAmountToNativeAmount(
          gasPrices.slow.txFee.value.amount,
          { symbol: 'ETH' },
          prices
        ),
        display: convertAmountToDisplay(
          convertAssetAmountToNativeAmount(
            gasPrices.slow.txFee.value.amount,
            { symbol: 'ETH' },
            prices
          ),
          prices,
          null,
          2
        )
      }
    };
  }
  return gasPrices;
};

/**
 * @desc parse ether gas prices with updated gas limit
 * @param {Object} data
 * @param {Object} prices
 * @param {Number} gasLimit
 */
export const parseGasPricesTxFee = (gasPrices, prices, gasLimit) => {
  gasPrices.fast.txFee = {
    value: {
      amount: BigNumber(gasPrices.fast.value.amount)
        .times(BigNumber(`${gasLimit}`))
        .toString(),
      display: convertAmountToDisplay(
        BigNumber(gasPrices.fast.value.amount)
          .times(BigNumber(`${gasLimit}`))
          .toString(),
        null,
        { symbol: 'ETH', decimals: 18 }
      )
    },
    native: null
  };
  gasPrices.average.txFee = {
    value: {
      amount: BigNumber(gasPrices.average.value.amount)
        .times(BigNumber(`${gasLimit}`))
        .toString(),
      display: convertAmountToDisplay(
        BigNumber(gasPrices.average.value.amount)
          .times(BigNumber(`${gasLimit}`))
          .toString(),
        null,
        { symbol: 'ETH', decimals: 18 }
      )
    },
    native: null
  };

  gasPrices.slow.txFee = {
    value: {
      amount: BigNumber(gasPrices.slow.value.amount)
        .times(BigNumber(`${gasLimit}`))
        .toString(),
      display: convertAmountToDisplay(
        BigNumber(gasPrices.slow.value.amount)
          .times(BigNumber(`${gasLimit}`))
          .toString(),
        null,
        { symbol: 'ETH', decimals: 18 }
      )
    },
    native: null
  };
  if (prices) {
    gasPrices.fast.txFee.native = {
      selected: prices.selected,
      value: {
        amount: convertAssetAmountToNativeAmount(
          gasPrices.fast.txFee.value.amount,
          { symbol: 'ETH' },
          prices
        ),
        display: convertAmountToDisplay(
          convertAssetAmountToNativeAmount(
            gasPrices.fast.txFee.value.amount,
            { symbol: 'ETH' },
            prices
          ),
          prices,
          null,
          2
        )
      }
    };
    gasPrices.average.txFee.native = {
      selected: prices.selected,
      value: {
        amount: convertAssetAmountToNativeAmount(
          gasPrices.average.txFee.value.amount,
          { symbol: 'ETH' },
          prices
        ),
        display: convertAmountToDisplay(
          convertAssetAmountToNativeAmount(
            gasPrices.average.txFee.value.amount,
            { symbol: 'ETH' },
            prices
          ),
          prices,
          null,
          2
        )
      }
    };
    gasPrices.slow.txFee.native = {
      selected: prices.selected,
      value: {
        amount: convertAssetAmountToNativeAmount(
          gasPrices.slow.txFee.value.amount,
          { symbol: 'ETH' },
          prices
        ),
        display: convertAmountToDisplay(
          convertAssetAmountToNativeAmount(
            gasPrices.slow.txFee.value.amount,
            { symbol: 'ETH' },
            prices
          ),
          prices,
          null,
          2
        )
      }
    };
  }
  return gasPrices;
};

/**
 * @desc parse prices object from api response
 * @param  {Object} [data=null]
 * @param  {Array} [assets=[]]
 * @param  {String} [native='USD']
 * @return {Object}
 */
export const parsePricesObject = (data = null, assets = [], nativeSelected = 'USD') => {
  let prices = { selected: nativeCurrencies[nativeSelected] };
  Object.keys(nativeCurrencies).forEach(nativeCurrency => {
    prices[nativeCurrency] = {};
    assets.forEach(asset => {
      let assetPrice = null;
      if (data.RAW[asset]) {
        assetPrice = {
          price: {
            amount: convertAmountToBigNumber(data.RAW[asset][nativeCurrency].PRICE),
            display: convertAmountToDisplaySpecific(
              convertAmountToBigNumber(data.RAW[asset][nativeCurrency].PRICE),
              prices,
              nativeCurrency
            )
          },
          change: {
            amount: convertAmountToBigNumber(data.RAW[asset][nativeCurrency].CHANGEPCT24HOUR),
            display: convertAmountToDisplay(
              convertAmountToBigNumber(data.RAW[asset][nativeCurrency].CHANGEPCT24HOUR)
            )
          }
        };
      }
      if (asset !== 'WETH') {
        prices[nativeCurrency][asset] = assetPrice;
      }
      if (asset === 'ETH') {
        prices[nativeCurrency]['WETH'] = assetPrice;
      }
    });
  });
  saveLocal('native_prices', prices);
  return prices;
};

/**
 * @desc parse account balances
 * @param  {Object}   [data = null]
 * @param  {String}   [web3Network = '']
 * @return {Promise}
 */
export const parseAccountBalances = async (data = null, address = '', web3Network = '') => {
  if (!data || !data.docs) return null;

  const ethereumBalance = await getAccountBalance(address);
  const countTxs = await getTransactionCount(address);
  const ethereum = {
    name: 'Ethereum',
    symbol: 'ETH',
    address: null,
    decimals: 18,
    balance: {
      amount: ethereumBalance,
      display: convertAmountToDisplay(ethereumBalance, null, { symbol: 'ETH', decimals: 18 })
    },
    native: null
  };

  let assets = [ethereum];

  let tokens = await Promise.all(
    data.docs.map(async token => {
      const asset = {
        name: token.contract.name || lang.t('account.unknown_token'),
        symbol: token.contract.symbol || '———',
        address: token.contract.address || null,
        decimals: convertStringToNumber(token.contract.decimals)
      };
      const allTokens = getLocal('token_info') || {};
      if (asset.symbol === '———' && !allTokens[asset.address]) {
        allTokens[asset.address] = asset;
      } else if (!allTokens[asset.symbol]) {
        allTokens[asset.symbol] = asset;
      }
      saveLocal('token_info', allTokens);
      const rawBalance = await getTokenBalanceOf(address, asset.address);
      const assetBalance = convertAssetAmountToBigNumber(rawBalance, asset.decimals);
      return {
        ...asset,
        balance: {
          amount: assetBalance,
          display: convertAmountToDisplay(assetBalance, null, {
            symbol: asset.symbol,
            decimals: asset.decimals
          })
        },
        native: null
      };
    })
  );

  tokens = tokens.filter(token => !!Number(token.balance.amount));

  assets = [...assets, ...tokens];

  const accountLocal = getLocal(data.address) || {};
  accountLocal.balances = { assets, total: '———' };
  accountLocal.web3Network = web3Network;
  saveLocal(data.address, accountLocal);
  return {
    address: address,
    type: '',
    txCount: countTxs,
    assets: assets,
    total: '———'
  };
};

/**
 * @desc parse account balances from native prices
 * @param  {Object} [account=null]
 * @param  {Object} [prices=null]
 * @param  {String} [web3Network='']
 * @return {String}
 */
export const parseAccountBalancesPrices = (
  account = null,
  nativePrices = null,
  web3Network = ''
) => {
  let totalAmount = 0;
  let newAccount = {
    ...account
  };
  let nativeSelected = nativePrices.selected.currency;
  if (account) {
    const newAssets = account.assets.map(asset => {
      if (!nativePrices || (nativePrices && !nativePrices[nativeSelected][asset.symbol]))
        return asset;

      const balanceAmountUnit = convertAmountFromBigNumber(asset.balance.amount, asset.decimals);
      const balancePriceUnit = convertAmountFromBigNumber(
        nativePrices[nativeSelected][asset.symbol].price.amount
      );
      const balanceRaw = BigNumber(balanceAmountUnit)
        .times(BigNumber(balancePriceUnit))
        .toString();
      const balanceAmount = convertAmountToBigNumber(balanceRaw);
      const balanceDisplay = convertAmountToDisplay(balanceAmount, nativePrices);
      const assetPrice = nativePrices[nativeSelected][asset.symbol].price;
      return {
        ...asset,
        native: {
          selected: nativePrices.selected,
          balance: { amount: balanceAmount, display: balanceDisplay },
          price: assetPrice,
          change:
            asset.symbol !== nativePrices.selected.currency
              ? nativePrices[nativeSelected][asset.symbol].change
              : { amount: '0', display: '0.00%' }
        }
      };
    });
    totalAmount = newAssets.reduce(
      (total, asset) =>
        BigNumber(`${total}`)
          .plus(BigNumber(asset.native ? asset.native.balance.amount : 0))
          .toString(),
      0
    );
    const totalDisplay = convertAmountToDisplay(totalAmount, nativePrices);
    const total = { amount: totalAmount, display: totalDisplay };
    newAccount = {
      ...newAccount,
      assets: newAssets,
      total: total
    };

    const accountLocal = getLocal(account.address) || {};
    accountLocal.balances = { assets: newAssets, total: total };
    accountLocal.web3Network = web3Network;
    saveLocal(account.address, accountLocal);
  }
  return newAccount;
};

/**
 * @desc parse account transactions response
 * @param  {String}   [data = null]
 * @param  {String}   [address = '']
 * @param  {String}   [web3Network = '']
 * @return {Promise}
 */
export const parseAccountTransactions = async (data = null, address = '', web3Network = '') => {
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
      let totalGas = BigNumber(`${tx.gasUsed}`)
        .times(BigNumber(`${tx.gasPrice}`))
        .toString();
      let txFee = {
        amount: totalGas,
        display: convertAmountToDisplay(totalGas, null, {
          symbol: 'ETH',
          decimals: 18
        })
      };
      const isTokenTransfer = (() => {
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
      interaction = !isTokenTransfer && tx.input !== '0x';
      if (isTokenTransfer) {
        if (tx.operations.length === 1) {
          const transfer = tx.operations[0];

          asset = {
            name: transfer.contract.name || 'Unknown Token',
            symbol: transfer.contract.symbol || '———',
            address: transfer.contract.address || '',
            decimals: transfer.contract.decimals || 18
          };

          from = transfer.from;
          to = transfer.to;
          const amount = convertAssetAmountToBigNumber(transfer.value, asset.decimals);
          value = { amount, display: convertAmountToDisplay(amount, null, asset) };
        }
      }
      let result = {
        hash,
        timestamp,
        from,
        to,
        error,
        interaction,
        value,
        txFee,
        native: null,
        pending: false,
        asset
      };
      if (tx.operations.length === 2) {
        let txOne = { ...result, hash: `${result.hash}-one` };
        let txTwo = { ...result, hash: `${result.hash}-two` };
        const transferTwo = tx.operations[1];
        txTwo.asset = {
          name: transferTwo.contract.name || 'Unknown Token',
          symbol: transferTwo.contract.symbol || '———',
          address: transferTwo.contract.address || '',
          decimals: transferTwo.contract.decimals || 18
        };
        txTwo.from = transferTwo.from;
        txTwo.to = transferTwo.to;
        const amount = convertAssetAmountToBigNumber(transferTwo.value, asset.decimals);
        txTwo.value = { amount, display: convertAmountToDisplay(amount, null, asset) };

        return [txOne, txTwo];
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
        web3Network === 'mainnet' ? `api` : web3Network
      }.trustwalletapp.com/transactions?address=${address}&limit=50&page=${data.page + 1}`
    );
    const newPageTransations = await parseAccountTransactions(
      newPageResponse.data,
      address,
      web3Network
    );
    _transactions = [..._transactions, ...newPageTransations];
  }
  const accountLocal = getLocal(address) || {};
  accountLocal.transactions = _transactions;
  accountLocal.web3Network = web3Network;
  saveLocal(address, accountLocal);

  return _transactions;
};

/**
 * @desc parse transactions from native prices
 * @param  {Object} [transactions=null]
 * @param  {Object} [nativeCurrency='']
 * @param  {String} [address='']
 * @param  {String} [web3Network='']
 * @return {String}
 */
export const parseTransactionsPrices = async (
  transactions = null,
  nativeSelected = '',
  address = '',
  web3Network = ''
) => {
  let _transactions = transactions;

  if (_transactions && _transactions.length && nativeSelected) {
    _transactions = await Promise.all(
      _transactions.map(async (tx, idx) => {
        const timestamp = tx.timestamp ? tx.timestamp.secs : Date.now();
        const assetSymbol = tx.asset.symbol;
        if (!tx.native || (tx.native && Object.keys(tx.native).length < 1)) {
          tx.native = { selected: nativeCurrencies[nativeSelected] };

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
                prices
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
  }

  const accountLocal = getLocal(address) || {};
  accountLocal.transactions = _transactions;
  const pending = _transactions ? _transactions.filter(tx => tx.pending) : [];
  accountLocal.web3Network = web3Network;
  accountLocal.pending = pending;
  saveLocal(address, accountLocal);

  return _transactions;
};

/**
 * @desc parse transactions from native prices
 * @param  {Object} [txDetails=null]
 * @param  {Object} [transactions=null]
 * @param  {Object} [nativeCurrency='']
 * @param  {String} [address='']
 * @param  {String} [web3Network='']
 * @return {String}
 */
export const parseNewTransaction = async (
  txDetails = null,
  transactions = null,
  nativeSelected = '',
  address = '',
  web3Network = ''
) => {
  let _transactions = [...transactions];

  let totalGas = BigNumber(`${txDetails.gasLimit}`)
    .times(BigNumber(`${txDetails.gasPrice}`))
    .toString();
  let txFee = {
    amount: totalGas,
    display: convertAmountToDisplay(totalGas, null, {
      symbol: 'ETH',
      decimals: 18
    })
  };

  let amount = '';
  if (txDetails.asset.symbol !== 'ETH') {
    amount = convertAssetAmountToBigNumber(txDetails.value, txDetails.asset.decimals);
  } else {
    amount = convertAmountToBigNumber(txDetails.value, txDetails.asset.decimals);
  }
  const value = { amount, display: convertAmountToDisplay(amount, null, txDetails.asset) };
  const nonce = txDetails.nonce || (await getTransactionCount(txDetails.from));

  let tx = {
    hash: txDetails.hash,
    timestamp: null,
    from: txDetails.from,
    to: txDetails.to,
    error: false,
    nonce: nonce,
    interaction: false,
    value: value,
    txFee: txFee,
    native: null,
    pending: true,
    asset: txDetails.asset
  };

  const timestamp = Date.now();
  const assetSymbol = tx.asset.symbol;
  tx.native = { selected: nativeCurrencies[nativeSelected] };

  const response = await apiGetHistoricalPrices(assetSymbol, timestamp);

  if (response.data.response === 'Error' || !response.data[assetSymbol]) {
    return tx;
  }

  await Promise.all(
    Object.keys(nativeCurrencies).map(async nativeCurrency => {
      const assetPriceAmount = convertAmountToBigNumber(response.data[assetSymbol][nativeCurrency]);
      let prices = { selected: nativeCurrencies[nativeCurrency] };
      prices[nativeCurrency] = {};
      prices[nativeCurrency][assetSymbol] = {
        price: { amount: assetPriceAmount, display: null }
      };
      const assetPriceDisplay = convertAmountToDisplay(assetPriceAmount, prices);
      prices[nativeCurrency][assetSymbol].price.display = assetPriceDisplay;
      const assetPrice = prices[nativeCurrency][assetSymbol].price;
      const valuePriceAmount = convertAssetAmountToNativeValue(tx.value.amount, tx.asset, prices);
      const valuePriceDisplay = convertAmountToDisplay(valuePriceAmount, prices);

      const valuePrice = !tx.error
        ? { amount: valuePriceAmount, display: valuePriceDisplay }
        : { amount: '', display: '' };
      const txFeePriceAmount = convertAssetAmountToNativeValue(tx.txFee.amount, tx.asset, prices);
      const txFeePriceDisplay = convertAmountToDisplay(txFeePriceAmount, prices);
      const txFeePrice = { amount: txFeePriceAmount, display: txFeePriceDisplay };

      tx.native[nativeCurrency] = {
        price: assetPrice,
        value: valuePrice,
        txFee: txFeePrice
      };
    })
  );

  _transactions = [tx, ..._transactions];

  const accountLocal = getLocal(address) || {};
  accountLocal.transactions = _transactions;
  const pending = _transactions.filter(tx => tx.pending);
  accountLocal.pending = pending;
  accountLocal.web3Network = web3Network;
  saveLocal(address, accountLocal);

  return _transactions;
};
