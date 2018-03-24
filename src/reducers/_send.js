import { apiGetGasPrices } from '../helpers/api';
import { notificationShow } from './_notification';
import lang from '../languages';
import ethUnits from '../libraries/ethereum-units.json';
import {
  convertAssetAmountFromNativeValue,
  convertAssetAmountToNativeValue,
  countDecimalPlaces,
  formatFixedDecimals
} from '../helpers/utilities';
import { parseError, parseGasPrices, parseGasPricesTxFee } from '../helpers/parsers';
import { metamaskSendTransaction, metamaskTransferToken, estimateGasLimit } from '../helpers/web3';

// -- Constants ------------------------------------------------------------- //

const SEND_GET_GAS_PRICES_REQUEST = 'send/SEND_GET_GAS_PRICES_REQUEST';
const SEND_GET_GAS_PRICES_SUCCESS = 'send/SEND_GET_GAS_PRICES_SUCCESS';
const SEND_GET_GAS_PRICES_FAILURE = 'send/SEND_GET_GAS_PRICES_FAILURE';

const SEND_UPDATE_GAS_PRICE_REQUEST = 'send/SEND_UPDATE_GAS_PRICE_REQUEST';
const SEND_UPDATE_GAS_PRICE_SUCCESS = 'send/SEND_UPDATE_GAS_PRICE_SUCCESS';
const SEND_UPDATE_GAS_PRICE_FAILURE = 'send/SEND_UPDATE_GAS_PRICE_FAILURE';

const SEND_ETHER_METAMASK_REQUEST = 'send/SEND_ETHER_METAMASK_REQUEST';
const SEND_ETHER_METAMASK_SUCCESS = 'send/SEND_ETHER_METAMASK_SUCCESS';
const SEND_ETHER_METAMASK_FAILURE = 'send/SEND_ETHER_METAMASK_FAILURE';

const SEND_TOKEN_METAMASK_REQUEST = 'send/SEND_TOKEN_METAMASK_REQUEST';
const SEND_TOKEN_METAMASK_SUCCESS = 'send/SEND_TOKEN_METAMASK_SUCCESS';
const SEND_TOKEN_METAMASK_FAILURE = 'send/SEND_TOKEN_METAMASK_FAILURE';

const SEND_TOGGLE_CONFIRMATION_VIEW = 'send/SEND_TOGGLE_CONFIRMATION_VIEW';

const SEND_UPDATE_NATIVE_AMOUNT = 'send/SEND_UPDATE_NATIVE_AMOUNT';

const SEND_UPDATE_RECIPIENT = 'send/SEND_UPDATE_RECIPIENT';
const SEND_UPDATE_CRYPTO_AMOUNT = 'send/SEND_UPDATE_CRYPTO_AMOUNT';
const SEND_UPDATE_SELECTED = 'send/SEND_UPDATE_SELECTED';
const SEND_UPDATE_PRIVATE_KEY = 'send/SEND_UPDATE_PRIVATE_KEY';

const SEND_CLEAR_FIELDS = 'send/SEND_CLEAR_FIELDS';

// -- Actions --------------------------------------------------------------- //

export const sendModalInit = (address, selected) => (dispatch, getState) => {
  dispatch({ type: SEND_GET_GAS_PRICES_REQUEST, payload: { address, selected } });
  const { prices } = getState().account;
  const { gasLimit } = getState().send;
  apiGetGasPrices()
    .then(({ data }) => {
      const gasPrices = parseGasPrices(data, prices, gasLimit);
      dispatch({
        type: SEND_GET_GAS_PRICES_SUCCESS,
        payload: gasPrices
      });
    })
    .catch(error => {
      console.error(error);
      dispatch(notificationShow(lang.t('notification.error.failed_get_gas_prices'), true));
      dispatch({ type: SEND_GET_GAS_PRICES_FAILURE });
    });
};

