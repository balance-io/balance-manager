import axios from 'axios';
import {
  parseHistoricalPrices,
  parseAccountAssets,
  parseAccountTransactions,
} from './parsers';
import { getTransactionByHash, getBlockByHash } from '../handlers/web3';
import { convertHexToString } from '../helpers/bignumber';
import networkList from '../references/ethereum-networks.json';
import nativeCurrencies from '../references/native-currencies.json';

/**
 * @desc get prices
 * @param  {Array}   [asset=[]]
 * @return {Promise}
 */
export const apiGetPrices = (assets = []) => {
  const assetsQuery = JSON.stringify(assets).replace(/[[\]"]/gi, '');
  const nativeQuery = JSON.stringify(Object.keys(nativeCurrencies)).replace(
    /[[\]"]/gi,
    '',
  );
  return axios.get(
    `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${assetsQuery}&tsyms=${nativeQuery}`,
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
  timestamp = Date.now(),
) => {
  const nativeQuery = JSON.stringify(Object.keys(nativeCurrencies)).replace(
    /[[\]"]/gi,
    '',
  );
  const url = `https://min-api.cryptocompare.com/data/pricehistorical?fsym=${assetSymbol}&tsyms=${nativeQuery}&ts=${timestamp}`;
  return axios.get(url);
};

/**
 * @desc get metmask selected network
 * @return {Promise}
 */
export const apiGetMetamaskNetwork = () =>
  new Promise((resolve, reject) => {
    if (typeof window.web3 !== 'undefined') {
      window.web3.version.getNetwork((err, networkID) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        let networkIDList = {};
        Object.keys(networkList).forEach(network => {
          networkIDList[networkList[network].id] = network;
        });
        resolve(networkIDList[Number(networkID)] || null);
      });
    }
  });

/**
 * @desc get transaction status
 * @param  {String}   [hash = '']
 * @param  {String}   [network = 'mainnet']
 * @return {Promise}
 */
export const apiGetTransactionStatus = async (
  hash = '',
  network = 'mainnet',
) => {
  try {
    let result = { data: null };
    let tx = await getTransactionByHash(hash);
    if (!tx || !tx.blockNumber || !tx.blockHash) return result;
    if (tx) {
      const blockData = await getBlockByHash(tx.blockHash);
      tx.timestamp = null;
      if (blockData) {
        const blockTimestamp = convertHexToString(blockData.timestamp);
        tx.timestamp = {
          secs: blockTimestamp,
          ms: `${blockTimestamp}000`,
        };
      }
    }
    result = { data: tx };
    return result;
  } catch (error) {
    throw error;
  }
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
) => {
  try {
    let { data } = await apiGetTransactionData(address, network, 1);
    let transactions = await parseAccountTransactions(data, address, network);
    if (transactions.length && lastTxHash) {
      let newTxs = true;
      transactions = transactions.filter(tx => {
        if (tx.hash === lastTxHash && newTxs) {
          newTxs = false;
          return false;
        } else if (tx.hash !== lastTxHash && newTxs) {
          return true;
        } else {
          return false;
        }
      });
    }
    transactions = await parseHistoricalPrices(transactions);
    const result = { data: transactions };
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * @desc get ethereum gas prices
 * @return {Promise}
 */
export const apiGetGasPrices = () => api.get(`/get_eth_gas_prices`);

/**
 * @desc shapeshift get coins
 * @return {Promise}
 */
export const apiShapeshiftGetCurrencies = () => api.get(`/get_currencies`);

/**
 * @desc shapeshift get market info
 * @param  {String}   [depositSelected = '']
 * @param  {String}   [withdrawalSelected = '']
 * @return {Promise}
 */
export const apiShapeshiftGetMarketInfo = (
  depositSelected = '',
  withdrawalSelected = '',
) =>
  api.get(
    `/get_market_info?deposit=${depositSelected}&withdrawal=${withdrawalSelected}`,
  );

/**
 * @desc shapeshift get fixed price
 * @param  {String}   [amount = '']
 * @param  {String}   [exchangePair = '']
 * @param  {String}   [address = '']
 * @return {Promise}
 */
export const apiShapeshiftGetFixedPrice = (
  amount = '',
  exchangePair = '',
  address = '',
) =>
  api.post(`/shapeshift_send_amount`, {
    amount,
    withdrawal: address,
    pair: exchangePair,
    returnAddress: address,
  });

/**
 * @desc shapeshift get quoted price
 * @param  {String}   [amount = '']
 * @param  {String}   [exchangePair = '']
 * @return {Promise}
 */
export const apiShapeshiftGetQuotedPrice = (amount = '', exchangePair = '') =>
  api.post(`/shapeshift_quoted_price_request`, {
    amount,
    pair: exchangePair,
  });

/**
 * @desc get candles for Ethereum graph
 * @return {Promise}
 */
export const apiGetEthereumGraph = () => {
  return axios.get('/candles');
};
