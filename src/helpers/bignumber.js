import BigNumber from 'bignumber.js';
import ethUnits from '../references/ethereum-units.json';
import nativeCurrencies from '../references/native-currencies.json';

/**
 * @desc count value's number of decimals places
 * @param  {String}   value
 * @return {String}
 */
export const countDecimalPlaces = value => BigNumber(`${value}`).dp();

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
 * @desc convert hex to number string
 * @param  {String} hex
 * @return {String}
 */
export const convertHexToString = hex => BigNumber(`${hex}`).toString();

/**
 * @desc convert number to string to hex
 * @param  {String} string
 * @return {String}
 */
export const convertStringToHex = string => BigNumber(`${string}`).toString(16);

/**
 * @desc compares if numberOne is greater than numberTwo
 * @param  {Number}   numberOne
 * @param  {Number}   numberTwo
 * @return {String}
 */
export const greaterThan = (numberOne, numberTwo) =>
  BigNumber(`${numberOne}`).comparedTo(BigNumber(`${numberTwo}`)) === 1;

/**
 * @desc compares if numberOne is greater than or equal to numberTwo
 * @param  {Number}   numberOne
 * @param  {Number}   numberTwo
 * @return {String}
 */
export const greaterThanOrEqual = (numberOne, numberTwo) =>
  BigNumber(`${numberOne}`).comparedTo(BigNumber(`${numberTwo}`)) >= 0;

/**
 * @desc compares if numberOne is smaller than numberTwo
 * @param  {Number}   numberOne
 * @param  {Number}   numberTwo
 * @return {String}
 */
export const smallerThan = (numberOne, numberTwo) =>
  BigNumber(`${numberOne}`).comparedTo(BigNumber(`${numberTwo}`)) === -1;

/**
 * @desc compares if numberOne is smaller than or equal to numberTwo
 * @param  {Number}   numberOne
 * @param  {Number}   numberTwo
 * @return {String}
 */
export const smallerThanOrEqual = (numberOne, numberTwo) =>
  BigNumber(`${numberOne}`).comparedTo(BigNumber(`${numberTwo}`)) <= 0;

/**
 * @desc multiplies two numbers
 * @param  {Number}   numberOne
 * @param  {Number}   numberTwo
 * @return {String}
 */
export const multiply = (numberOne, numberTwo) =>
  BigNumber(`${numberOne}`)
    .times(BigNumber(`${numberTwo}`))
    .toString();

/**
 * @desc divides two numbers
 * @param  {Number}   numberOne
 * @param  {Number}   numberTwo
 * @return {String}
 */
export const divide = (numberOne, numberTwo) =>
  BigNumber(`${numberOne}`)
    .dividedBy(BigNumber(`${numberTwo}`))
    .toString();

/**
 * @desc real flor divides two numbers
 * @param  {Number}   numberOne
 * @param  {Number}   numberTwo
 * @return {String}
 */
export const floorDivide = (numberOne, numberTwo) =>
  BigNumber(`${numberOne}`)
    .dividedToIntegerBy(BigNumber(`${numberTwo}`))
    .toString();

/**
 * @desc modulos of two numbers
 * @param  {Number}   numberOne
 * @param  {Number}   numberTwo
 * @return {String}
 */
export const mod = (numberOne, numberTwo) =>
  BigNumber(`${numberOne}`)
    .mod(BigNumber(`${numberTwo}`))
    .toString();

/**
 * @desc adds two numbers
 * @param  {Number}   numberOne
 * @param  {Number}   numberTwo
 * @return {String}
 */
export const add = (numberOne, numberTwo) =>
  BigNumber(`${numberOne}`)
    .plus(BigNumber(`${numberTwo}`))
    .toString();

/**
 * @desc subtracts two numbers
 * @param  {Number}   numberOne
 * @param  {Number}   numberTwo
 * @return {String}
 */
