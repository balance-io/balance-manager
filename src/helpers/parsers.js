import BigNumber from 'bignumber.js';
import lang from '../languages';
import {
  debounceRequest,
  hexToNumberString,
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
import { getTimeString } from './time';
import nativeCurrencies from '../libraries/native-currencies.json';
import ethUnits from '../libraries/ethereum-units.json';
import timeUnits from '../libraries/time-units.json';
import smartContractMethods from '../libraries/smartcontract-methods.json';
import { apiGetHistoricalPrices, apiGetEthplorerTokenInfo } from './api';

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
      const asset = {
        name: token.tokenInfo.name || lang.t('account.unknown_token'),
        symbol: token.tokenInfo.symbol || '———',
        address: token.tokenInfo.address || null,
        decimals: convertStringToNumber(token.tokenInfo.decimals)
      };
      const allTokens = getLocal('token_info') || {};
      if (asset.symbol === '———' && !allTokens[asset.address]) {
        allTokens[asset.address] = asset;
      } else if (!allTokens[asset.symbol]) {
        allTokens[asset.symbol] = asset;
      }
      saveLocal('token_info', allTokens);
      const assetBalance = convertAssetAmountToBigNumber(token.balance, asset.decimals);
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
    });
    assets = [...assets, ...tokens];

    const accountLocal = getLocal(data.address) || {};
    accountLocal.balances = { assets, total: '———' };
    saveLocal(data.address, accountLocal);
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
    saveLocal(account.address, accountLocal);
  }
  return newAccount;
};

/**
 * @desc parse etherscan account transactions response
 * @param  {String}   [data = null]
 * @param  {String}   [address = '']
 * @return {Promise}
 */
export const parseEtherscanAccountTransactions = async (data = null, address = '') => {
  if (!data || !data.result) return null;

  let transactions = await Promise.all(
    data.result.map(async (tx, idx) => {
      const hash = tx.hash;
      const timestamp = {
        secs: tx.timeStamp,
        ms: `${tx.timeStamp}000`
      };
      const blockNumber = tx.blockNumber;
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
        amount: totalGas,
        display: convertAmountToDisplay(totalGas, null, {
          symbol: 'ETH',
          decimals: 18
        })
      };

      if (tx.input.startsWith(smartContractMethods.token_transfer.hash)) {
        const allTokens = getLocal('token_info') || {};
        let foundToken = null;
        Object.keys(allTokens).forEach(tokenSymbol => {
          if (allTokens[tokenSymbol].address === tx.to) {
            foundToken = allTokens[tokenSymbol];
          }
        });
        if (tx.to === '0xc55cf4b03948d7ebc8b9e8bad92643703811d162') {
          /* STT token on Ropsten */
          asset = {
            name: 'Status Test Token',
            symbol: 'STT',
            address: '0xc55cF4B03948D7EBc8b9E8BAD92643703811d162',
            decimals: 18
          };
        } else if (foundToken) {
          asset = foundToken;
        } else {
          const response = await apiGetEthplorerTokenInfo(tx.to);

          asset = {
            name: !response.data.error || response.data.name ? response.data.name : 'Unknown Token',
            symbol: !response.data.error || response.data.symbol ? response.data.symbol : '———',
            address: !response.data.error ? response.data.address : '',
            decimals: !response.data.error ? convertStringToNumber(response.data.decimals) : 18
          };

          if (asset.symbol === '———' && !allTokens[asset.address]) {
            allTokens[asset.address] = asset;
          } else if (!allTokens[asset.symbol]) {
            allTokens[asset.symbol] = asset;
          }
          saveLocal('token_info', allTokens);
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

  const accountLocal = getLocal(address) || {};
  accountLocal.transactions = transactions;
  saveLocal(address, accountLocal);

  return transactions;
};

/**
 * @desc parse transactions from native prices
 * @param  {Object} [transactions=null]
 * @param  {Object} [nativeCurrency='']
 * @param  {String} [address='']
 * @return {String}
 */
export const parseTransactionsPrices = async (
  transactions = null,
  nativeSelected = '',
  address = ''
) => {
  let _transactions = transactions;

  if (_transactions && _transactions.length && nativeSelected) {
    _transactions = await Promise.all(
      _transactions.map(async (tx, idx) => {
        const timestamp = tx.timestamp.secs;
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
  saveLocal(address, accountLocal);

  return _transactions;
};

/**
 * @desc parse websocket pending transaction objects
 * @param  {Object}   [tx = null]
 * @param  {String}   [address = '']
 * @return {Promise}
 */
export const parseWebsocketTransaction = async (tx = null, address = '') => {
  let result = null;
  const hash = tx.hash;
  const blockNumber = tx.blockNumber;
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
  let totalGas = BigNumber(`${tx.gas}`)
    .times(BigNumber(`${tx.gasPrice}`))
    .toString();
  let txFee = {
    amount: totalGas,
    display: convertAmountToDisplay(totalGas, null, {
      symbol: 'ETH',
      decimals: 18
    })
  };
  if (tx.input.startsWith(smartContractMethods.token_transfer.hash)) {
    const allTokens = getLocal('token_info') || {};
    let foundToken = null;
    Object.keys(allTokens).forEach(tokenSymbol => {
      if (allTokens[tokenSymbol].address === tx.to) {
        foundToken = allTokens[tokenSymbol];
      }
    });
    if (tx.to === '0xc55cf4b03948d7ebc8b9e8bad92643703811d162') {
      /* STT token on Ropsten */
      asset = {
        name: 'Status Test Token',
        symbol: 'STT',
        address: '0xc55cF4B03948D7EBc8b9E8BAD92643703811d162',
        decimals: 18
      };
    } else if (foundToken) {
      asset = foundToken;
    } else {
      const response = await apiGetEthplorerTokenInfo(tx.to);

      asset = {
        name: !response.data.error || response.data.name ? response.data.name : 'Unknown Token',
        symbol: !response.data.error || response.data.symbol ? response.data.symbol : '———',
        address: !response.data.error ? response.data.address : '',
        decimals: !response.data.error ? convertStringToNumber(response.data.decimals) : 18
      };

      if (asset.symbol === '———' && !allTokens[asset.address]) {
        allTokens[asset.address] = asset;
      } else if (!allTokens[asset.symbol]) {
        allTokens[asset.symbol] = asset;
      }
      saveLocal('token_info', allTokens);
    }

    to = `0x${tx.input.slice(34, 74)}`;
    const hexResult = hexToNumberString(`${tx.input.slice(74)}`);
    const amount = convertAssetAmountToBigNumber(hexResult, asset.decimals);
    value = { amount, display: convertAmountToDisplay(amount, null, asset) };
  } else if (tx.input !== '0x') {
    interaction = true;
  }
  result = {
    hash,
    timestamp: null,
    blockNumber,
    from,
    to,
    data,
    error: null,
    interaction,
    value,
    txFee,
    native: null,
    asset
  };

  if (tx.to === address || tx.from === address) {
    return result;
  } else {
    return null;
  }
};
