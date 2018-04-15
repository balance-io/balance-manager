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
export const getLocal = (key = '') =>
  localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : null;

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
 * @desc update local balances
 * @param  {Object}   [account]
 * @param  {String}   [network]
 * @return {Void}
 */
export const updateLocalBalances = (account, network) => {
  const accountLocal = getLocal(account.address) || {};
  accountLocal.balances = { assets: account.assets, total: account.total || '———' };
  accountLocal.network = network;
  saveLocal(account.address, accountLocal);
};

/**
 * @desc update local transactions
 * @param  {String}   [address]
 * @param  {Array}    [transactions]
 * @param  {String}   [network]
 * @return {Void}
 */
export const updateLocalTransactions = (address, transactions, network) => {
  const accountLocal = getLocal(address) || {};
  const pending = transactions ? transactions.filter(tx => tx.pending) : [];
  accountLocal.transactions = transactions;
  accountLocal.pending = pending;
  accountLocal.network = network;
  saveLocal(address, accountLocal);
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
