import BigNumber from 'bignumber.js';
import {
  convertAmountToBigNumber,
  convertAmountFromBigNumber,
  convertAmountToDisplay,
  convertAmountToDisplaySpecific,
  convertAssetAmountToBigNumber,
  convertAssetAmountToNativeValue,
  convertAssetAmountToNativeAmount
} from './bignumber';
import { getTransactionCount } from './web3';
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
  return prices;
};

/**
 * @desc parse account balances from native prices
 * @param  {Object} [account=null]
 * @param  {Object} [prices=null]
 * @param  {String} [network='']
 * @return {String}
 */
export const parseAccountBalancesPrices = (account = null, nativePrices = null, network = '') => {
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
            asset.symbol === nativePrices.selected.currency ||
            !Number(nativePrices[nativeSelected][asset.symbol].change.amount)
              ? { amount: '0', display: '———' }
              : nativePrices[nativeSelected][asset.symbol].change
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
  }
  return newAccount;
};

/**
 * @desc parse transactions from native prices
 * @param  {Object} [txDetails=null]
 * @param  {Object} [transactions=null]
 * @param  {Object} [nativeCurrency='']
 * @param  {String} [address='']
 * @param  {String} [network='']
 * @return {String}
 */
export const parseNewTransaction = async (
  txDetails = null,
  transactions = null,
  nativeSelected = ''
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

  return _transactions;
};

/**
 * @desc parse confirmed transaction
 * @param  {Object} [transactions=null]
 * @param  {String} [hash='']
 * @return {String}
 */
export const parseConfirmedTransaction = (transactions, hash, timestamp) => {
  let _transactions = [];
  transactions.forEach(tx => {
    if (tx.hash === hash) {
      tx.pending = false;
      tx.timestamp = timestamp;
    }
    _transactions.push(tx);
  });
  return _transactions;
};
