import axios from 'axios';
import { parseAccountBalances, parseAccountTransactions } from './parsers';
import { updateLocalBalances, updateLocalTransactions } from './utilities';
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
    'Content-Type': 'application/json'
  }
});

/**
 * @desc wallet connect create new session
 * @return {Promise}
 */
export const apiWalletConnectNewSession = () => walletConnect.post('/session/new');

/**
 * @desc wallet connect get session
 * @param  {String}   [sessionId = '']
 * @return {Promise}
 */
export const apiWalletConnectGetSession = (sessionId = '') =>
  walletConnect.get(`/session/${sessionId}`);

/**
 * @desc wallet connect initiate transaction
 * @param  {String}   [sessionId = '', data = '', dappName = '']
 * @return {Promise}
 */
export const apiWalletConnectNewTransaction = (
  sessionId: '',
  data: '',
  dappName: ''
) =>
  walletConnect.post(`/session/${sessionId}/transaction/new`, {
    data,
    dappName
  });

/**
 * @desc wallet connect get transaction status
 * @param  {String}   [sessionId = '', transactionIdd = '']
 * @return {Promise}
 */
export const apiWalletConnectGetTransactionStatus = (sessionId: '', transactionId: '') =>
  walletConnect.get(`/session/${sessionId}/transaction/${transactionId}/status`);
