import axios from 'axios';
import { parseHistoricalPrices, parseAccountAssets, parseAccountTransactions } from './parsers';
import { infuraGetTransactionByHash, infuraGetBlockByHash } from '../handlers/infura';
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
  const nativeQuery = JSON.stringify(Object.keys(nativeCurrencies)).replace(/[[\]"]/gi, '');
  return axios.get(
    `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${assetsQuery}&tsyms=${nativeQuery}`
  );
};

/**
 * @desc get historical prices
 * @param  {String}  [assetSymbol='']
 * @param  {Number}  [timestamp=Date.now()]
 * @return {Promise}
 */
export const apiGetHistoricalPrices = (assetSymbol = '', timestamp = Date.now()) => {
  const nativeQuery = JSON.stringify(Object.keys(nativeCurrencies)).replace(/[[\]"]/gi, '');
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
export const apiGetTransactionStatus = async (hash = '', network = 'mainnet') => {
  try {
    let result = await infuraGetTransactionByHash(hash, network);
    if (!result || !result.blockNumber || !result.blockHash) return null;
    if (result) {
      const blockData = await infuraGetBlockByHash(result.blockHash, network);
      result.timestamp = null;
      if (blockData) {
        const blockTimestamp = convertHexToString(blockData.timestamp);
        result.timestamp = {
          secs: blockTimestamp,
          ms: `${blockTimestamp}000`
        };
      }
    }
    return { data: result };
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
    Accept: 'application/json'
  }
});

/**
 * @desc get account balances
 * @param  {String}   [address = '']
 * @param  {String}   [network = 'mainnet']
 * @return {Promise}
 */
export const apiGetAccountBalances = async (address = '', network = 'mainnet') => {
  try {
    const { data } = await api.get(`/get_balances/${network}/${address}`);
    const accountInfo = parseAccountAssets(data, address);
    return accountInfo;
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
export const apiGetTransactionData = (address = '', network = 'mainnet', page = 1) =>
  api.get(`/get_transactions/${network}/${address}/${page}`);

/**
 * @desc get account transactions
 * @param  {String}   [address = '']
 * @param  {String}   [network = 'mainnet']
 * @return {Promise}
 */
export const apiGetAccountTransactions = async (
  address = '',
  network = 'mainnet',
  lastTxHash = ''
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
    return transactions;
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
 * @desc shapeshift get fixed price
 * @param  {String}   [amount = '']
 * @param  {String}   [exchangePair = '']
 * @param  {String}   [address = '']
 * @return {Promise}
 */
export const apiShapeshiftGetFixedPrice = (amount = '', exchangePair = '', address = '') =>
  api.post(`/shapeshift_send_amount`, {
    amount,
    withdrawal: address,
    pair: exchangePair,
    returnAddress: address
  });

/**
 * @desc shapeshift get quoted price
 * @param  {String}   [depositSelected = '']
 * @param  {String}   [withdrawalSelected = '']
 * @param  {String}   [amount = '']
 * @param  {String}   [depositAmount = '']
 * @return {Promise}
 */
export const apiShapeshiftGetQuotedPrice = (
  depositSelected = '',
  withdrawalSelected = '',
  amount = '',
  depositAmount = ''
) => {
  const pair = `${depositSelected.toLowerCase()}_${withdrawalSelected.toLowerCase()}`;
  const body = { pair };
  if (amount) {
    body.amount = amount;
  } else if (depositAmount) {
    body.depositAmount = depositAmount;
  }
  return api.post(`/shapeshift_quoted_price_request`, body);
};
