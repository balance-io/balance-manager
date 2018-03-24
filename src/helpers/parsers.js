import BigNumber from 'bignumber.js';
import lang from '../languages';
import {
  hexToNumberString,
  convertStringToNumber,
  convertAmountToBigNumber,
  convertAmountFromBigNumber,
  convertAmountToDisplay,
  convertAssetAmountToBigNumber,
  convertAssetAmountToNativeValue,
  convertAssetAmountToNativeAmount,
  getTimeString,
  sha3
} from './utilities';
import nativeCurrencies from '../libraries/native-currencies.json';
import ethUnits from '../libraries/ethereum-units.json';
import timeUnits from '../libraries/time-units.json';
import { apiGetHistoricalPrices, apiGetEthplorerTokenInfo } from './api';

/**
 * @desc parse error code message
 * @param  {Error} error
 * @return {String}
 */

export const parseError = error => {
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
export const parsePricesObject = (data = null, assets = [], native = 'USD') => {
  let prices = { selected: nativeCurrencies[native] };
  assets.forEach(asset => {
    let assetPrice = null;
    if (data.RAW[asset]) {
      assetPrice = {
        price: {
          amount: convertAmountToBigNumber(data.RAW[asset][native].PRICE),
          display: convertAmountToDisplay(
            convertAmountToBigNumber(data.RAW[asset][native].PRICE),
            prices
          )
        },
        change: {
          amount: convertAmountToBigNumber(data.RAW[asset][native].CHANGEPCT24HOUR),
          display: convertAmountToDisplay(
            convertAmountToBigNumber(data.RAW[asset][native].CHANGEPCT24HOUR)
          )
        }
      };
    }
    prices[asset] = assetPrice;
  });
  prices['WETH'] = prices['ETH'];
  return prices;
};

/**
 * @desc parse ethplorer address info response
 * @param  {String}   [data = null]
 * @return {Promise}
 */
export const parseEthplorerAddressInfo = (data = null) => {
  const ethereumBalance =
    data && data.ETH.balance ? convertAmountToBigNumber(data.ETH.balance) : '0';
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
  if (data && data.tokens) {
    const tokens = data.tokens.map(token => {
      const tokenName = token.tokenInfo.name || lang.t('account.unknown_token');
      const tokenSymbol = token.tokenInfo.symbol || '———';
      const tokenAddress = token.tokenInfo.address || null;
      const tokenDecimals = convertStringToNumber(token.tokenInfo.decimals);
      const tokenBalance = convertAssetAmountToBigNumber(token.balance, token.tokenInfo.decimals);
      return {
        name: tokenName,
        symbol: tokenSymbol,
        address: tokenAddress,
        decimals: tokenDecimals,
        balance: {
          amount: tokenBalance,
          display: convertAmountToDisplay(tokenBalance, null, {
            symbol: tokenSymbol,
            decimals: tokenDecimals
          })
        },
        native: null
      };
    });
    assets = [...assets, ...tokens];
  }
  return {
    address: (data && data.address) || '',
    type: '',
    txCount: (data && data.countTxs) || 0,
    assets: assets,
    total: '———'
  };
};

/**
 * @desc parse account balances from native prices
 * @param  {Object} [account=null]
 * @param  {Object} [prices=null]
 * @return {String}
 */
export const parseAccountBalances = (account = null, nativePrices = null) => {
  let totalAmount = 0;

  if (account) {
    account.assets = account.assets.map(asset => {
      if (!nativePrices || (nativePrices && !nativePrices[asset.symbol])) return asset;

      const balanceAmountUnit = convertAmountFromBigNumber(asset.balance.amount, asset.decimals);
      const balancePriceUnit = convertAmountFromBigNumber(nativePrices[asset.symbol].price.amount);
      const balanceRaw = BigNumber(balanceAmountUnit)
        .times(BigNumber(balancePriceUnit))
        .toString();
      const balanceAmount = convertAmountToBigNumber(balanceRaw);
      const balanceDisplay = convertAmountToDisplay(balanceAmount, nativePrices);

      return {
        ...asset,
        native: {
          selected: nativePrices.selected,
          balance: { amount: balanceAmount, display: balanceDisplay },
          price: nativePrices[asset.symbol].price,
          change:
            asset.symbol !== nativePrices.selected.currency
              ? nativePrices[asset.symbol].change
              : { amount: '0', display: '0.00%' }
        }
      };
    });
    totalAmount = account.assets.reduce(
      (total, asset) =>
        BigNumber(`${total}`)
          .plus(BigNumber(asset.native ? asset.native.balance.amount : 0))
          .toString(),
      0
    );
    const totalDisplay = convertAmountToDisplay(totalAmount, nativePrices);

    account.total = { amount: totalAmount, display: totalDisplay };
  }
  return account;
};

/**
 * @desc parse etherscan account transactions response
 * @param  {String}   [data = null]
 * @return {Promise}
 */
export const parseEtherscanAccountTransactions = async (data = null) => {
  if (!data || !data.result) return null;

  const debounceApiGetEthplorerTokenInfo = (address, timeout) =>
    new Promise((resolve, reject) =>
      setTimeout(
        () =>
          apiGetEthplorerTokenInfo(address)
            .then(res => resolve(res))
            .catch(err => reject(err)),
        timeout
      )
    );

  let transactions = await Promise.all(
    data.result.map(async (tx, idx) => {
      const hash = tx.hash;
      const timestamp = tx.timeStamp;
      const blockNumber = tx.blockNumber;
      const txIndex = tx.transactionIndex;
      const error = tx.isError === '1';
      let interaction = false;
      const data = tx.input;
      const from = tx.from;
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
        amount: convertAmountFromBigNumber(totalGas),
        display: convertAmountToDisplay(convertAmountFromBigNumber(totalGas), null, {
          symbol: 'ETH',
          decimals: 18
        })
      };

      const tokenTransfer = sha3('transfer(address,uint256)').slice(0, 10);

      if (tx.input.startsWith(tokenTransfer)) {
        const response = await debounceApiGetEthplorerTokenInfo(tx.to, 100 * idx);

        asset = {
          name: !response.data.error || response.data.name ? response.data.name : 'Unknown Token',
          symbol: !response.data.error || response.data.symbol ? response.data.symbol : '———',
          address: !response.data.error ? response.data.address : '',
          decimals: !response.data.error ? convertStringToNumber(response.data.decimals) : 18
        };

        /* STT token on Ropsten */
        if (tx.to === '0xc55cf4b03948d7ebc8b9e8bad92643703811d162') {
          asset = {
            name: 'Status Test Token',
            symbol: 'STT',
            address: '0xc55cF4B03948D7EBc8b9E8BAD92643703811d162',
            decimals: 18
          };
        }

        to = `0x${tx.input.slice(34, 74)}`;
        const hexResult = hexToNumberString(`${tx.input.slice(74)}`);
        const amount = convertAssetAmountToBigNumber(hexResult, asset.decimals);
        value = { amount, display: convertAmountToDisplay(amount, null, asset) };
      } else if (tx.input !== '0x') {
        interaction = true;
      }

      const result = {
        hash,
        timestamp,
        blockNumber,
        txIndex,
        from,
        to,
        data,
        error,
        interaction,
        value,
        txFee,
        native: null,
        asset
      };
      return result;
    })
  );

  transactions = transactions.reverse();
  return transactions;
};

