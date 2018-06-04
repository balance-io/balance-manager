const version = '0.1.0';

/**
 * @desc save to local storage
 * @param  {String}  [key='']
 * @param  {Object}  [data={}]
 * @return {Object}
 */
export const saveLocal = (key = '', data = {}) => {
  data['localStorageVersion'] = version;
  const jsonData = JSON.stringify(data);
  localStorage.setItem(key, jsonData);
};

/**
 * @desc get from local storage
 * @param  {String}  [key='']
 * @return {Object}
 */
export const getLocal = (key = '') => {
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
 * @desc update local balances
 * @param  {String}   [address]
 * @param  {Object}   [account]
 * @param  {String}   [network]
 * @return {Void}
 */
export const updateLocalBalances = (address, account, network) => {
  if (!address) return;
  let accountLocal = getLocal(address) || {};
  if (!accountLocal[network]) {
    accountLocal[network] = {};
  }
  accountLocal[network].type = account.type;
  accountLocal[network].balances = {
    assets: account.assets,
    total: account.total || '———',
  };
  saveLocal(address, accountLocal);
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
  saveLocal(address, accountLocal);
};