export const sendUpdateGasPrice = newGasPriceOption => (dispatch, getState) => {
  const { selected, address, recipient, assetAmount, gasPrice, gasPriceOption } = getState().send;
  let { gasPrices } = getState().send;
  const _gasPriceOption = newGasPriceOption || gasPriceOption;
  const _gasPrice = gasPriceOption ? gasPrices[_gasPriceOption] : gasPrice;
  dispatch({ type: SEND_UPDATE_GAS_PRICE_REQUEST });
  estimateGasLimit({
    tokenObject: selected,
    address,
    recipient,
    amount: assetAmount
  })
    .then(gasLimit => {
      const { prices } = getState().account;
      gasPrices = parseGasPricesTxFee(gasPrices, prices, gasLimit);
      dispatch({
        type: SEND_UPDATE_GAS_PRICE_SUCCESS,
        payload: { gasLimit, gasPrice: _gasPrice, gasPriceOption: _gasPriceOption, gasPrices }
      });
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message || lang.t('notification.error.failed_get_tx_fee'), true));
      dispatch({
        type: SEND_UPDATE_GAS_PRICE_FAILURE,
        payload: {
          gasLimit: 21000,
          gasPrice: _gasPrice,
          gasPriceOption: _gasPriceOption,
          gasPrices: gasPrices
        }
      });
    });
};

export const sendUpdateSelected = selected => (dispatch, getState) => {
  dispatch({ type: SEND_UPDATE_SELECTED, payload: selected });
  dispatch(sendUpdateGasPrice());
};

export const sendEtherMetamask = ({ address, recipient, amount, gasPrice, gasLimit }) => (
  dispatch,
  getState
) => {
  dispatch({ type: SEND_ETHER_METAMASK_REQUEST });
  metamaskSendTransaction({
    from: address,
    to: recipient,
    value: amount,
    gasPrice: gasPrice.value.amount,
    gasLimit: gasLimit
  })
    .then(txHash =>
      dispatch({
        type: SEND_ETHER_METAMASK_SUCCESS,
        payload: txHash
      })
    )
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: SEND_ETHER_METAMASK_FAILURE });
    });
};

export const sendTokenMetamask = ({ address, recipient, amount, tokenObject, gasPrice }) => (
  dispatch,
  getState
) => {
  const { gasLimit } = getState().send;
  dispatch({ type: SEND_TOKEN_METAMASK_REQUEST });
  metamaskTransferToken({
    tokenObject,
    from: address,
    to: recipient,
    amount: amount,
    gasPrice: gasPrice.value.amount,
    gasLimit: gasLimit
  })
    .then(txHash =>
      dispatch({
        type: SEND_TOKEN_METAMASK_SUCCESS,
        payload: txHash
      })
    )
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: SEND_TOKEN_METAMASK_FAILURE });
    });
};

export const sendToggleConfirmationView = boolean => (dispatch, getState) => {
  let confirm = boolean;
  if (!confirm) {
    confirm = !getState().send.confirm;
  }
  dispatch({ type: SEND_TOGGLE_CONFIRMATION_VIEW, payload: confirm });
};

export const sendUpdateRecipient = recipient => dispatch => {
  const input = recipient.replace(/[^\w.]/g, '');
  if (input.length <= 42) {
    dispatch({
      type: SEND_UPDATE_RECIPIENT,
      payload: input
    });
  }
};

export const sendUpdateAssetAmount = (assetAmount, selected, prices) => (dispatch, getState) => {
  const { prices } = getState().account;
  const _assetAmount = assetAmount.replace(/[^0-9.]/g, '');
  let _nativeAmount = '';
  if (_assetAmount.length && prices[selected.symbol]) {
    const _assetAmountDecimalPlaces = countDecimalPlaces(_assetAmount);
    const nativeAmount = convertAssetAmountToNativeValue(_assetAmount, selected, prices);
    const _nativeAmountDecimalPlaces =
      _assetAmountDecimalPlaces > 8 ? _assetAmountDecimalPlaces : 8;
    _nativeAmount = formatFixedDecimals(nativeAmount, _nativeAmountDecimalPlaces);
  }
  dispatch({
    type: SEND_UPDATE_CRYPTO_AMOUNT,
    payload: { assetAmount: _assetAmount, nativeAmount: _nativeAmount }
  });
};

