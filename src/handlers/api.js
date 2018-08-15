import axios from 'axios';
import { formatInputDecimals } from '../helpers/bignumber';
import networkList from '../references/ethereum-networks.json';
import nativeCurrencies from '../references/native-currencies.json';

const cryptocompareApiKey = process.env.REACT_APP_CRYPTOCOMPARE_API_KEY || '';

/**
 * Configuration for cryptocompare api
 * @type axios instance
 */
const cryptocompare = axios.create({
  baseURL: 'https://min-api.cryptocompare.com/data/',
  timeout: 30000, // 30 secs
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * @desc get single asset price
 * @param  {String}   [asset='']
 * @param  {String}   [native='USD']
 * @return {Promise}
 */
export const apiGetSinglePrice = (asset = '', native = 'USD') => {
  return cryptocompare.get(
    `/price?fsym=${asset}&tsyms=${native}&apiKey=${cryptocompareApiKey}`,
  );
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
 * Configuration for shapeshift api
 * @type axios instance
 */
const shapeshift = axios.create({
  baseURL: 'https://shapeshift.io',
  timeout: 30000, // 30 secs
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * @desc shapeshift get coins
 * @return {Promise}
 */
export const apiShapeshiftGetCoins = () => shapeshift.get('/getcoins');

/**
 * @desc shapeshift get market info
 * @param  {String}   [pair = '']
 * @return {Promise}
 */
export const apiShapeshiftGetMarketInfo = (pair = '') =>
  shapeshift.get(`/marketinfo/${pair}`);

/**
 * @desc shapeshift get txn status of deposit address
 * @param  {String}   [depositAddress = '']
 * @return {Promise}
 */
export const apiShapeshiftGetDepositStatus = (depositAddress = '') =>
  shapeshift.get(`/txStat/${depositAddress}`);

/**
 * @desc shapeshift get fixed or quoted price
 * @param  {String}   [depositSymbol = '']
 * @param  {String}   [withdrawalSymbol = '']
 * @param  {String}   [depositAmount = '']
 * @param  {String}   [withdrawalAmount = '']
 * @return {Promise}
 */
export const apiShapeshiftSendAmount = async ({
  address = '',
  depositSymbol = '',
  withdrawalSymbol = '',
  depositAmount = '',
  withdrawalAmount = '',
}) => {
  try {
    const pair = `${depositSymbol.toLowerCase()}_${withdrawalSymbol.toLowerCase()}`;
    const marketInfo = await apiShapeshiftGetMarketInfo(pair);
    const min = marketInfo.data.minimum;
    const body = address
      ? {
          pair,
          withdrawal: address,
          returnAddress: address,
        }
      : { pair };
    if (withdrawalAmount) {
      body.amount = withdrawalAmount;
    } else if (depositAmount) {
      body.depositAmount = depositAmount;
    } else {
      body.depositAmount = min;
    }
    const shapeshiftApiKey = process.env.REACT_APP_SHAPESHIFT_API_KEY || '';
    if (shapeshiftApiKey) {
      body.apiKey = shapeshiftApiKey;
    }
    const response = await shapeshift.post(`/sendamount`, body);
    if (response.data.success) {
      response.data.success.min = min;
      return response;
    } else {
      /* Error Fallback */
      return {
        data: {
          success: {
            pair,
            depositAmount: '',
            withdrawalAmount: '',
            quotedRate: marketInfo.data.rate,
            maxLimit: marketInfo.data.maxLimit,
            min: marketInfo.data.minimum,
            minerFee: marketInfo.data.minerFee,
            error: response.data.error,
          },
        },
      };
    }
  } catch (error) {
    throw error;
  }
};

/**
 * @desc shapeshift get exchange details
 * @param  {Object}     [request = [object Object]]
 * @param  {String}     [inputOne = '']
 * @param  {String}     [inputTwo = '']
 * @param  {Boolean}    [withdrawal = false]
 * @return {Promise}
 */
export const apiShapeshiftGetExchangeDetails = ({
  request = {
    depositSymbol: '',
    withdrawalSymbol: '',
    withdrawalAmount: '',
  },
  inputOne = '',
  inputTwo = '',
  withdrawal = false,
}) =>
  apiShapeshiftSendAmount(request).then(({ data }) => {
    const inputTwoName = withdrawal ? 'depositAmount' : 'withdrawalAmount';
    let result = {};
    let exchangeDetails = null;
    exchangeDetails = data.success;
    result = { exchangeDetails };
    if (exchangeDetails.error) {
      inputTwo = '';
    } else if (!inputOne) {
      inputTwo = '';
    } else {
      inputTwo = exchangeDetails[inputTwoName] || '';
      inputTwo = formatInputDecimals(inputTwo, inputOne);
    }
    result[inputTwoName] = inputTwo;
    return result;
  });