/**
 * @desc parse transactions from native prices
 * @param  {Object} [transactions=null]
 * @param  {Object} [nativeCurrency='']
 * @return {String}
 */
export const parseTransactionsPrices = async (transactions = null, nativeCurrency = '') => {
  let _transactions = transactions;

  const debounceApiGetHistoricalPrice = (assetSymbol, native, timestamp, timeout) =>
    new Promise((resolve, reject) =>
      setTimeout(
        () =>
          apiGetHistoricalPrices(assetSymbol, native, timestamp)
            .then(res => resolve(res))
            .catch(err => reject(err)),
        timeout
      )
    );

  if (
    _transactions &&
    _transactions.length &&
    nativeCurrency &&
    typeof nativeCurrency === 'string'
  ) {
    _transactions = await Promise.all(
      _transactions.map(async (tx, idx) => {
        const timestamp = tx.timestamp;
        const assetSymbol = tx.asset.symbol;
        const native = nativeCurrencies[nativeCurrency];
        const response = await debounceApiGetHistoricalPrice(
          assetSymbol,
          [nativeCurrency],
          timestamp,
          100 * idx
        );
        if (response.data.response === 'Error' || !response.data[assetSymbol]) {
          return tx;
        }
        let prices = { selected: native };
        const assetPriceAmount = convertAmountToBigNumber(
          response.data[assetSymbol][nativeCurrency]
        );
        prices[assetSymbol] = { price: { amount: assetPriceAmount, display: null } };
        const assetPriceDisplay = convertAmountToDisplay(assetPriceAmount, prices);
        prices[assetSymbol].price.display = assetPriceDisplay;
        const assetPrice = prices[assetSymbol].price;
        const valuePriceAmount = convertAssetAmountToNativeValue(tx.value.amount, tx.asset, prices);
        const valuePriceDisplay = convertAmountToDisplay(valuePriceAmount, prices);

        const valuePrice = !tx.error
          ? { amount: valuePriceAmount, display: valuePriceDisplay }
          : { amount: '', display: '' };
        const txFeePriceAmount = convertAssetAmountToNativeValue(tx.txFee.amount, tx.asset, prices);
        const txFeePriceDisplay = convertAmountToDisplay(txFeePriceAmount, prices);
        const txFeePrice = { amount: txFeePriceAmount, display: txFeePriceDisplay };

        tx.native = {
          selected: native,
          price: assetPrice,
          value: valuePrice,
          txFee: txFeePrice
        };
        return tx;
      })
    );
  }
  return _transactions;
};
