import lang from '../languages';
import { get, pick } from 'lodash';
import {
  add,
  convertAmountFromBigNumber,
  convertAmountToBigNumber,
  convertAmountToDisplay,
  convertAmountToDisplaySpecific,
  convertAmountToUnformattedDisplay,
  convertAssetAmountToBigNumber,
  convertAssetAmountToNativeAmount,
  convertAssetAmountToNativeValue,
  convertStringToNumber,
  divide,
  multiply,
} from '../helpers/bignumber';
import ethUnits from '../references/ethereum-units.json';
import nativeCurrencies from '../references/native-currencies.json';
import timeUnits from '../references/time-units.json';
import { debounceRequest } from '../helpers/utilities';
import { getTransactionCount } from './web3';
import { getTimeString } from '../helpers/time';
import { apiGetHistoricalPrices } from './api';

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
export const getTxFee = (gasPrice, gasLimit) => {
  const amount = multiply(gasPrice, gasLimit);
  return {
    value: {
      amount,
      display: convertAmountToDisplay(amount, null, {
        symbol: 'ETH',
        decimals: 18,
      }),
    },
    native: null,
  };
};

export const defaultGasPriceFormat = (
  option,
  timeAmount,
  valueAmount,
  valueDisplay,
  short,
) => {
  return {
    option,
    estimatedTime: {
      amount: timeAmount,
      display: getTimeString(timeAmount, 'ms', short),
    },
    value: {
      amount: valueAmount,
      display: valueDisplay,
    },
  };
};

/**
 * @desc parse ether gas prices
 * @param {Object} data
 * @param {Object} prices
 * @param {Number} gasLimit
 */
export const parseGasPrices = (data, prices, gasLimit, short) => {
  const gasPrices = {
    slow: null,
    average: null,
    fast: null,
  };
  if (!data) {
    gasPrices.fast = defaultGasPriceFormat(
      'fast',
      '30000',
      '5000000000',
      '5 Gwei',
      short,
    );
    gasPrices.average = defaultGasPriceFormat(
      'average',
      '360000',
      '2000000000',
      '2 Gwei',
      short,
    );
    gasPrices.slow = defaultGasPriceFormat(
      'slow',
      '1800000',
      '1000000000',
      '1 Gwei',
      short,
    );
  } else {
    const fastTimeAmount = multiply(data.fastWait, timeUnits.ms.minute);
    const fastValueAmount = divide(data.fast, 10);
    gasPrices.fast = defaultGasPriceFormat(
      'fast',
      fastTimeAmount,
      multiply(fastValueAmount, ethUnits.gwei),
      `${fastValueAmount} Gwei`,
      short,
    );

    const avgTimeAmount = multiply(data.avgWait, timeUnits.ms.minute);
    const avgValueAmount = divide(data.average, 10);
    gasPrices.average = defaultGasPriceFormat(
      'average',
      avgTimeAmount,
      multiply(avgValueAmount, ethUnits.gwei),
      `${avgValueAmount} Gwei`,
      short,
    );

    const slowTimeAmount = multiply(data.safeLowWait, timeUnits.ms.minute);
    const slowValueAmount = divide(data.safeLow, 10);
    gasPrices.slow = defaultGasPriceFormat(
      'slow',
      slowTimeAmount,
      multiply(slowValueAmount, ethUnits.gwei),
      `${slowValueAmount} Gwei`,
      short,
    );
  }
  return parseGasPricesTxFee(gasPrices, prices, gasLimit);
};

export const convertGasPricesToNative = (prices, gasPrices) => {
  const nativeGases = { ...gasPrices };
  if (prices && prices.selected) {
    gasPrices.fast.txFee.native = getNativeGasPrice(
      prices,
      gasPrices.fast.txFee.value.amount,
    );
    gasPrices.average.txFee.native = getNativeGasPrice(
      prices,
      gasPrices.average.txFee.value.amount,
    );
    gasPrices.slow.txFee.native = getNativeGasPrice(
      prices,
      gasPrices.slow.txFee.value.amount,
    );
  }
  return nativeGases;
};

