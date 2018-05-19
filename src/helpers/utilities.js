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
      timeout,
    ),
  );

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
 * @desc ellipse text to max maxLength
 * @param  {String}  [text = '']
 * @param  {Number}  [maxLength = 9999]
 * @return {Intercom}
 */
export const ellipseText = (text = '', maxLength = 9999) => {
  if (text.length <= maxLength) return text;
  const _maxLength = maxLength - 3;
  let ellipse = false;
  let currentLength = 0;
  const result =
    text
      .split(' ')
      .filter(word => {
        currentLength += word.length;
        if (ellipse || currentLength >= _maxLength) {
          ellipse = true;
          return false;
        } else {
          return true;
        }
      })
      .join(' ') + '...';
  return result;
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
 * @desc remove hex prefix
 * @param  {String} hex
 * @return {String}
 */
export const removeHexPrefix = hex => hex.toLowerCase().replace('0x', '');

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
 * @desc get derivation path components
 * @param  {String}  [derivationPath = '']
 * @return {Object}
 */
export const getDerivationPathComponents = (derivationPath = '') => {
  const regExp = /^(44'\/6[0|1]'\/\d+'?\/)(\d+)$/;
  const matchResult = regExp.exec(derivationPath);
  if (matchResult === null) {
    throw new Error(
      "To get multiple accounts your derivation path must follow pattern 44'/60|61'/x'/n ",
    );
  }
  return { basePath: matchResult[1], index: parseInt(matchResult[2], 10) };
};

/**
 * @desc returns url parameter value
 * @param  {String} parameter
 * @param  {String} url
 * @return {String}
 */
export const getUrlParameter = (
  parameter,
  url = typeof window !== 'undefined' ? window.location.href : '',
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
  else setTimeout(setup, 500);
};

/**
 * @desc returns an eth aseet object
 * @param  {Array} assets
 * @return {Object}
 */
export const getEth = assets => {
  return assets.filter(asset => asset.symbol === 'ETH')[0];
};

/**
 * @desc returns default eth address for donations
 * @return {String}
 */
export const balanceManagerEthAddress =
  '0x8F12DA507508138993EB3BAA610D18E036cD9936';
