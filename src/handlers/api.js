import axios from 'axios';
import { findIndex, slice } from 'lodash';
import {
  parseAccountAssets,
  parseAccountTransactions,
  parseHistoricalTransactions,
} from './parsers';
import nativeCurrencies from '../references/native-currencies.json';

/**
 * @desc get single asset price
 * @param  {String}   [asset='']
 * @param  {String}   [native='USD']
 * @return {Promise}
 */
export const apiGetSinglePrice = (asset = '', native = 'USD') => {
  return cryptocompare.get(
    `/price?fsym=${asset}&tsyms=${native}&apiKey=${
      process.env.REACT_APP_CRYPTOCOMPARE_API_KEY
    }`,
  );
};

/**
 * Configuration for cryptocompare api
 * @type axios instance
 */
const cryptocompare = axios.create({
  baseURL: 'https://min-api.cryptocompare.com/data/',
  timeout: 30000, // 30 secs
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * @desc get all assets prices
 * @param  {Array}   [asset=[]]
 * @return {Promise}
 */
export const apiGetPrices = (assets = []) => {
  const assetsQuery = JSON.stringify(assets).replace(/[[\]"]/gi, '');
  const nativeQuery = JSON.stringify(Object.keys(nativeCurrencies)).replace(
    /[[\]"]/gi,
    '',
  );
  return cryptocompare.get(
    `/pricemultifull?fsyms=${assetsQuery}&tsyms=${nativeQuery}`,
  );
};

/**
 * @desc get historical prices
 * @param  {String}  [assetSymbol='']
 * @param  {Number}  [timestamp=Date.now()]
 * @return {Promise}
 */
export const apiGetHistoricalPrices = (
  assetSymbol = '',
  timestamp = Date.now(), // TODO error: timestamp would be ms
) => {
  const nativeQuery = JSON.stringify(Object.keys(nativeCurrencies)).replace(
    /[[\]"]/gi,
    '',
  );
  return cryptocompare.get(
    `/pricehistorical?fsym=${assetSymbol}&tsyms=${nativeQuery}&ts=${timestamp}&apiKey=${
      process.env.REACT_APP_CRYPTOCOMPARE_API_KEY
    }`,
  );
};

/**
 * Configuration for balance api
 * @type axios instance
 */
const api = axios.create({
  baseURL: 'https://indexer.balance.io',
  timeout: 30000, // 30 secs
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * @desc get account balances
 * @param  {String}   [address = '']
 * @param  {String}   [network = 'mainnet']
 * @return {Promise}
 */
export const apiGetAccountBalances = async (
  address = '',
  network = 'mainnet',
) => {
  try {
    const { data } = await api.get(`/get_balances/${network}/${address}`);
    const accountInfo = parseAccountAssets(data, address);
    const result = { data: accountInfo };
    return result;
  } catch (error) {
    console.log('Error getting acct balances from proxy', error);
    throw error;
  }
};

/**
 * @desc get transaction data
 * @param  {String}   [address = '']
 * @param  {String}   [network = 'mainnet']
 * @param  {Number}   [page = 1]
 * @return {Promise}
 */
export const apiGetTransactionData = (
  address = '',
  network = 'mainnet',
  page = 1,
) => api.get(`/get_transactions/${network}/${address}/${page}`);

/**
 * @desc get account transactions
 * @param  {String}   [address = '']
 * @param  {String}   [network = 'mainnet']
 * @return {Promise}
 */
export const apiGetAccountTransactions = async (
  address = '',
  network = 'mainnet',
  lastTxHash = '',
  page = 1,
) => {
  try {
    // TODO: hit api directly instead of through indexer
    let { data } = await apiGetTransactionData(address, network, page);
    let { transactions, pages } = await parseAccountTransactions(
      data,
      address,
      network,
    );
    if (transactions.length && lastTxHash) {
      const lastTxnHashIndex = findIndex(transactions, txn => {
        return txn.hash === lastTxHash;
      });
      if (lastTxnHashIndex > -1) {
        transactions = slice(transactions, 0, lastTxnHashIndex);
        pages = page;
      }
    }
    transactions = await parseHistoricalTransactions(transactions, page);
    const result = { data: transactions, pages };
    return result;
  } catch (error) {
    console.log('Error getting acct transactions', error);
    throw error;
  }
};

/**
 * @desc get ethereum gas prices
 * @return {Promise}
 */
export const apiGetGasPrices = () => api.get(`/get_eth_gas_prices`);