export const getNativeGasPrice = (prices, feeAmount) => {
  const amount = convertAssetAmountToNativeAmount(
    feeAmount,
    { symbol: 'ETH' },
    prices,
  );
  return {
    selected: prices.selected,
    value: {
      amount,
      display: convertAmountToDisplay(amount, prices, null, 2),
    },
  };
};

/**
 * @desc parse ether gas prices with updated gas limit
 * @param {Object} data
 * @param {Object} prices
 * @param {Number} gasLimit
 */
export const parseGasPricesTxFee = (gasPrices, prices, gasLimit) => {
  gasPrices.fast.txFee = getTxFee(gasPrices.fast.value.amount, gasLimit);
  gasPrices.average.txFee = getTxFee(gasPrices.average.value.amount, gasLimit);
  gasPrices.slow.txFee = getTxFee(gasPrices.slow.value.amount, gasLimit);
  return convertGasPricesToNative(prices, gasPrices);
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
      if (data.RAW && data.RAW[asset]) {
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
  // TODO: USD tracking selected
  let nativeSelected = nativePrices.selected.currency;
  //if (account && nativePrices && nativePrices.selected) {
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
    const totalTrackingAmount = convertAmountToUnformattedDisplay(
      totalAmount,
      nativePrices,
    );
    const total = {
      amount: totalAmount,
      display: totalDisplay,
      totalTrackingAmount,
    };
    newAccount = {
      ...newAccount,
      assets: newAssets,
      total: total,
    };
  }
  return newAccount;
};

/**
 * @desc parse unique tokens from opensea
 * @param  {Object}
 * @return {Array}
 */
export const parseAccountUniqueTokens = data =>
  get(data, 'data.assets', []).map(
    ({ asset_contract, background_color, token_id, ...asset }) => ({
      ...pick(asset, [
        'animation_url',
        'current_price',
        'description',
        'external_link',
        'image_original_url',
        'image_preview_url',
        'image_thumbnail_url',
        'image_url',
        'name',
        'permalink',
        'traits',
      ]),
      asset_contract: pick(asset_contract, [
        'address',
        'description',
        'external_link',
        'featured_image_url',
        'hidden',
        'image_url',
        'name',
        'nft_version',
        'schema_name',
        'short_description',
        'symbol',
        'total_supply',
        'wiki_link',
      ]),
      background: background_color ? `#${background_color}` : null,
      id: token_id,
      lastPrice: asset.last_sale
        ? Number(convertAmountFromBigNumber(asset.last_sale.total_price))
        : null,
    }),
  );

const ethFeeAsset = {
  name: 'Ethereum',
  symbol: 'ETH',
  address: null,
  decimals: 18,
};

/**
 * @desc get historical native prices for transaction
 * @param  {Object} tx
 * @return {Object}
 */
