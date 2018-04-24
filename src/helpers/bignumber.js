import BigNumber from 'bignumber.js';
import ethUnits from '../libraries/ethereum-units.json';
import nativeCurrencies from '../libraries/native-currencies.json';

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
  const nativeSelected = nativePrices.selected.currency;
  const _value = convertAmountFromBigNumber(`${value}`);
  const assetPriceUnit = convertAmountFromBigNumber(
    nativePrices[nativeSelected][asset.symbol].price.amount
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
export const convertAssetAmountFromNativeAmount = (value, asset, nativePrices) => {
  const nativeSelected = nativePrices.selected.currency;
  const _value = convertAmountFromBigNumber(`${value}`);
  const assetPriceUnit = convertAmountFromBigNumber(
    nativePrices[nativeSelected][asset.symbol].price.amount
  );
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
 * @desc convert hex to number string
 * @param  {String} hex
 * @return {String}
 */
export const convertHexToString = hex => BigNumber(`${hex}`).toString();

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
 * @desc multiplies two numbers
 * @param  {Number}   numberOne
 * @param  {Number}   numberTwo
 * @return {String}
 */
export const multiply = (numberOne, numberTwo) =>
  BigNumber(`${numberOne}`)
    .times(BigNumber(`${numberTwo}`))
    .toString();
