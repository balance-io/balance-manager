import BigNumber from 'bignumber.js';
import errors from '../libraries/errors.json';
import {
  convertToNativeString,
  convertToNativeValue,
  formatNativeString,
  handleDecimals
} from './utilities';

/**
 * @desc parse error code message
 * @param  {Error} error
 * @return {String}
 */
export const parseError = error => {
  if (error.message.includes('MetaMask')) {
    const msgIndex = error.message.indexOf('MetaMask');
    const msgWhole = error.message.slice(msgIndex);
    const msgStart = msgWhole.indexOf(':');
    const msgEnd = msgWhole.indexOf('\n');
    const message = msgWhole.slice(msgStart + 2, msgEnd);
    return message;
  } else if (error.error && error.message) {
    return errors[error.message];
  } else if (!error.response || !errors[error.response.data.message]) {
    console.error(error);
    return `Something went wrong, please try again`;
  }
  return errors[error.response.data.message];
};

/**
 * @desc parse account balances from native prices
 * @param  {Object} [account=null]
 * @param  {Object} [prices=null]
 * @return {String}
 */
export const parseAccountBalances = (account = null, prices = null) => {
  let totalNative = '---';
  if (account.crypto) {
    account.crypto = account.crypto.map(crypto => {
      const price = convertToNativeString('1', crypto.symbol, prices);
      const value = convertToNativeValue(crypto.balance, crypto.symbol, prices);
      const string = convertToNativeString(crypto.balance, crypto.symbol, prices);
      crypto.native = {
        currency: prices.native,
        price: price,
        value: value,
        string: string
      };
      return crypto;
    });
    totalNative = account.crypto.reduce(
      (total, crypto) => Number(total) + Number(crypto.native.value),
      0
    );
    totalNative = formatNativeString(totalNative, prices.native);
  }
  account.totalNative = totalNative;
  return account;
};

/**
 * @desc parse token balances to specific
 * @param {String|Number} [balance='']
 * @param {Number} [decimals=2]
 * @return {String}
 */
export const parseTokenBalances = (balance = '', decimals = 18) => {
  let _balance = Number(balance);
  let _decimals = Number(decimals);
  _balance = BigNumber(_balance)
    .dividedBy(new BigNumber(10).pow(_decimals))
    .toNumber();
  return _balance;
};

/**
 * @desc parse prices object from api response
 * @param  {Object} [data=null]
 * @param  {Array} [crypto=[]]
 * @param  {String} [native='USD']
 * @return {Object}
 */
export const parsePricesObject = (data = null, crypto = [], native = 'USD') => {
  let prices = { native };
  crypto.map(coin => (prices[coin] = data[coin] ? data[coin][native] : null));
  // APPEND prices for WETH same as ETH
  prices['WETH'] = prices['ETH'];
  // APPEND random prices for testnet tokens
  prices['💥 PLASMA'] = 1.24;
  prices['STT'] = 0.21;
  prices['GUP'] = 23.21;
  prices['Aeternity'] = 124.32;
  return prices;
};

/**
 * @desc parse ethplorer address info response
 * @param  {String}   [data = null]
 * @return {Promise}
 */
export const parseEthplorerAddressInfo = (data = null) => {
  const ethereum = {
    name: 'Ethereum',
    symbol: 'ETH',
    address: null,
    decimals: 18,
    balance: data && data.ETH.balance ? handleDecimals(data.ETH.balance) : '0.00000000',
    native: null
  };
  let crypto = [ethereum];
  if (data && data.tokens) {
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
    address: (data && data.address) || '',
    type: 'METAMASK',
    crypto,
    totalNative: '---'
  };
};
