import axios from 'axios';
import { parseEthplorerAddressInfo, parseEtherscanAccountTransactions } from './parsers';
import { testnetGetAddressInfo } from './testnet';
import networkList from '../libraries/ethereum-networks';

/**
 * @desc get prices
 * @param  {Array}   [crypto=[]]
 * @param  {Array}   [native=[]]
 * @return {Promise}
 */
export const apiGetPrices = (crypto = [], native = []) => {
  const cryptoQuery = JSON.stringify(crypto).replace(/[[\]"]/gi, '');
  const nativeQuery = JSON.stringify(native).replace(/[[\]"]/gi, '');
  return axios.get(
    `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${cryptoQuery}&tsyms=${nativeQuery}`
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
        parseEtherscanAccountTransactions(data)
          .then(transactions => resolve(transactions))
          .catch(err => reject(err))
      )
      .catch(err => reject(err));
  });
};
