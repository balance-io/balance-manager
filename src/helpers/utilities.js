import BigNumber from 'bignumber.js';
import { web3Instance } from './web3';
import nativeCurrencies from '../libraries/native-currencies.js';

/**
 * @desc save to local storage
 * @param  {String}  [key='']
 * @param  {Object}  [data={}]
 * @return {Object}
 */
export const saveLocal = (key = '', data = {}) => localStorage.setItem(key, JSON.stringify(data));

/**
 * @desc get from local storage
 * @param  {String}  [key='']
 * @return {Object}
 */
export const getLocal = (key = '') => JSON.parse(localStorage.getItem(key));

/**
 * @desc get from local storage
 * @param  {String}  [key='']
 * @return {Object}
 */
export const removeLocal = (key = '') => localStorage.removeItem(key);

/**
 * @desc create authenticated user session
 * @param  {String}   [token='']
 * @param  {String}   [email='']
 * @param  {Boolean}  [verified=false]
 * @param  {Boolean}  [twoFactor=false]
 * @param  {Date}     [expires=Date.now() + 180000]
 * @param  {Array}    [accounts=[]]
 * @param  {Array}    [crypto=[]]
 * @param
 * @return {Session}
 */
export const setSession = ({
  token = '',
  email = '',
  verified = false,
  twoFactor = false,
  expires = Date.now() + 1800000, // 30mins
  accounts = [],
  crypto = []
}) => {
  const session = {
    token,
    email,
    verified,
    twoFactor,
    expires,
    accounts,
    crypto
  };
  setTimeout(() => window.browserHistory.push('/signout'), 1800000); // 30mins
  localStorage.setItem('USER_SESSION', JSON.stringify(session));
};

/**
 * @desc get session as an object
 * @return {Object}
 */
export const getSession = () => {
  const session = localStorage.getItem('USER_SESSION');
  return JSON.parse(session);
};

/**
 * @desc update with new session data
 * @param  {Session}  [updatedSession]
 * @return {Session}
 */
export const updateSession = updatedSession => {
  const newSession = { ...getSession(), ...updatedSession };
  return localStorage.setItem('USER_SESSION', JSON.stringify(newSession));
};

/**
 * @desc flatten tokens
 * @param  {Object} [accounts]
 * @return {String}
 */
export const flattenTokens = accounts => {
  const crypto = ['ETH'];
  for (let i = 0; i < accounts.length; i++) {
    if (accounts[i].tokens) {
      for (let j = 0; j < accounts[i].tokens.length; j++) {
        if (!crypto.includes(accounts[i].tokens[j].symbol)) {
          crypto.push(accounts[i].tokens[j].symbol);
        }
      }
    }
  }
  return crypto;
};

/**
 * @desc update accounts
 * @param  {Object}  [account=null]
 * @param  {String}  [address='']
 * @return {Session}
 */
export const updateAccounts = (account = null, address = '') => {
  const accountAddress = account ? account.address : address;
  const prevAccounts = getSession().accounts;
  const accounts = [];
  let isNew = true;
  for (let i = 0; i < prevAccounts.length; i++) {
    if (prevAccounts[i].address === accountAddress) {
      if (account && !address) {
        isNew = false;
        accounts.push(account);
      }
    } else {
      accounts.push(prevAccounts[i]);
    }
  }
  if (account && isNew) {
    accounts.push(account);
  }
  const crypto = flattenTokens(accounts);
  updateSession({ accounts, crypto });
  return { accounts, crypto };
};

/**
 * @desc delete session
 * @return {Void}
 */
export const deleteSession = () => {
  localStorage.removeItem('USER_SESSION');
};

/**
 * @desc capitalize string
 * @param  {String} [string]
 * @return {String}
 */
export const capitalize = string =>
  string
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

/**
 * @desc convert from current native value to crypto value
 * @param  {String} [nativeValue='']
 * @param  {String} [cryptoSymbol='ETH']
 * @param  {Object} [prices=null]
 * @return {Number}
 */
export const convertFromNativeValue = (nativeValue = '', cryptoSymbol = 'ETH', prices = null) => {
  if (!prices || (prices && !prices[cryptoSymbol])) return null;
  return Number(Number(Number(nativeValue) / Number(prices[cryptoSymbol].price)).toFixed(8));
};

/**
 * @desc convert cryptoSymbol value to current native value
 * @param  {String} [value='']
 * @param  {String} [cryptoSymbol='ETH']
 * @param  {Object} [prices=null]
 * @return {Number}
 */
export const convertToNativeValue = (value = '', cryptoSymbol = 'ETH', prices = null) => {
  if (!prices || (prices && !prices[cryptoSymbol])) return null;
  return Number(Number(Number(value) * Number(prices[cryptoSymbol].price)).toFixed(8));
};