export const subtract = (numberOne, numberTwo) =>
  BigNumber(`${numberOne}`)
    .minus(BigNumber(`${numberTwo}`))
    .toString();

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
  if (
    !BigNumber(`${decimals}`).isInteger() ||
    (buffer && !BigNumber(`${buffer}`).isInteger())
  )
    return null;
  buffer = buffer ? convertStringToNumber(buffer) : 3;
  decimals = convertStringToNumber(decimals);
  if (smallerThan(BigNumber(`${value}`).abs(), 1)) {
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
    const decimals = asset.decimals || 18;
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
export const convertAmountToDisplaySpecific = (
  value,
  nativePrices,
  selected,
  buffer,
) => {
  if (!nativePrices) return null;
  value = convertAmountFromBigNumber(value);
  const nativeSelected = nativeCurrencies[selected];
  const decimals = nativeSelected.decimals;
  const display = handleSignificantDecimals(value, decimals, buffer);
  if (nativeSelected.alignment === 'left') {
    return `${nativeSelected.symbol}${display}`;
  }
  return `${display} ${nativeSelected.currency}`;
};

/**
 * @desc convert from asset amount value to BigNumber format
 * @param  {String|Number}  value
 * @param  {Number}     decimals
 * @return {BigNumber}
 */
export const convertAssetAmountToBigNumber = (value, decimals) => {
  if (!BigNumber(`${decimals}`).isInteger()) return null;
  decimals = convertStringToNumber(decimals);
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
  decimals = convertStringToNumber(decimals);
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
    nativePrices[nativeSelected][asset.symbol].price.amount,
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
export const convertAssetAmountFromNativeValue = (
  value,
  asset,
  nativePrices,
) => {
  const nativeSelected = nativePrices.selected.currency;
  const assetPriceUnit = convertAmountFromBigNumber(
    nativePrices[nativeSelected][asset.symbol].price.amount,
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
export const convertAssetAmountToNativeAmount = (
  value,
  asset,
  nativePrices,
) => {
  const nativeSelected = nativePrices.selected.currency;
  const _value = convertAmountFromBigNumber(`${value}`);
  const assetPriceUnit = convertAmountFromBigNumber(
    nativePrices[nativeSelected][asset.symbol].price.amount,
  );
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
export const convertAssetAmountFromNativeAmount = (
  value,
  asset,
  nativePrices,
) => {
  const nativeSelected = nativePrices.selected.currency;
  const _value = convertAmountFromBigNumber(`${value}`);
  const assetPriceUnit = convertAmountFromBigNumber(
    nativePrices[nativeSelected][asset.symbol].price.amount,
  );
  const assetAmountUnit = BigNumber(_value)
    .dividedBy(BigNumber(assetPriceUnit))
    .toString();
  return convertAmountToBigNumber(assetAmountUnit);
};

/**
 * @desc convert amount to asset amount
 * @param  {String}   value
 * @param  {Number}   decimals
 * @return {String}
 */
export const convertAmountToAssetAmount = (value, decimals) =>
  BigNumber(value).times(BigNumber(10).pow(decimals));

/**
 * @desc format fixed number of decimals
 * @param  {String}   value
 * @param  {Number}   decimals
 * @return {String}
 */
export const formatFixedDecimals = (value, decimals) => {
  const _value = convertNumberToString(value);
  const _decimals = convertStringToNumber(decimals);
  const result = BigNumber(BigNumber(_value).toFixed(_decimals)).toString();
  return result;
};

/**
 * @desc format inputOne value to signficant decimals given inputTwo
 * @param  {String}   inputOne
 * @param  {String}   inputTwo
 * @return {String}
 */
export const formatInputDecimals = (inputOne, inputTwo) => {
  const _nativeAmountDecimalPlaces = countDecimalPlaces(inputTwo);
  const decimals =
    _nativeAmountDecimalPlaces > 8 ? _nativeAmountDecimalPlaces : 8;
  const result = BigNumber(formatFixedDecimals(inputOne, decimals))
    .toFormat()
    .replace(/,/g, '');
  return result;
};

/**
 * @desc checks if asset has a high market value
 * @param  {Object}   asset
 * @return {Boolean}
 */
export const hasHighMarketValue = asset =>
  asset.native &&
  greaterThan(
    convertAmountFromBigNumber(asset.native.balance.amount),
    asset.native.selected.assetLimit,
  );

/**
 * @desc checks if asset has a low market value
 * @param  {Object}   asset
 * @return {Boolean}
 */
export const hasLowMarketValue = asset =>
  asset.native &&
  smallerThan(
    convertAmountFromBigNumber(asset.native.balance.amount),
    asset.native.selected.assetLimit,
  );
