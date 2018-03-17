import axios from 'axios';
import { parseTokenBalances, handleDecimals } from './utilities';
import ethereumNetworks from '../libraries/ethereum-networks';

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
      const ethereum = {
        name: 'Ethereum',
        symbol: 'ETH',
        address: null,
        decimals: 18,
        balance: data.ETH.balance ? handleDecimals(data.ETH.balance) : '0.00000000',
        native: null
      };
      let crypto = [ethereum];
      if (data.tokens) {
        const tokens = data.tokens.map(token => {
          const balance = parseTokenBalances(token.balance, token.tokenInfo.decimals);
          return {
            name: token.tokenInfo.name || 'Unknown Token',
            symbol: token.tokenInfo.symbol || '---',
            address: token.tokenInfo.address,
            decimals: Number(token.tokenInfo.decimals),
            balance: handleDecimals(balance),
            native: null
          };
        });
        crypto = [...crypto, ...tokens];
      }
      return {
        address,
        type,
        crypto,
        totalNative: '---'
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
    const networks = Object.keys(ethereumNetworks);
    if (typeof window.web3 !== 'undefined') {
      window.web3.version.getNetwork((err, networkID) => {
        if (err) {
          reject(err);
        }
        resolve(networks[Number(networkID) - 1] || null);
      });
    }
  });