/**
 * @desc convert crypto value to current native string
 * @param  {String} [value='']
 * @param  {String} [crypto='ETH']
 * @param  {Object} [prices=null]
 * @return {String}
 */
export const convertToNativeString = (value = '', cryptoSymbol = 'ETH', prices = null) => {
  if (!prices || (prices && !prices[cryptoSymbol])) return '';
  if (prices.native === 'ETH' || prices.native === 'BTC') {
    const nativeSymbol = prices.native;
    const decimals = 8;
    const nativeValue = convertToNativeValue(value, cryptoSymbol, prices);
    const formatted = BigNumber(nativeValue).toFormat(decimals);
    return `${formatted} ${nativeSymbol}`;
  } else {
    const nativeSymbol = nativeCurrencies[prices.native].symbol;
    const decimals = 2;
    const nativeValue = convertToNativeValue(value, cryptoSymbol, prices);
    const formatted = BigNumber(nativeValue).toFormat(decimals);
    return `${nativeSymbol}${formatted}`;
  }
};

/**
 * @desc convert token amount to unit
 * @param  {String} [amount='']
 * @param  {Number} [decimals=18]
 * @return {Number}
 */
export const convertTokenAmountToUnit = (amount = '', decimals = 18) => {
  const _amount = `${amount}`;
  if (!Number(_amount)) return null;
  return BigNumber(_amount)
    .dividedBy(new BigNumber(10).pow(decimals))
    .toNumber();
};

/**
 * @desc convert token amount from unit
 * @param  {String} [amount='']
 * @param  {Number} [decimals=8]
 * @return {Number}
 */
export const convertTokenAmountFromUnit = (amount = '', decimals = 18) => {
  const _amount = `${amount}`;
  if (!Number(_amount)) return null;
  return BigNumber(_amount)
    .times(new BigNumber(10).pow(decimals))
    .toNumber();
};

/**
 * @desc format native value to string
 * @param  {String} [value='']
 * @param  {Object} [native=null]
 * @return {String}
 */
export const formatNativeString = (value = '', native = 'USD') => {
  const _value = Number(value).toFixed(8);
  if (native === 'ETH' || native === 'BTC') {
    const nativeSymbol = native;
    const decimals = 8;
    const formatted = BigNumber(_value).toFormat(decimals);
    return `${formatted} ${nativeSymbol}`;
  } else {
    const nativeSymbol = nativeCurrencies[native].symbol;
    const decimals = 2;
    const formatted = BigNumber(_value).toFormat(decimals);
    return `${nativeSymbol}${formatted}`;
  }
};

/**
 * @desc format crypto prices 24hr percentage change
 * @param  {String} [cryptoSymbol=null]
 * @param  {Object} [prices=null]
 * @return {String}
 */
export const formatPercentageChange = (cryptoSymbol, prices) => {
  if (!prices || (prices && !prices[cryptoSymbol])) return '';
  const percentageChange = Number(prices[cryptoSymbol].change).toFixed(8);
  const formatted = BigNumber(percentageChange).toFormat(2);
  return `${formatted}%`;
};

/**
 * @desc pad string to specific width and padding
 * @param  {String} n
 * @param  {Number} width
 * @param  {String} z
 * @return {String}
 */
