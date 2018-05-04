import { apiShapeshiftGetCoins } from '../helpers/api';
import ethTokens from '../libraries/coinwoke-tokens.json';
import {
  convertAssetAmountFromNativeValue,
  convertAssetAmountToNativeValue,
  countDecimalPlaces,
  formatFixedDecimals
} from '../helpers/bignumber';
import { parseError } from '../helpers/parsers';
import { notificationShow } from './_notification';

// -- Constants ------------------------------------------------------------- //

const EXCHANGE_GET_AVAILABLE_REQUEST = 'exchange/EXCHANGE_GET_AVAILABLE_REQUEST';
const EXCHANGE_GET_AVAILABLE_SUCCESS = 'exchange/EXCHANGE_GET_AVAILABLE_SUCCESS';
const EXCHANGE_GET_AVAILABLE_FAILURE = 'exchange/EXCHANGE_GET_AVAILABLE_FAILURE';

const EXCHANGE_TOGGLE_CONFIRMATION_VIEW = 'exchange/EXCHANGE_TOGGLE_CONFIRMATION_VIEW';

const EXCHANGE_UPDATE_NATIVE_AMOUNT = 'exchange/EXCHANGE_UPDATE_NATIVE_AMOUNT';

const EXCHANGE_UPDATE_CRYPTO_AMOUNT = 'exchange/EXCHANGE_UPDATE_CRYPTO_AMOUNT';
const EXCHANGE_UPDATE_DEPOSIT_SELECTED = 'exchange/EXCHANGE_UPDATE_DEPOSIT_SELECTED';
const EXCHANGE_UPDATE_WITHDRAWAL_SELECTED = 'exchange/EXCHANGE_UPDATE_WITHDRAWAL_SELECTED';

const EXCHANGE_CLEAR_FIELDS = 'exchange/EXCHANGE_CLEAR_FIELDS';

// -- Actions --------------------------------------------------------------- //

export const exchangeModalInit = (address, depositSelected) => (dispatch, getState) => {
  dispatch({ type: EXCHANGE_GET_AVAILABLE_REQUEST, payload: { address, depositSelected } });
  apiShapeshiftGetCoins()
    .then(({ data }) => {
      const availableAssets = [{ name: 'Ethereum', symbol: 'ETH', image: null, imageSmall: null }];
      if (data) {
        Object.keys(data).forEach(key => {
          if (data[key].status === 'available' && ethTokens.indexOf(key) !== -1) {
            availableAssets.push(data[key]);
          }
        });
      }
      dispatch({
        type: EXCHANGE_GET_AVAILABLE_SUCCESS,
        payload: { availableAssets, withdrawalSelected: availableAssets[1] }
      });
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: EXCHANGE_GET_AVAILABLE_FAILURE });
    });
};

export const exchangeUpdateDepositSelected = depositSelected => (dispatch, getState) => {
  dispatch({ type: EXCHANGE_UPDATE_DEPOSIT_SELECTED, payload: depositSelected });
};

export const exchangeUpdateWithdrawalSelected = withdrawalSelected => (dispatch, getState) => {
  dispatch({ type: EXCHANGE_UPDATE_WITHDRAWAL_SELECTED, payload: withdrawalSelected });
};

export const exchangeToggleConfirmationView = boolean => (dispatch, getState) => {
  let confirm = boolean;
  if (!confirm) {
    confirm = !getState().exchange.confirm;
  }
  dispatch({ type: EXCHANGE_TOGGLE_CONFIRMATION_VIEW, payload: confirm });
};

export const exchangeUpdateAssetAmount = (assetAmount, depositSelected) => (dispatch, getState) => {
  const { prices, nativeCurrency } = getState().account;
  const _assetAmount = assetAmount.replace(/[^0-9.]/g, '');
  let _nativeAmount = '';
  if (_assetAmount.length && prices[nativeCurrency][depositSelected.symbol]) {
    const _assetAmountDecimalPlaces = countDecimalPlaces(_assetAmount);
    const nativeAmount = convertAssetAmountToNativeValue(_assetAmount, depositSelected, prices);
    const _nativeAmountDecimalPlaces =
      _assetAmountDecimalPlaces > 8 ? _assetAmountDecimalPlaces : 8;
    _nativeAmount = formatFixedDecimals(nativeAmount, _nativeAmountDecimalPlaces);
  }
  dispatch({
    type: EXCHANGE_UPDATE_CRYPTO_AMOUNT,
    payload: { assetAmount: _assetAmount, nativeAmount: _nativeAmount }
  });
};

export const exchangeUpdateNativeAmount = (nativeAmount, depositSelected) => (
  dispatch,
  getState
) => {
  const { prices, nativeCurrency } = getState().account;
  const _nativeAmount = nativeAmount.replace(/[^0-9.]/g, '');
  let _assetAmount = '';
  if (_nativeAmount.length && prices[nativeCurrency][depositSelected.symbol]) {
    const _nativeAmountDecimalPlaces = countDecimalPlaces(_nativeAmount);
    const assetAmount = convertAssetAmountFromNativeValue(_nativeAmount, depositSelected, prices);
    const _assetAmountDecimalPlaces =
      _nativeAmountDecimalPlaces > 8 ? _nativeAmountDecimalPlaces : 8;
    _assetAmount = formatFixedDecimals(assetAmount, _assetAmountDecimalPlaces);
  }
  dispatch({
    type: EXCHANGE_UPDATE_CRYPTO_AMOUNT,
    payload: { assetAmount: _assetAmount, nativeAmount: _nativeAmount }
  });
};

export const exchangeClearFields = () => ({ type: EXCHANGE_CLEAR_FIELDS });

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  fetching: false,
  address: '',
  recipient: '',
  nativeAmount: '',
  assetAmount: '',
  availableAssets: [],
  txHash: '',
  confirm: false,
  depositSelected: { symbol: 'ETH' },
  withdrawalSelected: { symbol: 'ZRX' }
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case EXCHANGE_GET_AVAILABLE_REQUEST:
      return {
        ...state,
        address: action.payload.address,
        depositSelected: action.payload.depositSelected,
        fetching: true
      };
    case EXCHANGE_GET_AVAILABLE_SUCCESS:
      return {
        ...state,
        fetching: false,
        availableAssets: action.payload.availableAssets,
        withdrawalSelected: action.payload.withdrawalSelected
      };
    case EXCHANGE_GET_AVAILABLE_FAILURE:
      return {
        ...state,
        fetching: false,
        availableAssets: {}
      };
    case EXCHANGE_TOGGLE_CONFIRMATION_VIEW:
      return {
        ...state,
        confirm: action.payload
      };
    case EXCHANGE_UPDATE_NATIVE_AMOUNT:
    case EXCHANGE_UPDATE_CRYPTO_AMOUNT:
      return {
        ...state,
        assetAmount: action.payload.assetAmount,
        nativeAmount: action.payload.nativeAmount
      };
    case EXCHANGE_UPDATE_DEPOSIT_SELECTED:
      return { ...state, depositSelected: action.payload };
    case EXCHANGE_UPDATE_WITHDRAWAL_SELECTED:
      return { ...state, withdrawalSelected: action.payload };

    case EXCHANGE_CLEAR_FIELDS:
      return { ...state, ...INITIAL_STATE };
    default:
      return state;
  }
};
