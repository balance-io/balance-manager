import axios from 'axios';
import { parseEthplorerAddressInfo } from './utilities';
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
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${cryptoQuery}&tsyms=${nativeQuery}`
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
        console.log('networkIDList', networkIDList);
        resolve(networkIDList[Number(networkID)] || null);
      });
    }
  });
