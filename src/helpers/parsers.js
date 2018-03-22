import lang from '../languages';
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
  const msgEnd =
    error.message.indexOf('\n') !== -1 ? error.message.indexOf('\n') : error.message.length;
  let message = error.message.slice(0, msgEnd);
  if (error.message.includes('MetaMask') || error.message.includes('Returned error:')) {
    message = message
      .replace('Error: ', '')
      .replace('MetaMask ', '')
      .replace('Returned error: ', '');
    message = message.slice(0, 1).toUpperCase() + message.slice(1).toLowerCase();
    console.error(new Error(message));
    return message;
  }
  console.error(error);
  return message;
};

/**
 * @desc parse prices object from api response
 * @param  {Object} [data=null]
 * @param  {Array} [assets=[]]
 * @param  {String} [native='USD']
 * @return {Object}
 */
export const parsePricesObject = (data = null, assets = [], native = 'USD') => {
  let prices = { native };
  assets.map(
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

  let assets = [ethereum];
  if (data && data.tokens) {
    const tokens = data.tokens.map(token => {
      const balance = convertTokenAmountToUnit(token.balance, Number(token.tokenInfo.decimals));
      return {
        name: token.tokenInfo.name || lang.t('account.unknown_token'),
        symbol: token.tokenInfo.symbol || '———',
        address: token.tokenInfo.address,
        decimals: Number(token.tokenInfo.decimals),
        balance: handleDecimals(balance),
        native: null
      };
    });
    assets = [...assets, ...tokens];
  }
  return {
    address: (data && data.address) || '',
    type: 'METAMASK',
    txCount: (data && data.countTxs) || 0,
    assets,
    totalNative: '———'
  };
};

/**
 * @desc parse account balances from native prices
 * @param  {Object} [account=null]
 * @param  {Object} [prices=null]
 * @return {String}
 */
export const parseAccountBalances = (account = null, prices = null) => {
  let totalNative = '———';

  if (account && account.assets) {
    account.assets = account.assets.map(asset => {
      const price = convertToNativeString('1', asset.symbol, prices);
      const change = formatPercentageChange(asset.symbol, prices);
      const value = convertToNativeValue(asset.balance, asset.symbol, prices);
      const string = convertToNativeString(asset.balance, asset.symbol, prices);
      asset.native = {
        currency: prices.native,
        price: price,
        change: change,
        value: value,
        string: string
      };
      return asset;
    });
    totalNative = account.assets.reduce(
      (total, asset) => Number(total) + Number(asset.native.value),
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

  const debounceApiGetEthplorerTokenInfo = (address, timeout) =>
    new Promise((resolve, reject) =>
      setTimeout(
        () =>
          apiGetEthplorerTokenInfo(address)
            .then(res => resolve(res))
            .catch(err => reject(err)),
        timeout
      )
    );

  let transactions = await Promise.all(
    data.result.map(async (tx, idx) => {
      const hash = tx.hash;
      const timestamp = tx.timeStamp;
      const from = tx.from;
      const error = tx.isError === '1';
      let interaction = false;
      let to = tx.to;
      let asset = {
        name: 'Ethereum',
        symbol: 'ETH',
        address: null,
        decimals: 18
      };
      let value = Number(fromWei(tx.value));

      const tokenTransfer = sha3('transfer(address,uint256)').slice(0, 10);

      if (tx.input.startsWith(tokenTransfer)) {
        const response = await debounceApiGetEthplorerTokenInfo(tx.to, 100 * idx);

        asset = {
          name: !response.data.error || response.data.name ? response.data.name : 'Unknown Token',
          symbol: !response.data.error || response.data.symbol ? response.data.symbol : '———',
          address: !response.data.error ? response.data.address : '',
          decimals: !response.data.error ? Number(response.data.decimals) : 18
        };

        /* STT token on Ropsten */
        if (tx.to === '0xc55cf4b03948d7ebc8b9e8bad92643703811d162') {
          asset = {
            name: 'Status Test Token',
            symbol: 'STT',
            address: '0xc55cF4B03948D7EBc8b9E8BAD92643703811d162',
            decimals: 18
          };
        }

        const address = `0x${tx.input.slice(34, 74)}`;
        const amount = hexToNumberString(`${tx.input.slice(74)}`);

        to = address;
        value = handleDecimals(convertTokenAmountToUnit(amount, asset.decimals));
      } else if (tx.input !== '0x') {
        interaction = true;
      }

      return {
        hash,
        timestamp,
        from,
        to,
        error,
        asset,
        interaction,
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

  const debounceApiGetHistoricalPrice = (assetSymbol, native, timestamp, timeout) =>
    new Promise((resolve, reject) =>
      setTimeout(
        () =>
          apiGetHistoricalPrices(assetSymbol, native, timestamp)
            .then(res => resolve(res))
            .catch(err => reject(err)),
        timeout
      )
    );

  if (
    _transactions &&
    _transactions.length &&
    nativeCurrency &&
    typeof nativeCurrency === 'string'
  ) {
    _transactions = await Promise.all(
      _transactions.map(async (tx, idx) => {
        const timestamp = tx.timestamp;
        const assetSymbol = tx.asset.symbol;
        const native = [nativeCurrency];
        const response = await debounceApiGetHistoricalPrice(
          assetSymbol,
          native,
          timestamp,
          50 * idx
        );
        if (response.data.response) return tx;
        const prices = {
          native: nativeCurrency,
          [assetSymbol]: {
            price: response.data[assetSymbol] ? response.data[assetSymbol][nativeCurrency] : null
          }
        };
        const price = convertToNativeString('1', tx.asset.symbol, prices);
        const total = !tx.error ? convertToNativeString(tx.value, tx.asset.symbol, prices) : null;
        tx.price = price;
        tx.total = total;
        return tx;
      })
    );
  }
  return _transactions;
};
