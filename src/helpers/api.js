import axios from 'axios';
import {
  parseEthplorerAddressInfo,
  parseEthplorerAddressHistory,
  parseEtherscanAccountTransactions
} from './parsers';
import { testnetGetAddressInfo } from './testnet';
import networkList from '../libraries/ethereum-networks.json';
import nativeCurrencies from '../libraries/native-currencies.json';

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
 * @desc get ethplorer address info
 * @param  {String}   [address = '']
 * @param  {String}   [network = 'mainnet']
 * @return {Promise}
 */
export const apiGetEthplorerAddressInfo = (address = '', network = 'mainnet') => {
  if (network !== 'mainnet') {
    return testnetGetAddressInfo(address, network).then(data => parseEthplorerAddressInfo(data));
  }
  return axios
    .get(`https://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`)
    .then(({ data }) => parseEthplorerAddressInfo(data));
};

/**
 * @desc get ethplorer address info
 * @param  {String}   [address = '']
 * @param  {String}   [network = 'mainnet']
 * @return {Promise}
 */
export const apiGetEthplorerAddressHistory = (address = '', network = 'mainnet') => {
  if (network !== 'mainnet') {
    return null;
  }
  return new Promise((resolve, reject) => {
    axios
      .get(`https://api.ethplorer.io/getAddressHistory/${address}?apiKey=freekey`)
      .then(({ data }) =>
        parseEthplorerAddressHistory(data, address)
          .then(transactions => resolve(transactions))
          .catch(err => reject(err))
      );
  });
};

/**
 * @desc get ethplorer token info
 * @param  {String}   [address = '']
 * @return {Promise}
 */
export const apiGetEthplorerTokenInfo = (address = '') =>
  axios.get(`https://api.ethplorer.io/getTokenInfo/${address}?apiKey=freekey`);

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
 * @desc get ethplorer address info
 * @param  {String}   [address = '']
 * @param  {String}   [network = 'mainnet']
 * @return {Promise}
 */
export const apiGetEtherscanAccountTransactions = (address = '', network = 'mainnet') => {
  const subdomain = network === 'mainnet' ? `api` : `api-${network}`;
  return new Promise((resolve, reject) => {
    axios
      .get(
        `https://${subdomain}.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=8KDJ1H41UEGEA6CF4P8NEPUANQ3SE8HZGE`
      )
      .then(({ data }) =>
        parseEtherscanAccountTransactions(data, address)
          .then(transactions => resolve(transactions))
          .catch(err => reject(err))
      )
      .catch(err => reject(err));
  });
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
export const apiWalletConnectGetTransactionStatus = (
  deviceUuid: '',
  transactionUuid: ''
) =>
  walletConnect.post('/get-transaction-status', {
    deviceUuid,
    transactionUuid
  });
