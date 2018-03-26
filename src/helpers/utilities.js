import BigNumber from 'bignumber.js';
import { web3Instance } from './web3';
import nativeCurrencies from '../libraries/native-currencies.json';
import ethUnits from '../libraries/ethereum-units.json';

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
 * @desc debounce api request
 * @param  {Function}  request
 * @param  {Array}     params
 * @param  {Number}    timeout
 * @return {Promise}
 */
export const debounceRequest = (request, params, timeout) =>
  new Promise((resolve, reject) =>
    setTimeout(
      () =>
        request(...params)
          .then(res => resolve(res))
          .catch(err => reject(err)),
      timeout
    )
  );

/**
 * @desc create authenticated user session
 * @param  {String}   [token='']
 * @param  {String}   [email='']
 * @param  {Boolean}  [verified=false]
 * @param  {Boolean}  [twoFactor=false]
 * @param  {Date}     [expires=Date.now() + 180000]
 * @param  {Array}    [accounts=[]]
 * @param  {Array}    [asset=[]]
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
  asset = []
}) => {
  const session = {
    token,
    email,
    verified,
    twoFactor,
    expires,
    accounts,
    asset
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
  const asset = ['ETH'];
  for (let i = 0; i < accounts.length; i++) {
    if (accounts[i].tokens) {
      for (let j = 0; j < accounts[i].tokens.length; j++) {
        if (!asset.includes(accounts[i].tokens[j].symbol)) {
          asset.push(accounts[i].tokens[j].symbol);
        }
      }
    }
  }
  return asset;
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
  const asset = flattenTokens(accounts);
  updateSession({ accounts, asset });
  return { accounts, asset };
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
 * @desc convert from number to string
 * @param  {Number}  value
 * @return {String}
 */
export const convertNumberToString = value => BigNumber(`${value}`).toString();

/**
 * @desc convert from string to number
 * @param  {String}  value
 * @return {Number}
 */
export const convertStringToNumber = value => BigNumber(`${value}`).toNumber();

/**
 * @desc convert from amount value to BigNumber format
 * @param  {String|Number}  value
 * @return {BigNumber}
 */
export const convertAmountToBigNumber = value =>
  BigNumber(`${value}`)
    .times(ethUnits.ether)
    .toString();

/**
 * @desc convert to amount value from BigNumber format
 * @param  {BigNumber}  value
 * @return {String}
 */
export const convertAmountFromBigNumber = value =>
  BigNumber(`${value}`)
    .dividedBy(ethUnits.ether)
    .toString();

/**
 * @desc handle signficant decimals in display format
 * @param  {String}   value
 * @param  {Number}   decimals
 * @param  {Number}   buffer
 * @return {String}
 */
export const handleSignificantDecimals = (value, decimals, buffer) => {
  if (!BigNumber(`${decimals}`).isInteger() || (buffer && !BigNumber(`${buffer}`).isInteger()))
    return null;
  buffer = buffer ? BigNumber(`${buffer}`).toNumber() : 3;
  decimals = BigNumber(`${decimals}`).toNumber();
  if (
    BigNumber(`${value}`)
      .abs()
      .comparedTo(1) === -1
  ) {
    decimals =
      value
        .slice(2)
        .slice('')
        .search(/[^0]/g) + buffer;
    decimals = decimals < 8 ? decimals : 8;
  } else {
    decimals = decimals < buffer ? decimals : buffer;
  }
  let result = BigNumber(`${value}`).toFixed(decimals);
  result = BigNumber(`${result}`).toString();
  return BigNumber(`${result}`).dp() <= 2
    ? BigNumber(`${result}`).toFormat(2)
    : BigNumber(`${result}`).toFormat();
};

/**
 * @desc convert from amount value to display formatted string
 * @param  {BigNumber}  value
 * @param  {Object}     nativePrices
 * @param  {Object}     asset
 * @param  {Number}     buffer
 * @return {String}
 */
export const convertAmountToDisplay = (value, nativePrices, asset, buffer) => {
  value = convertAmountFromBigNumber(value);
  if (!nativePrices && !asset) {
    const decimals = 2;
    const display = handleSignificantDecimals(value, decimals, buffer);
    return `${display}%`;
  } else if (!nativePrices && asset) {
    const decimals = asset.decimals;
    const display = handleSignificantDecimals(value, decimals, buffer);
    return `${display} ${asset.symbol}`;
  } else if (nativePrices) {
    const decimals = nativePrices.selected.decimals;
    const display = handleSignificantDecimals(value, decimals, buffer);
    if (nativePrices.selected.alignment === 'left') {
      return `${nativePrices.selected.symbol}${display}`;
    }
    return `${display} ${nativePrices.selected.currency}`;
  }
  return value;
};

/**
 * @desc convert from amount value to display formatted string for specific currency
 * @param  {BigNumber}  value
 * @param  {Object}     nativePrices
 * @param  {Object}     asset
 * @return {String}
 */
export const convertAmountToDisplaySpecific = (value, nativePrices, selected, buffer) => {
  if (!nativePrices) return null;
  value = convertAmountFromBigNumber(value);
  const decimals = nativeCurrencies[selected].decimals;
  const display = handleSignificantDecimals(value, decimals, buffer);
  if (nativeCurrencies[selected].alignment === 'left') {
    return `${nativeCurrencies[selected].symbol}${display}`;
  }
  return `${display} ${nativeCurrencies[selected].currency}`;
};

