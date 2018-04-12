import axios from 'axios';
import { parseAccountBalances, parseAccountTransactions } from './parsers';
import { updateLocalBalances, updateLocalTransactions } from './utilities';
import networkList from '../libraries/ethereum-networks.json';
import nativeCurrencies from '../libraries/native-currencies.json';

/**
 * @desc TEST lambda function balance
 * @param  {String}   [address='']
 * @param  {String}   [netowkr='mainnet']
 * @return {Promise}
 */
export const apiLambdaGetBalance = (address = '', network = 'mainnet') =>
  axios.get(`/.netlify/functions/balance?address=${address}&network=${network}`);

/**
 * @desc TEST lambda function transactions
 * @param  {String}   [address='']
 * @param  {String}   [netowkr='mainnet']
 * @return {Promise}
 */
export const apiLambdaGetTransactions = (address = '', network = 'mainnet') =>
  axios.get(`/.netlify/functions/transactions?address=${address}&network=${network}`);

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
  return axios.get(
    `https://min-api.cryptocompare.com/data/pricehistorical?fsym=${assetSymbol}&tsyms=${nativeQuery}&ts=${timestamp}`
  );
};

/**
 * @desc get ethereum gas prices
 * @return {Promise}
 */
export const apiGetGasPrices = () =>
  axios.get(`https://ethgasstation.info/json/ethgasAPI.json`, { timeout: 10000 });

/**
 * @desc get metmask selected network
 * @return {Promise}
 */
export const apiGetMetamaskNetwork = () =>
  new Promise((resolve, reject) => {
    if (typeof window.web3 !== 'undefined') {
      window.web3.version.getNetwork((err, networkID) => {
        if (err) {
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
 * @desc get account balances
 * @param  {String}   [address = '']
 * @param  {String}   [network = 'mainnet']
 * @return {Promise}
 */
export const apiGetAccountBalances = async (address = '', network = 'mainnet') => {
  try {
    const { data } = await axios.get(
      `https://${
        network === 'mainnet' ? `api` : network
      }.trustwalletapp.com/tokens?address=${address}`
    );
    const account = await parseAccountBalances(data, address, network);
    updateLocalBalances(account, network);

    return account;
  } catch (error) {
    throw error;
  }
};

/**
 * @desc get account transactions
 * @param  {String}   [address = '']
 * @param  {String}   [network = 'mainnet']
 * @return {Promise}
 */
export const apiGetAccountTransactions = async (address = '', network = 'mainnet') => {
  try {
    const { data } = await axios.get(
      `https://${
        network === 'mainnet' ? `api` : network
      }.trustwalletapp.com/transactions?address=${address}&limit=50&page=1`
    );
    const transactions = await parseAccountTransactions(data, address, network);
    updateLocalTransactions(address, transactions, network);
    return transactions;
  } catch (error) {
    throw error;
  }
};

/**
 * Configuration for WalletConnect api instance
 * @type axios instance
 */
const walletConnect = axios.create({
  baseURL: 'https://walletconnect.balance.io',
  timeout: 30000, // 30 secs
  headers: {
    'Content-Type': 'application/json',
    Authorization: '&xFvdofLFGDPzk9LwWQEEpoqP^YFJ8ReGREe2VPWZsKKYcwnBndAA8xWncYgJDqm'
  }
});

/**
 * @desc wallet connect request device details
 * @return {Promise}
 */
export const apiWalletConnectInit = () => walletConnect.get('/request-device-details');

/**
 * @desc wallet connect get address
 * @param  {String}   [sessionToken = '']
 * @return {Promise}
 */
export const apiWalletConnectGetAddress = (sessionToken = '') =>
  walletConnect.post('/get-device-details', { sessionToken });

/**
 * @desc wallet connect initiate transaction
 * @param  {String}   [deviceUuid = '', encryptedTransactionDetails = '', notificationDetails = {}]
 * @return {Promise}
 */
export const apiWalletConnectInitiateTransaction = (
  deviceUuid: '',
  transactionDetails: '',
  notificationDetails: {}
) =>
  walletConnect.post('/add-transaction-details', {
    deviceUuid,
    transactionDetails,
    notificationDetails
  });

/**
 * @desc wallet connect get transaction status
 * @param  {String}   [deviceUuid = '', transactionUuid = '']
 * @return {Promise}
 */
export const apiWalletConnectGetTransactionStatus = (deviceUuid: '', transactionUuid: '') =>
  walletConnect.post('/get-transaction-status', {
    deviceUuid,
    transactionUuid
  });