export const padLeft = (n, width, z) => {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

/**
 * @desc get ethereum contract call data string
 * @param  {String} func
 * @param  {Array}  arrVals
 * @return {String}
 */
export const getDataString = (func, arrVals) => {
  let val = '';
  for (let i = 0; i < arrVals.length; i++) val += padLeft(arrVals[i], 64);
  const data = func + val;
  return data;
};

/**
 * @desc get naked ethereum address
 * @param  {String} address
 * @return {String}
 */
export const getNakedAddress = address => address.toLowerCase().replace('0x', '');

/**
 * @desc convert to checksum addres
 * @param  {String} address
 * @return {String}
 */
export const toChecksumAddress = address => {
  if (typeof address === 'undefined') return '';

  address = address.toLowerCase().replace('0x', '');
  const addressHash = web3Instance.utils.sha3(address).replace('0x', '');
  let checksumAddress = '0x';

  for (let i = 0; i < address.length; i++) {
    if (parseInt(addressHash[i], 16) > 7) {
      checksumAddress += address[i].toUpperCase();
    } else {
      checksumAddress += address[i];
    }
  }
  return checksumAddress;
};

/**
 * @desc check if address is checkum
 * @param  {String} address
 * @return {String}
 */
export const isChecksumAddress = address => address === toChecksumAddress(address);

/**
 * @desc sanitize hexadecimal string
 * @param  {String} address
 * @return {String}
 */
export const sanitizeHex = hex => {
  hex = hex.substring(0, 2) === '0x' ? hex.substring(2) : hex;
  if (hex === '') return '';
  hex = hex.length % 2 !== 0 ? '0' + hex : hex;
  return '0x' + hex;
};

/**
 * @desc convert from wei to ether
 * @param  {Number} wei
 * @return {String}
 */
export const fromWei = wei => web3Instance.utils.fromWei(String(wei));

/**
 * @desc convert from ether to wei
 * @param  {Number} ether
 * @return {String}
 */
export const toWei = ether => web3Instance.utils.toWei(String(ether));

/**
 * @desc hash string with sha3
 * @param  {String} string
 * @return {String}
 */
export const sha3 = string => web3Instance.utils.sha3(string);

/**
 * @desc convert hex to number string
 * @param  {String} string
 * @return {String}
 */
export const hexToNumberString = string => web3Instance.utils.hexToNumberString(string);

/**
 * @desc returns url parameter value
 * @param  {String} parameter
 * @param  {String} url
 * @return {String}
 */
export const getUrlParameter = (
  parameter,
  url = typeof window !== 'undefined' ? window.location.href : ''
) => {
  let name = parameter.replace(/[[]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/**
 * @desc boot intercom
 * @return {Intercom}
 */
export const bootIntercom = () => {
  let appID = process.env.NODE_ENV === 'production' ? 'j0fl7v0m' : 'k8c9ptl1';
  const setup = () => window.Intercom('boot', { app_id: appID });
  if (typeof window.Intercom !== 'undefined') setup();
  else setTimeout(setup, 5000);
};

/**
 * @desc handle decimals to maximum decimals parameter
 * @param {String|Number} [value='']
 * @param {Number} [decimals=8]
 * @return {String}
 */
export const handleDecimals = (value = '', decimals = 8) =>
  Number(value)
    .toFixed(decimals)
    .replace(/0+$/, '')
    .replace(/\.+$/, '');

/**
 * @desc get time string for minimal unit
 * @param {String|Number} [value='']
 * @param {String} [unit='']
 * @param {Boolean} [short=false]
 * @return {String}
 */
export const getTimeString = (value = '', unit = '', short = false) => {
  let _value = Number(value);
  let _unit = unit;
  let _unitShort = '';
  if (_value) {
    if (unit === 'seconds') {
      if (_value === 1) {
        _unit = 'second';
        _unitShort = 'sec';
      } else if (_value < 1) {
        _value = handleDecimals(value * 100, 2);
        if (_value === 1) {
          _unit = 'milisecond';
          _unitShort = 'ms';
        } else {
          _unit = 'miliseconds';
          _unitShort = 'ms';
        }
      } else if (_value >= 60 && _value < 3600) {
        _value = handleDecimals(value / 60, 2);
        if (_value === 1) {
          _unit = 'minute';
          _unitShort = 'min';
        } else {
          _unit = 'minutes';
          _unitShort = 'mins';
        }
      } else if (_value >= 3600 && _value < 86400) {
        _value = handleDecimals(value / 3600, 2);
        if (_value === 1) {
          _unit = 'hour';
          _unitShort = ' hr';
        } else {
          _unit = 'hours';
          _unitShort = 'hrs';
        }
      } else if (_value >= 86400) {
        _value = handleDecimals(value / 86400, 2);
        if (_value === 1) {
          _unit = 'day';
          _unitShort = ' day';
        } else {
          _unit = 'days';
          _unitShort = 'days';
        }
      } else {
        _unitShort = 'secs';
      }
    } else if (unit === 'minutes') {
      if (_value === 1) {
        _unit = 'minute';
        _unitShort = 'min';
      } else if (_value < 1) {
        _value = handleDecimals(value * 60, 2);
        if (_value === 1) {
          _unit = 'second';
          _unitShort = 'sec';
        } else {
          _unit = 'seconds';
          _unitShort = 'secs';
        }
      } else if (_value > 60 && _value < 1440) {
        _value = handleDecimals(value / 60, 2);
        if (_value === 1) {
          _unit = 'hour';
          _unitShort = ' hr';
        } else {
          _unit = 'hours';
          _unitShort = 'hrs';
        }
      } else if (_value >= 1440) {
        _value = handleDecimals(value / 1440, 2);
        if (_value === 1) {
          _unit = 'day';
          _unitShort = ' day';
        } else {
          _unit = 'days';
          _unitShort = 'days';
        }
      } else {
        _unitShort = 'mins';
      }
    }
  }
  if (short) {
    return `${_value} ${_unitShort}`;
  } else {
    return `${_value} ${_unit}`;
  }
};
