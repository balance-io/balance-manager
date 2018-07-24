const defaultVersion = '0.1.0';
const accountLocalVersion = '0.1.0';
const globalSettingsVersion = '0.1.0';
const walletConnectVersion = '0.1.0';

const expiryBufferInSeconds = 10 * 60;

/**
 * @desc save to local storage
 * @param  {String}  [key='']
 * @param  {Object}  [data={}]
 * @param  {String} [version=defaultVersion]
 */
export const saveLocal = (key = '', data = {}, version = defaultVersion) => {
  data['localStorageVersion'] = version;
  const jsonData = JSON.stringify(data);
  localStorage.setItem(key, jsonData);
};

/**
 * @desc get from local storage
 * @param  {String}  [key='']
 * @return {Object}
 */
export const getLocal = (key = '', version = defaultVersion) => {
  const data = localStorage.getItem(key)
    ? JSON.parse(localStorage.getItem(key))
    : null;
  if (data && data['localStorageVersion'] === version) {
    return data;
  } else if (data) {
    removeLocal(key);
  }
  return null;
};

/**
 * @desc get from local storage
 * @param  {String}  [key='']
 * @return {Object}
 */
export const removeLocal = (key = '') => localStorage.removeItem(key);

/**
 * @desc reset account local
 * @param  {String}   [address]
 */
export const resetAccount = accountAddress => {
  accountAddress = accountAddress.toLowerCase();
  removeLocal(accountAddress);
  removeLocal('nativePrices');
};

/**
 * @desc get account local
 * @param  {String}   [address]
 * @return {Object}
 */
export const getAccountLocal = accountAddress => {
  accountAddress = accountAddress.toLowerCase();
  return getLocal(accountAddress, accountLocalVersion);
};

/**
 * @desc get native prices
 * @return {Object}
 */
export const getNativePrices = () => {
  const nativePrices = getLocal('nativePrices', accountLocalVersion);
  return nativePrices ? nativePrices.data : null;
};

/**
 * @desc save native prices
 * @param  {String}   [address]
 */
export const saveNativePrices = nativePrices => {
  saveLocal('nativePrices', { data: nativePrices }, accountLocalVersion);
};

/**
 * @desc get native currency
 * @return {Object}
 */
export const getNativeCurrency = () => {
  const nativeCurrency = getLocal('nativeCurrency', globalSettingsVersion);
  return nativeCurrency ? nativeCurrency.data : null;
};

/**
 * @desc save native currency
 * @param  {String}   [currency]
 */
export const saveNativeCurrency = nativeCurrency => {
  saveLocal('nativeCurrency', { data: nativeCurrency }, globalSettingsVersion);
};

/**
 * @desc update local balances
 * @param  {String}   [address]
 * @param  {Object}   [account]
 * @param  {String}   [network]
 * @return {Void}
 */
export const updateLocalBalances = (address, account, network) => {
  if (!address) return;
  address = address.toLowerCase();
  let accountLocal = getLocal(address) || {};
  if (!accountLocal[network]) {
    accountLocal[network] = {};
  }
  accountLocal[network].type = account.type;
  accountLocal[network].balances = {
    assets: account.assets,
    total: account.total || '———',
  };
  saveLocal(address, accountLocal, accountLocalVersion);
};

/**
 * @desc update local transactions
 * @param  {String}   [address]
 * @param  {Array}    [transactions]
 * @param  {String}   [network]
 * @return {Void}
 */
export const updateLocalTransactions = (address, transactions, network) => {
  if (!address) return;
  address = address.toLowerCase();
  let accountLocal = getLocal(address) || {};
  const pending = [];
  const _transactions = [];
  transactions.forEach(tx => {
    if (tx.pending) {
      pending.push(tx);
    } else {
      _transactions.push(tx);
    }
  });
  if (!accountLocal[network]) {
    accountLocal[network] = {};
  }
  accountLocal[network].transactions = _transactions;
  accountLocal[network].pending = pending;
  saveLocal(address, accountLocal, accountLocalVersion);
};

/**
 * @desc get suppress reminder ribbon setting
 * @return {Boolean}
 */
export const getSupressReminderRibbon = () => {
  const reminderRibbon = getLocal(
    'supressreminderribbon',
    globalSettingsVersion,
  );
  return reminderRibbon ? reminderRibbon.data : null;
};

/**
 * @desc save suppress reminder ribbon setting
 * @param  {Boolean}   [supress state]
 */
export const saveSupressReminderRibbon = state => {
  saveLocal('supressreminderribbon', { data: state }, globalSettingsVersion);
};

/**
 * @desc get wallet connect session details
 * @return {Object}
 */
export const getWalletConnectSession = () => {
  const webConnectorOptions = getLocal('walletconnect', walletConnectVersion);
  const details = webConnectorOptions ? webConnectorOptions.data : null;
  if (details) {
    const expiration = Date.parse(webConnectorOptions.expiration);
    return new Date() < expiration ? details : null;
  } else {
    return null;
  }
};

/**
 * @desc save wallet connect session details
 * @param  {String}   [address]
 */
export const saveWalletConnectSession = (webConnectorOptions, ttlInSeconds) => {
  let expiration = new Date();
  expiration.setSeconds(
    expiration.getSeconds() + ttlInSeconds - expiryBufferInSeconds,
  );
  saveLocal(
    'walletconnect',
    { data: webConnectorOptions, expiration },
    walletConnectVersion,
  );
};

/**
 * @desc reset wallet connect session details
 * @param  {String}   [address]
 */
export const resetWalletConnect = () => {
  removeLocal('walletconnect');
};

/**
 * @desc get language
 * @return {Object}
 */
export const getLanguage = () => {
  const language = getLocal('language', globalSettingsVersion);
  return language ? language.data : null;
};

/**
 * @desc save language
 * @param  {String}   [language]
 */
export const saveLanguage = language => {
  saveLocal('language', { data: language }, globalSettingsVersion);
};