export const sendUpdateNativeAmount = (nativeAmount, selected, prices) => (dispatch, getState) => {
  const { prices } = getState().account;
  const _nativeAmount = nativeAmount.replace(/[^0-9.]/g, '');
  let _assetAmount = '';
  if (_nativeAmount.length && prices[selected.symbol]) {
    const _nativeAmountDecimalPlaces = countDecimalPlaces(_nativeAmount);
    const assetAmount = convertAssetAmountFromNativeValue(_nativeAmount, selected, prices);
    const _assetAmountDecimalPlaces =
      _nativeAmountDecimalPlaces > 8 ? _nativeAmountDecimalPlaces : 8;
    _assetAmount = formatFixedDecimals(assetAmount, _assetAmountDecimalPlaces);
  }
  dispatch({
    type: SEND_UPDATE_CRYPTO_AMOUNT,
    payload: { assetAmount: _assetAmount, nativeAmount: _nativeAmount }
  });
};

export const sendClearFields = () => ({ type: SEND_CLEAR_FIELDS });

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  fetchingGasPrices: false,
  gasPrice: {},
  gasPrices: {},
  gasLimit: ethUnits.basic_tx,
  gasPriceOption: 'average',
  fetching: false,
  address: '',
  recipient: '',
  nativeAmount: '',
  assetAmount: '',
  transaction: '',
  confirm: false,
  selected: { symbol: 'ETH' }
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SEND_GET_GAS_PRICES_REQUEST:
      return {
        ...state,
        address: action.payload.address,
        selected: action.payload.selected,
        fetchingGasPrices: true
      };
    case SEND_GET_GAS_PRICES_SUCCESS:
      return {
        ...state,
        fetchingGasPrices: false,
        gasPrice: action.payload.average,
        gasPrices: action.payload,
        gasPriceOption: action.payload.average.option
      };
    case SEND_GET_GAS_PRICES_FAILURE:
      return {
        ...state,
        fetchingGasPrices: false
      };
    case SEND_UPDATE_GAS_PRICE_REQUEST:
      return { ...state, fetchingGasPrices: true };
    case SEND_UPDATE_GAS_PRICE_SUCCESS:
    case SEND_UPDATE_GAS_PRICE_FAILURE:
      return {
        ...state,
        fetchingGasPrices: false,
        gasLimit: action.payload.gasLimit,
        gasPrice: action.payload.gasPrice,
        gasPrices: action.payload.gasPrices,
        gasPriceOption: action.payload.gasPriceOption
      };
    case SEND_ETHER_METAMASK_REQUEST:
    case SEND_TOKEN_METAMASK_REQUEST:
      return { ...state, fetching: true };
    case SEND_ETHER_METAMASK_SUCCESS:
    case SEND_TOKEN_METAMASK_SUCCESS:
      return {
        ...state,
        fetching: false,
        gasPrices: {},
        transaction: action.payload
      };
    case SEND_ETHER_METAMASK_FAILURE:
    case SEND_TOKEN_METAMASK_FAILURE:
      return {
        ...state,
        fetching: false,
        transaction: '',
        confirm: false
      };
    case SEND_TOGGLE_CONFIRMATION_VIEW:
      return {
        ...state,
        confirm: action.payload
      };
    case SEND_UPDATE_RECIPIENT:
      return { ...state, recipient: action.payload };
    case SEND_UPDATE_NATIVE_AMOUNT:
    case SEND_UPDATE_CRYPTO_AMOUNT:
      return {
        ...state,
        assetAmount: action.payload.assetAmount,
        nativeAmount: action.payload.nativeAmount
      };
    case SEND_UPDATE_SELECTED:
      return { ...state, selected: action.payload };
    case SEND_UPDATE_PRIVATE_KEY:
      return {
        ...state,
        privateKey: action.payload
      };
    case SEND_CLEAR_FIELDS:
      return { ...state, ...INITIAL_STATE };
    default:
      return state;
  }
};
