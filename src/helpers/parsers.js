import errors from '../libraries/errors.json';
import {
  convertToNativeString,
  convertToNativeValue,
  formatNativeString,
  formatPercentageChange,
  handleDecimals,
  hexToNumberString,
  convertTokenAmountToUnit,
  fromWei,
  sha3
} from './utilities';
import { apiGetHistoricalPrices, apiGetEthplorerTokenInfo } from './api';

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
 * @desc parse prices object from api response
 * @param  {Object} [data=null]
 * @param  {Array} [crypto=[]]
 * @param  {String} [native='USD']
 * @return {Object}
 */
export const parsePricesObject = (data = null, crypto = [], native = 'USD') => {
  let prices = { native };
  crypto.map(
    coin =>
      (prices[coin] = data.RAW[coin]
        ? { price: data.RAW[coin][native].PRICE, change: data.RAW[coin][native].CHANGEPCT24HOUR }
        : null)
  );
  // APPEND prices for WETH same as ETH
  prices['WETH'] = prices['ETH'];
  // APPEND random prices for testnet tokens
  prices['💥 PLASMA'] = { price: 1.24, change: 0.124 };
  prices['STT'] = { price: 0.21, change: 2.2 };
  prices['GUP'] = { price: 23.21, change: -1.111 };
  prices['Aeternity'] = { price: 124.32, change: -20.342 };
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
      const balance = convertTokenAmountToUnit(token.balance, Number(token.tokenInfo.decimals));
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
    txCount: (data && data.countTxs) || 0,
    crypto,
    totalNative: '---'
  };
};

/**
 * @desc parse account balances from native prices
 * @param  {Object} [account=null]
 * @param  {Object} [prices=null]
 * @return {String}
 */
export const parseAccountBalances = (account = null, prices = null) => {
  let totalNative = '---';

  if (account && account.crypto) {
    account.crypto = account.crypto.map(crypto => {
      const price = convertToNativeString('1', crypto.symbol, prices);
      const change = formatPercentageChange(crypto.symbol, prices);
      const value = convertToNativeValue(crypto.balance, crypto.symbol, prices);
      const string = convertToNativeString(crypto.balance, crypto.symbol, prices);
      crypto.native = {
        currency: prices.native,
        price: price,
        change: change,
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
 * @desc parse etherscan account transactions response
 * @param  {String}   [data = null]
 * @return {Promise}
 */
export const parseEtherscanAccountTransactions = async (data = null) => {
  if (!data || !data.result) return null;

  let transactions = await Promise.all(
    data.result.map(async tx => {
      const hash = tx.hash;
      const timestamp = tx.timeStamp;
      const from = tx.from;
      const error = tx.isError === '1';
      let to = tx.to;
      let crypto = {
        name: 'Ethereum',
        symbol: 'ETH',
        address: null,
        decimals: 18
      };
      let value = Number(fromWei(tx.value));

      const tokenTransfer = sha3('transfer(address,uint256)').slice(0, 10);

      if (tx.input.startsWith(tokenTransfer)) {
        const response = await apiGetEthplorerTokenInfo(tx.to);

        crypto = {
          name: !response.data.error || response.data.name ? response.data.name : 'Unknown Token',
          symbol: !response.data.error || response.data.symbol ? response.data.symbol : '---',
          address: !response.data.error ? response.data.address : '',
          decimals: !response.data.error ? Number(response.data.decimals) : 18
        };

        const address = `0x${tx.input.slice(34, 74)}`;
        const amount = hexToNumberString(`${tx.input.slice(74)}`);

        to = address;
        value = handleDecimals(convertTokenAmountToUnit(amount, crypto.decimals));
      }

      return {
        hash,
        timestamp,
        from,
        to,
        error,
        crypto,
        value
      };
    })
  );

  transactions = transactions.reverse();
  return transactions;
};

/**
 * @desc parse transactions from native prices
 * @param  {Object} [transactions=null]
 * @param  {Object} [nativeCurrency='']
 * @return {String}
 */
export const parseTransactionsPrices = async (transactions = null, nativeCurrency = '') => {
  let _transactions = transactions;
  if (
    _transactions &&
    _transactions.length &&
    nativeCurrency &&
    typeof nativeCurrency === 'string'
  ) {
    _transactions = await Promise.all(
      _transactions.map(async tx => {
        const timestamp = tx.timestamp;
        const cryptoSymbol = tx.crypto.symbol;
        const native = [nativeCurrency];
        const response = await apiGetHistoricalPrices(cryptoSymbol, native, timestamp);
        if (response.data.response) return tx;
        const prices = {
          native: nativeCurrency,
          [cryptoSymbol]: {
            price: response.data[cryptoSymbol] ? response.data[cryptoSymbol][nativeCurrency] : null
          }
        };
        const price = convertToNativeString('1', tx.crypto.symbol, prices);
        const total = !tx.error ? convertToNativeString(tx.value, tx.crypto.symbol, prices) : null;
        tx.price = price;
        tx.total = total;
        return tx;
      })
    );
  }
  return _transactions;
};