/**
 * @desc convert from asset amount value to BigNumber format
 * @param  {String|Number}  value
 * @param  {Number}     decimals
 * @return {BigNumber}
 */
export const convertAssetAmountToBigNumber = (value, decimals) => {
  if (!BigNumber(`${decimals}`).isInteger()) return null;
  decimals = BigNumber(`${decimals}`).toNumber();
  value = BigNumber(`${value}`)
    .dividedBy(BigNumber(10).pow(decimals))
    .toString();
  value = convertAmountToBigNumber(value);
  return value;
};

/**
 * @desc convert to asset amount value from BigNumber format
 * @param  {BigNumber}  value
 * @param  {Number}     decimals
 * @return {String}
 */
export const convertAssetAmountFromBigNumber = (value, decimals) => {
  if (!BigNumber(`${decimals}`).isInteger()) return null;
  decimals = BigNumber(`${decimals}`).toNumber();
  value = convertAmountFromBigNumber(value);
  value = BigNumber(`${value}`)
    .times(BigNumber(10).pow(decimals))
    .toString();
  return value;
};

/**
 * @desc convert from asset amount units to native price value units
 * @param  {String}   value
 * @param  {Object}   asset
 * @param  {Object}   nativePrices
 * @return {String}
 */
export const convertAssetAmountToNativeValue = (value, asset, nativePrices) => {
  const nativeSelected = nativePrices.selected.currency;
  const assetPriceUnit = convertAmountFromBigNumber(
    nativePrices[nativeSelected][asset.symbol].price.amount
  );
  const assetNativePrice = BigNumber(value)
    .times(BigNumber(assetPriceUnit))
    .toString();
  return assetNativePrice;
};

/**
 * @desc convert to asset amount units from native price value units
 * @param  {String}   value
 * @param  {Object}   asset
 * @param  {Object}   nativePrices
 * @return {String}
 */
export const convertAssetAmountFromNativeValue = (value, asset, nativePrices) => {
  const nativeSelected = nativePrices.selected.currency;
  const assetPriceUnit = convertAmountFromBigNumber(
    nativePrices[nativeSelected][asset.symbol].price.amount
  );
  const assetAmountUnit = BigNumber(value)
    .dividedBy(BigNumber(assetPriceUnit))
    .toString();
  return assetAmountUnit;
};

/**
 * @desc convert from asset BigNumber amount to native price BigNumber amount
 * @param  {BigNumber}   value
 * @param  {Object}   asset
 * @param  {Object}   nativePrices
 * @return {BigNumber}
 */
export const convertAssetAmountToNativeAmount = (value, asset, nativePrices) => {
  const _value = convertAmountFromBigNumber(`${value}`);
  const assetPriceUnit = convertAmountFromBigNumber(nativePrices[asset.symbol].price.amount);
  const assetNativePrice = BigNumber(_value)
    .times(BigNumber(assetPriceUnit))
    .toString();
  return convertAmountToBigNumber(assetNativePrice);
};

/**
 * @desc convert to asset BigNumber amount from native price BigNumber amount
 * @param  {BigNumber}   value
 * @param  {Object}   asset
 * @param  {Object}   nativePrices
 * @return {BigNumber}
 */
export const convertAssetAmountFromNativeAmount = (value, asset, nativePrices) => {
  const _value = convertAmountFromBigNumber(`${value}`);
  const assetPriceUnit = convertAmountFromBigNumber(nativePrices[asset.symbol].price.amount);
  const assetAmountUnit = BigNumber(_value)
    .dividedBy(BigNumber(assetPriceUnit))
    .toString();
  return convertAmountToBigNumber(assetAmountUnit);
};

/**
 * @desc format value string to fixed decimals
 * @param  {String}   value
 * @param  {Number}   decimals
 * @return {String}
 */
export const formatFixedDecimals = (value, decimals) =>
  BigNumber(BigNumber(`${value}`).toFixed(BigNumber(`${decimals}`).toNumber()))
    .toFormat()
    .replace(',', '');

/**
 * @desc count value's number of decimals places
 * @param  {String}   value
 * @return {String}
 */
export const countDecimalPlaces = value => BigNumber(`${value}`).dp();

/**
 * @desc checks if asset has a high market value
 * @param  {Object}   asset
 * @return {Boolean}
 */
export const hasHighMarketValue = asset =>
  asset.native &&
  BigNumber(convertAmountFromBigNumber(asset.native.balance.amount)).comparedTo(
    BigNumber(`${asset.native.selected.assetLimit}`)
  ) === 1;

/**
 * @desc checks if asset has a low market value
 * @param  {Object}   asset
 * @return {Boolean}
 */
export const hasLowMarketValue = asset =>
  asset.native &&
  BigNumber(convertAmountFromBigNumber(asset.native.balance.amount)).comparedTo(
    BigNumber(`${asset.native.selected.assetLimit}`)
  ) === -1;

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
 * @desc convert to checksum address
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
 * @return {BigNumber}
 */
export const fromWei = wei =>
  BigNumber(wei)
    .dividedBy(ethUnits.ether)
    .toString();

/**
 * @desc convert from ether to wei
 * @param  {Number} ether
 * @return {BigNumber}
 */
export const toWei = ether =>
  BigNumber(ether)
    .times(ethUnits.ether)
    .toString();

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
