import lang from '../languages';
import {
  add,
  multiply,
  divide,
  convertAmountToBigNumber,
  convertAmountFromBigNumber,
  convertAmountToDisplay,
  convertAmountToDisplaySpecific,
  convertAssetAmountToNativeValue,
  convertAssetAmountToNativeAmount,
  convertStringToNumber,
  convertAssetAmountToBigNumber,
} from '../helpers/bignumber';
import { debounceRequest } from '../helpers/utilities';
import { getTransactionCount } from './web3';
import { getTimeString } from '../helpers/time';
import nativeCurrencies from '../references/native-currencies.json';
import ethUnits from '../references/ethereum-units.json';
import timeUnits from '../references/time-units.json';
import { apiGetHistoricalPrices, apiGetTransactionData } from './api';

/**
 * @desc parse error code message
 * @param  {Error} error
 * @return {String}
 */

export const parseError = error => {
  if (error) {
    const msgEnd =
      error.message.indexOf('\n') !== -1
        ? error.message.indexOf('\n')
        : error.message.length;
    let message = error.message.slice(0, msgEnd);
    if (
      error.message.includes('MetaMask') ||
      error.message.includes('Returned error:')
    ) {
      message = message
        .replace('Error: ', '')
        .replace('MetaMask ', '')
        .replace('Returned error: ', '');
      message =
        message.slice(0, 1).toUpperCase() + message.slice(1).toLowerCase();

      console.error(new Error(message));
      return message;
    } else if (message.indexOf('0x6801') !== -1) {
      message = lang.t('notification.error.generic_error');
    }
    console.error(error);
    return message;
  }
  return lang.t('notification.error.generic_error');
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
    fast: null,
  };
  if (!data) {
    gasPrices.fast = {
      option: 'fast',
      estimatedTime: {
        amount: '30000',
        display: getTimeString('30000', 'ms'),
      },
      value: {
        amount: '5000000000',
        display: '5 Gwei',
      },
    };
    gasPrices.fast.txFee = {
      value: {
        amount: multiply(gasPrices.fast.value.amount, gasLimit),
        display: convertAmountToDisplay(
          multiply(gasPrices.fast.value.amount, gasLimit),
          null,
          {
            symbol: 'ETH',
            decimals: 18,
          },
        ),
      },
      native: null,
    };

    gasPrices.average = {
      option: 'average',
      estimatedTime: {
        amount: '360000',
        display: getTimeString('360000', 'ms'),
      },
      value: {
        amount: '2000000000',
        display: '2 Gwei',
      },
    };
    gasPrices.average.txFee = {
      value: {
        amount: multiply(gasPrices.average.value.amount, gasLimit),
        display: convertAmountToDisplay(
          multiply(gasPrices.average.value.amount, gasLimit),
          null,
          {
            symbol: 'ETH',
            decimals: 18,
          },
        ),
      },
      native: null,
    };

    gasPrices.slow = {
      option: 'slow',
      estimatedTime: {
        amount: '1800000',
        display: getTimeString('1800000', 'ms'),
      },
      value: {
        amount: '1000000000',
        display: '1 Gwei',
      },
    };
    gasPrices.slow.txFee = {
      value: {
        amount: multiply(gasPrices.slow.value.amount, gasLimit),
        display: convertAmountToDisplay(
          multiply(gasPrices.slow.value.amount, gasLimit),
          null,
          {
            symbol: 'ETH',
            decimals: 18,
          },
        ),
      },
      native: null,
    };
  } else {
    gasPrices.fast = {
      option: 'fast',
      estimatedTime: {
        amount: multiply(data.fastWait, timeUnits.ms.minute),
        display: getTimeString(
          multiply(data.fastWait, timeUnits.ms.minute),
          'ms',
        ),
      },
      value: {
        amount: multiply(divide(data.fast, 10), ethUnits.gwei),
        display: `${divide(data.fast, 10)} Gwei`,
      },
    };
    gasPrices.fast.txFee = {
      value: {
        amount: multiply(gasPrices.fast.value.amount, gasLimit),
        display: convertAmountToDisplay(
          multiply(gasPrices.fast.value.amount, gasLimit),
          null,
          {
            symbol: 'ETH',
            decimals: 18,
          },
        ),
      },
      native: null,
    };
    gasPrices.average = {
      option: 'average',
      estimatedTime: {
        amount: multiply(data.avgWait, timeUnits.ms.minute),
        display: getTimeString(
          multiply(data.avgWait, timeUnits.ms.minute),
          'ms',
        ),
      },
      value: {
        amount: multiply(divide(data.average, 10), ethUnits.gwei),
        display: `${divide(data.average, 10)} Gwei`,
      },
    };
    gasPrices.average.txFee = {
      value: {
        amount: multiply(gasPrices.average.value.amount, gasLimit),
        display: convertAmountToDisplay(
          multiply(gasPrices.average.value.amount, gasLimit),
          null,
          {
            symbol: 'ETH',
            decimals: 18,
          },
        ),
      },
      native: null,
    };

    gasPrices.slow = {
      option: 'slow',
      estimatedTime: {
        amount: multiply(data.safeLowWait, timeUnits.ms.minute),
        display: getTimeString(
          multiply(data.safeLowWait, timeUnits.ms.minute),
          'ms',
        ),
      },
      value: {
        amount: multiply(divide(data.safeLow, 10), ethUnits.gwei),
        display: `${divide(data.safeLow, 10)} Gwei`,
      },
    };
    gasPrices.slow.txFee = {
      value: {
        amount: multiply(gasPrices.slow.value.amount, gasLimit),
        display: convertAmountToDisplay(
          multiply(gasPrices.slow.value.amount, gasLimit),
          null,
          {
            symbol: 'ETH',
            decimals: 18,
          },
        ),
      },
      native: null,
    };
  }
  if (prices && prices.selected) {
    gasPrices.fast.txFee.native = {
      selected: prices.selected,
      value: {
        amount: convertAssetAmountToNativeAmount(
          gasPrices.fast.txFee.value.amount,
          { symbol: 'ETH' },
          prices,
        ),
        display: convertAmountToDisplay(
          convertAssetAmountToNativeAmount(
            gasPrices.fast.txFee.value.amount,
            { symbol: 'ETH' },
            prices,
          ),
          prices,
          null,
          2,
        ),
      },
    };
    gasPrices.average.txFee.native = {
      selected: prices.selected,
      value: {
        amount: convertAssetAmountToNativeAmount(
          gasPrices.average.txFee.value.amount,
          { symbol: 'ETH' },
          prices,
        ),
        display: convertAmountToDisplay(
          convertAssetAmountToNativeAmount(
            gasPrices.average.txFee.value.amount,
            { symbol: 'ETH' },
            prices,
          ),
          prices,
          null,
          2,
        ),
      },
    };
    gasPrices.slow.txFee.native = {
      selected: prices.selected,
      value: {
        amount: convertAssetAmountToNativeAmount(
          gasPrices.slow.txFee.value.amount,
          { symbol: 'ETH' },
          prices,
        ),
        display: convertAmountToDisplay(
          convertAssetAmountToNativeAmount(
            gasPrices.slow.txFee.value.amount,
            { symbol: 'ETH' },
            prices,
          ),
          prices,
          null,
          2,
        ),
      },
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
      amount: multiply(gasPrices.fast.value.amount, gasLimit),
      display: convertAmountToDisplay(
        multiply(gasPrices.fast.value.amount, gasLimit),
        null,
        {
          symbol: 'ETH',
          decimals: 18,
        },
      ),
    },
    native: null,
  };
  gasPrices.average.txFee = {
    value: {
      amount: multiply(gasPrices.average.value.amount, gasLimit),
      display: convertAmountToDisplay(
        multiply(gasPrices.average.value.amount, gasLimit),
        null,
        {
          symbol: 'ETH',
          decimals: 18,
        },
      ),
    },
    native: null,
  };

  gasPrices.slow.txFee = {
    value: {
      amount: multiply(gasPrices.slow.value.amount, gasLimit),
      display: convertAmountToDisplay(
        multiply(gasPrices.slow.value.amount, gasLimit),
        null,
        {
          symbol: 'ETH',
          decimals: 18,
        },
      ),
    },
    native: null,
  };
  if (prices) {
    gasPrices.fast.txFee.native = {
      selected: prices.selected,
      value: {
        amount: convertAssetAmountToNativeAmount(
          gasPrices.fast.txFee.value.amount,
          { symbol: 'ETH' },
          prices,
        ),
        display: convertAmountToDisplay(
          convertAssetAmountToNativeAmount(
            gasPrices.fast.txFee.value.amount,
            { symbol: 'ETH' },
            prices,
          ),
          prices,
          null,
          2,
        ),
      },
    };
    gasPrices.average.txFee.native = {
      selected: prices.selected,
      value: {
        amount: convertAssetAmountToNativeAmount(
          gasPrices.average.txFee.value.amount,
          { symbol: 'ETH' },
          prices,
        ),
        display: convertAmountToDisplay(
          convertAssetAmountToNativeAmount(
            gasPrices.average.txFee.value.amount,
            { symbol: 'ETH' },
            prices,
          ),
          prices,
          null,
          2,
        ),
      },
    };
    gasPrices.slow.txFee.native = {
      selected: prices.selected,
      value: {
        amount: convertAssetAmountToNativeAmount(
          gasPrices.slow.txFee.value.amount,
          { symbol: 'ETH' },
          prices,
        ),
        display: convertAmountToDisplay(
          convertAssetAmountToNativeAmount(
            gasPrices.slow.txFee.value.amount,
            { symbol: 'ETH' },
            prices,
          ),
          prices,
          null,
          2,
        ),
      },
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
export const parsePricesObject = (
  data = null,
  assets = [],
  nativeSelected = 'USD',
) => {
  let prices = { selected: nativeCurrencies[nativeSelected] };
  Object.keys(nativeCurrencies).forEach(nativeCurrency => {
    prices[nativeCurrency] = {};
    assets.forEach(asset => {
      let assetPrice = null;
      if (data.RAW[asset]) {
        assetPrice = {
          price: {
            amount: convertAmountToBigNumber(
              data.RAW[asset][nativeCurrency].PRICE,
            ),
            display: convertAmountToDisplaySpecific(
              convertAmountToBigNumber(data.RAW[asset][nativeCurrency].PRICE),
              prices,
              nativeCurrency,
            ),
          },
          change: {
            amount: convertAmountToBigNumber(
              data.RAW[asset][nativeCurrency].CHANGEPCT24HOUR,
            ),
            display: convertAmountToDisplay(
              convertAmountToBigNumber(
                data.RAW[asset][nativeCurrency].CHANGEPCT24HOUR,
              ),
            ),
          },
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
  return prices;
};

/**
 * @desc parse account assets
 * @param  {Object} [data=null]
 * @param  {String} [address=null]
 * @return {Object}
 */
export const parseAccountAssets = (data = null, address = '') => {
  try {
    let assets = [...data];
    assets = assets.map(assetData => {
      const name =
        assetData.contract.name !== assetData.contract.address
          ? assetData.contract.name
          : assetData.contract.symbol || 'Unknown Token';
      const asset = {
        name: name,
        symbol: assetData.contract.symbol || '———',
        address: assetData.contract.address || null,
        decimals: convertStringToNumber(assetData.contract.decimals),
      };
      const assetBalance = convertAssetAmountToBigNumber(
        assetData.balance,
        asset.decimals,
      );
      return {
        ...asset,
        balance: {
          amount: assetBalance,
          display: convertAmountToDisplay(assetBalance, null, {
            symbol: asset.symbol,
            decimals: asset.decimals,
          }),
        },
        native: null,
      };
    });

    assets = assets.filter(
      asset => !!Number(asset.balance.amount) || asset.symbol === 'ETH',
    );

    return {
      address: address,
      type: '',
      assets: assets,
      total: null,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * @desc parse account balances from native prices
 * @param  {Object} [account=null]
 * @param  {Object} [prices=null]
 * @param  {String} [network='']
 * @return {Object}
 */
export const parseAccountBalancesPrices = (
  account = null,
  nativePrices = null,
  network = '',
) => {
  let totalAmount = 0;
  let newAccount = {
    ...account,
  };
  let nativeSelected = nativePrices.selected.currency;
  if (account) {
    const newAssets = account.assets.map(asset => {
      if (
        !nativePrices ||
        (nativePrices && !nativePrices[nativeSelected][asset.symbol])
      )
        return asset;

      const balanceAmountUnit = convertAmountFromBigNumber(
        asset.balance.amount,
        asset.decimals,
      );
      const balancePriceUnit = convertAmountFromBigNumber(
        nativePrices[nativeSelected][asset.symbol].price.amount,
      );
      const balanceRaw = multiply(balanceAmountUnit, balancePriceUnit);
      const balanceAmount = convertAmountToBigNumber(balanceRaw);
      const balanceDisplay = convertAmountToDisplay(
        balanceAmount,
        nativePrices,
      );
      const assetPrice = nativePrices[nativeSelected][asset.symbol].price;
      return {
        ...asset,
        native: {
          selected: nativePrices.selected,
          balance: { amount: balanceAmount, display: balanceDisplay },
          price: assetPrice,
          change:
            asset.symbol === nativePrices.selected.currency
              ? { amount: '0', display: '———' }
              : nativePrices[nativeSelected][asset.symbol].change,
        },
      };
    });
    totalAmount = newAssets.reduce(
      (total, asset) =>
        add(total, asset.native ? asset.native.balance.amount : 0),
      0,
    );
    const totalDisplay = convertAmountToDisplay(totalAmount, nativePrices);
    const total = { amount: totalAmount, display: totalDisplay };
    newAccount = {
      ...newAccount,
      assets: newAssets,
      total: total,
    };
  }
  return newAccount;
};

/**
 * @desc parse transactions from native prices
 * @param  {Object} [txDetails=null]
 * @param  {Object} [transactions=null]
 * @param  {Object} [nativeCurrency='']
 * @return {String}
 */
export const parseNewTransaction = async (
  txDetails = null,
  transactions = null,
  nativeCurrency = '',
) => {
  let _transactions = [...transactions];

  let totalGas = multiply(txDetails.gasLimit, txDetails.gasPrice);
  let txFee = {
    amount: totalGas,
    display: convertAmountToDisplay(totalGas, null, {
      symbol: 'ETH',
      decimals: 18,
    }),
  };

  const amount = convertAmountToBigNumber(
    txDetails.value,
    txDetails.asset.decimals,
  );
  const value = {
    amount,
    display: convertAmountToDisplay(amount, null, txDetails.asset),
  };
  const nonce =
    txDetails.nonce ||
    (txDetails.from ? await getTransactionCount(txDetails.from) : '');

  console.log('txdetails hash', txDetails.hash);
  let tx = {
    hash: txDetails.hash,
    timestamp: null,
    from: txDetails.from,
    to: txDetails.to,
    error: false,
    nonce: nonce,
    value: value,
    txFee: txFee,
    native: null,
    pending: true,
    asset: txDetails.asset,
  };

  const timestamp = Date.now();
  const assetSymbol = tx.asset.symbol;
  tx.native = { selected: nativeCurrencies[nativeCurrency] };

  const response = await apiGetHistoricalPrices(assetSymbol, timestamp);

  if (response.data.response !== 'Error' && response.data[assetSymbol]) {
    await Promise.all(
      Object.keys(nativeCurrencies).map(async nativeCurrency => {
        const assetPriceAmount = convertAmountToBigNumber(
          response.data[assetSymbol][nativeCurrency],
        );
        let prices = { selected: nativeCurrencies[nativeCurrency] };
        prices[nativeCurrency] = {};
        prices[nativeCurrency][assetSymbol] = {
          price: { amount: assetPriceAmount, display: null },
        };
        const assetPriceDisplay = convertAmountToDisplay(
          assetPriceAmount,
          prices,
        );
        prices[nativeCurrency][assetSymbol].price.display = assetPriceDisplay;
        const assetPrice = prices[nativeCurrency][assetSymbol].price;
        const valuePriceAmount = convertAssetAmountToNativeValue(
          tx.value.amount,
          tx.asset,
          prices,
        );
        const valuePriceDisplay = convertAmountToDisplay(
          valuePriceAmount,
          prices,
        );

        const valuePrice = !tx.error
          ? { amount: valuePriceAmount, display: valuePriceDisplay }
          : { amount: '', display: '' };
        const txFeePriceAmount = convertAssetAmountToNativeValue(
          tx.txFee.amount,
          tx.asset,
          prices,
        );
        const txFeePriceDisplay = convertAmountToDisplay(
          txFeePriceAmount,
          prices,
        );
        const txFeePrice = {
          amount: txFeePriceAmount,
          display: txFeePriceDisplay,
        };

        tx.native[nativeCurrency] = {
          price: assetPrice,
          value: valuePrice,
          txFee: txFeePrice,
        };
      }),
    );
  }

  console.log('parsed new tx', tx);
  _transactions = [tx, ..._transactions];

  return _transactions;
};

/**
 * @desc parse confirmed transaction
 * @param  {Object} [transactions=null]
 * @param  {String} [hash='']
 * @param  {String} [timestamp='']
 * @return {Array}
 */
export const parseConfirmedTransaction = (
  transactions = null,
  hash = '',
  timestamp = '',
) => {
  let _transactions = [];
  transactions.forEach(tx => {
    if (tx.hash.toLowerCase() === hash.toLowerCase()) {
      tx.pending = false;
      tx.timestamp = timestamp;
    }
    _transactions.push(tx);
  });
  return _transactions;
};

/**
 * @desc update successful shapeshift deposit
 * @param  {Object} [transactions=null]
 * @param  {String} [hash='']
 * @param  {String} [newHash='']
 * @return {Array}
 */
export const parseConfirmedDeposit = (
  transactions = null,
  hash = '',
  newHash = '',
) => {
  let _transactions = [];
  transactions.forEach(tx => {
    if (tx.hash.toLowerCase() === hash.toLowerCase()) {
      tx.pending = true;
      tx.hash = newHash;
    }
    _transactions.push(tx);
  });
  return _transactions;
};

/**
 * @desc update failed shapeshift deposit
 * @param  {Object} [transactions=null]
 * @param  {String} [hash='']
 * @return {Array}
 */
export const parseFailedDeposit = (transactions = null, hash = '') => {
  let _transactions = [];
  transactions.forEach(tx => {
    if (tx.hash.toLowerCase() !== hash.toLowerCase()) {
      _transactions.push(tx);
    }
  });
  return _transactions;
};

/**
 * @desc parse account transactions
 * @param  {Object} [data=null]
 * @param  {String} [address='']
 * @param  {String} [networks='']
 * @return {Array}
 */
export const parseAccountTransactions = async (
  data = null,
  address = '',
  network = '',
) => {
  if (!data || !data.docs) return [];

  let transactions = await Promise.all(
    data.docs.map(async (tx, idx) => {
      const hash = tx._id;
      const timestamp = {
        secs: `${tx.timeStamp}`,
        ms: `${tx.timeStamp}000`,
      };
      const error = !!tx.error;
      let from = tx.from;
      let to = tx.to;
      let asset = {
        name: 'Ethereum',
        symbol: 'ETH',
        address: null,
        decimals: 18,
      };
      let value = {
        amount: tx.value,
        display: convertAmountToDisplay(tx.value, null, {
          symbol: 'ETH',
          decimals: 18,
        }),
      };
      let totalGas = multiply(tx.gasUsed, tx.gasPrice);
      let txFee = {
        amount: totalGas,
        display: convertAmountToDisplay(totalGas, null, {
          symbol: 'ETH',
          decimals: 18,
        }),
      };

      const includesTokenTransfer = (() => {
        if (tx.operations.length) {
          const tokenTransfers = tx.operations.filter(
            operation => operation.type === 'token_transfer',
          );
          if (tokenTransfers.length) {
            return true;
          }
        }
        return false;
      })();

      let result = {
        hash,
        timestamp,
        from,
        to,
        error,
        value,
        txFee,
        native: {},
        pending: false,
        asset,
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
              value,
              txFee,
              native: {},
              pending: false,
              asset,
            };
            const name = !transferData.contract.name.startsWith('0x')
              ? transferData.contract.name
              : transferData.contract.symbol || 'Unknown Token';
            transferTx.asset = {
              name: name,
              symbol: transferData.contract.symbol || '———',
              address: transferData.contract.address || '',
              decimals: transferData.contract.decimals || 18,
            };

            transferTx.from = transferData.from;
            transferTx.to = transferData.to;
            const amount = convertAssetAmountToBigNumber(
              transferData.value,
              transferTx.asset.decimals,
            );
            transferTx.value = {
              amount,
              display: convertAmountToDisplay(amount, null, transferTx.asset),
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
    }),
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
    try {
      const newPageResponse = await apiGetTransactionData(
        address,
        network,
        data.page + 1,
      );
      const newPageTransations = await parseAccountTransactions(
        newPageResponse.data,
        address,
        network,
      );
      _transactions = [..._transactions, ...newPageTransations];
    } catch (error) {
      throw error;
    }
  }

  return _transactions;
};

/**
 * @desc parse transaction historical prices
 * @param  {Array} [transactions=null]
 * @return {Array}
 */
export const parseHistoricalPrices = async (transactions = null) => {
  if (!transactions.length) return transactions;
  const ethFeeAsset = {
    name: 'Ethereum',
    symbol: 'ETH',
    address: null,
    decimals: 18,
  };
  const _transactions = await Promise.all(
    transactions.map(async (tx, idx) => {
      const timestamp = tx.timestamp ? tx.timestamp.secs : Date.now();
      let assetSymbol = tx.asset.symbol;
      if (assetSymbol === 'WETH') {
        assetSymbol = 'ETH';
      }
      if (!tx.native || (tx.native && Object.keys(tx.native).length < 1)) {
        try {
          const priceAssets = [assetSymbol, 'ETH'];
          const promises = priceAssets.map(x =>
            debounceRequest(apiGetHistoricalPrices, [x, timestamp], 100 * idx),
          );
          const historicalPriceResponses = await Promise.all(promises);
          const response = historicalPriceResponses[0];
          const feeResponse = historicalPriceResponses[1];

          if (
            response.data.response === 'Error' ||
            !response.data[assetSymbol]
          ) {
            return tx;
          }

          Object.keys(nativeCurrencies).forEach(nativeCurrency => {
            const assetPriceAmount = convertAmountToBigNumber(
              response.data[assetSymbol][nativeCurrency],
            );
            let prices = { selected: nativeCurrencies[nativeCurrency] };
            prices[nativeCurrency] = {};
            prices[nativeCurrency][assetSymbol] = {
              price: { amount: assetPriceAmount, display: null },
            };
            const assetPriceDisplay = convertAmountToDisplay(
              assetPriceAmount,
              prices,
            );
            prices[nativeCurrency][
              assetSymbol
            ].price.display = assetPriceDisplay;

            const feePriceAmount = convertAmountToBigNumber(
              feeResponse.data['ETH'][nativeCurrency],
            );
            prices[nativeCurrency]['ETH'] = {
              price: { amount: feePriceAmount, display: null },
            };
            const feePriceDisplay = convertAmountToDisplay(
              feePriceAmount,
              prices,
            );
            prices[nativeCurrency]['ETH'].price.display = feePriceDisplay;
            const assetPrice = prices[nativeCurrency][assetSymbol].price;
            let asset = { ...tx.asset };
            if (asset.symbol === 'WETH') {
              asset.symbol = 'ETH';
            }
            const valuePriceAmount = convertAssetAmountToNativeValue(
              tx.value.amount,
              asset,
              prices,
            );
            const valuePriceDisplay = convertAmountToDisplay(
              valuePriceAmount,
              prices,
            );
            const valuePrice = !tx.error
              ? { amount: valuePriceAmount, display: valuePriceDisplay }
              : null;
            const txFeePriceAmount = convertAssetAmountToNativeValue(
              tx.txFee.amount,
              ethFeeAsset,
              prices,
              tx,
            );
            const txFeePriceDisplay = convertAmountToDisplay(
              txFeePriceAmount,
              prices,
            );
            const txFeePrice = {
              amount: txFeePriceAmount,
              display: txFeePriceDisplay,
            };

            tx.native[nativeCurrency] = {
              price: assetPrice,
              value: valuePrice,
              txFee: txFeePrice,
            };
          });
        } catch (error) {
          throw error;
        }
      }
      return tx;
    }),
  );
  return _transactions;
};