export const parseHistoricalNativePrice = async transaction => {
  let tx = { ...transaction };
  // TODO: error: Date.now() provides ms not secs
  const timestamp = tx.timestamp ? tx.timestamp.secs : Date.now();
  let asset = { ...tx.asset };
  asset.symbol = tx.asset.symbol === 'WETH' ? 'ETH' : tx.asset.symbol;
  const priceAssets = [asset.symbol, 'ETH'];
  const promises = priceAssets.map(x => apiGetHistoricalPrices(x, timestamp));
  const historicalPriceResponses = await Promise.all(promises);
  const response = historicalPriceResponses[0];
  const feeResponse = historicalPriceResponses[1];

  Object.keys(nativeCurrencies).forEach(nativeCurrency => {
    let prices = { selected: nativeCurrencies[nativeCurrency] };
    prices[nativeCurrency] = {};
    if (response.data.response !== 'Error' && response.data[asset.symbol]) {
      const assetPriceAmount = convertAmountToBigNumber(
        response.data[asset.symbol][nativeCurrency],
      );
      prices[nativeCurrency][asset.symbol] = {
        price: { amount: assetPriceAmount, display: null },
      };
      const assetPriceDisplay = convertAmountToDisplay(
        assetPriceAmount,
        prices,
      );
      prices[nativeCurrency][asset.symbol].price.display = assetPriceDisplay;
      const assetPrice = prices[nativeCurrency][asset.symbol].price;

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
        : { amount: '', display: '' };
      tx.native[nativeCurrency] = {
        price: assetPrice,
        value: valuePrice,
      };
    }

    if (
      tx.txFee &&
      feeResponse.data.response !== 'Error' &&
      feeResponse.data['ETH']
    ) {
      const feePriceAmount = convertAmountToBigNumber(
        feeResponse.data['ETH'][nativeCurrency],
      );
      prices[nativeCurrency]['ETH'] = {
        price: { amount: feePriceAmount, display: null },
      };
      const feePriceDisplay = convertAmountToDisplay(feePriceAmount, prices);
      prices[nativeCurrency]['ETH'].price.display = feePriceDisplay;

      const txFeePriceAmount = convertAssetAmountToNativeValue(
        tx.txFee.amount,
        ethFeeAsset,
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
        ...tx.native[nativeCurrency],
        txFee: txFeePrice,
      };
    }
  });

  return tx;
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
  nativeCurrency = '',
) => {
  let totalGas =
    txDetails.gasLimit && txDetails.gasPrice
      ? multiply(txDetails.gasLimit, txDetails.gasPrice)
      : null;
  let txFee = totalGas
    ? {
        amount: totalGas,
        display: convertAmountToDisplay(totalGas, null, {
          symbol: 'ETH',
          decimals: 18,
        }),
      }
    : null;

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

  let tx = {
    hash: txDetails.hash,
    timestamp: null,
    from: txDetails.from,
    to: txDetails.to,
    error: false,
    nonce: nonce,
    value: value,
    txFee: txFee,
    native: { selected: nativeCurrencies[nativeCurrency] },
    pending: txDetails.hash ? true : false,
    asset: txDetails.asset,
  };

  return await parseHistoricalNativePrice(tx);
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
  if (!data || !data.docs) return { transactions: [], pages: 0 };

  let transactions = await Promise.all(
    data.docs.map(async tx => {
      return await parseTransaction(tx);
    }),
  );
  let _transactions = [];

  transactions.forEach(tx => {
    tx.forEach(subTx => {
      _transactions.push(subTx);
    });
  });

  return { transactions: _transactions, pages: data.pages };
};

/**
 * @desc parse transaction
 * @param  {Object} [data=null]
 * @return {Array}
 */
export const parseTransaction = async tx => {
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
    if (tx.input !== '0x' && tx.operations && tx.operations.length) {
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
  let results = [result];

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
        const contractEnabled = get(transferData, 'contract.enabled', false);
        const contractName = get(transferData, 'contract.name', null);
        const name =
          contractEnabled && contractName && !contractName.startsWith('0x')
            ? contractName
            : get(transferData, 'contract.symbol', 'Unknown Token');
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
        results = [...tokenTransfers];
      } else {
        result.hash = `${result.hash}-0`;
        results = [...tokenTransfers, result];
      }
    }
  }

  return results;
};

/**
 * @desc parse transaction historical prices
 * @param  {Array} [transactions=null]
 * @return {Array}
 */
export const parseHistoricalTransactions = async (transactions, page) => {
  if (!transactions.length) return transactions;
  const pageOffset = (page - 1) * 2000;
  const _transactions = await Promise.all(
    transactions.map(async (tx, idx) => {
      if (!tx.native || (tx.native && Object.keys(tx.native).length < 1)) {
        const parsedTxn = await debounceRequest(
          parseHistoricalNativePrice,
          [tx],
          40 * idx + pageOffset,
        );
        return parsedTxn;
      }
      return tx;
    }),
  );
  return _transactions;
};
