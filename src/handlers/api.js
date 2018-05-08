import axios from 'axios';
import { parseHistoricalPrices } from './parsers';
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
 * @desc get ethereum gas prices
 * @return {Promise}
 */
export const apiGetGasPrices = () => axios.get(`https://ethgasstation.info/json/ethgasAPI.json`);

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
 * @desc get account balances
 * @param  {String}   [address = '']
 * @param  {String}   [network = 'mainnet']
 * @return {Promise}
 */
export const apiGetAccountBalances = async (address = '', network = 'mainnet') => {
  try {
    const { data } = await axios.get(
      `/.netlify/functions/balance?address=${address}&network=${network}`
    );
    return data;
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
export const apiGetAccountTransactions = async (
  address = '',
  network = 'mainnet',
  lastTxHash = ''
) => {
  try {
    let { data } = await axios.get(
      `/.netlify/functions/transactions?address=${address}&network=${network}&lastTxHash=${lastTxHash}`
    );
    data = await parseHistoricalPrices(data);
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * @desc get transaction status
 * @param  {String}   [hash = '']
 * @param  {String}   [network = 'mainnet']
 * @return {Promise}
 */
export const apiGetTransactionStatus = async (hash = '', network = 'mainnet') =>
  axios.get(`/.netlify/functions/transaction-status?hash=${hash}&network=${network}`);

/**
 * @desc shapeshift get coins
 * @return {Promise}
 */
export const apiShapeshiftGetCoins = () => axios.get(`/.netlify/functions/shapeshift-getcoins`);

/**
 * @desc shapeshift get market info
 * @param  {String}   [exchangePair = '']
 * @return {Promise}
 */
export const apiShapeshiftGetMarketInfo = (exchangePair = '') =>
  axios.get(`/.netlify/functions/shapeshift-marketinfo?exchangePair=${exchangePair}`);
