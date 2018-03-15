import axios from 'axios';
import { parseTokenBalances } from './utilities';

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
 * @desc get ethplorer address information
 * @param  {String}   [address = '']
 * @param  {String}   [type = 'METAMASK']
 * @return {Promise}
 */
export const apiGetEthplorerInfo = (address = '', type = 'METAMASK') =>
  axios
    .get(`https://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`)
    .then(({ data }) => {
      const balance = data.ETH.balance || '0.00000000';
      const tokens = data.tokens
        ? data.tokens.map(token => {
            const balance = parseTokenBalances(token.balance, token.tokenInfo.decimals);
            return {
              name: token.tokenInfo.name,
              symbol: token.tokenInfo.symbol,
              balance: balance
            };
          })
        : null;
      return {
        address,
        type,
        balance,
        tokens
      };
    });

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
        if (Number(networkID) === 1) {
          resolve('mainnet');
        } else {
          resolve(null);
        }
      });
    }
  });
