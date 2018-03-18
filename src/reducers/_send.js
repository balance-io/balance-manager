import { apiGetGasPrices } from '../helpers/api';
import { notificationShow } from './_notification';
import { fromWei, convertFromNativeValue, convertToNativeValue } from '../helpers/utilities';
import { parseError } from '../helpers/parsers';
import {
  metamaskSendTransaction,
  metamaskTransferToken,
  sendSignedTransaction,
  transferToken,
  getTransactionFee
} from '../helpers/web3';

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

const SEND_ETHER_CLIENT_REQUEST = 'send/SEND_ETHER_CLIENT_REQUEST';
const SEND_ETHER_CLIENT_SUCCESS = 'send/SEND_ETHER_CLIENT_SUCCESS';
const SEND_ETHER_CLIENT_FAILURE = 'send/SEND_ETHER_CLIENT_FAILURE';

const SEND_TOKEN_METAMASK_REQUEST = 'send/SEND_TOKEN_METAMASK_REQUEST';
const SEND_TOKEN_METAMASK_SUCCESS = 'send/SEND_TOKEN_METAMASK_SUCCESS';
const SEND_TOKEN_METAMASK_FAILURE = 'send/SEND_TOKEN_METAMASK_FAILURE';

const SEND_TOKEN_CLIENT_REQUEST = 'send/SEND_TOKEN_CLIENT_REQUEST';
const SEND_TOKEN_CLIENT_SUCCESS = 'send/SEND_TOKEN_CLIENT_SUCCESS';
const SEND_TOKEN_CLIENT_FAILURE = 'send/SEND_TOKEN_CLIENT_FAILURE';

const SEND_TOGGLE_CONFIRMATION_VIEW = 'send/SEND_TOGGLE_CONFIRMATION_VIEW';

const SEND_UPDATE_NATIVE_AMOUNT = 'send/SEND_UPDATE_NATIVE_AMOUNT';

const SEND_UPDATE_RECIPIENT = 'send/SEND_UPDATE_RECIPIENT';
const SEND_UPDATE_CRYPTO_AMOUNT = 'send/SEND_UPDATE_CRYPTO_AMOUNT';
const SEND_UPDATE_SELECTED = 'send/SEND_UPDATE_SELECTED';
const SEND_UPDATE_PRIVATE_KEY = 'send/SEND_UPDATE_PRIVATE_KEY';

const SEND_CLEAR_FIELDS = 'send/SEND_CLEAR_FIELDS';

// -- Actions --------------------------------------------------------------- //

export const sendGetGasPrices = () => (dispatch, getState) => {
  dispatch({ type: SEND_GET_GAS_PRICES_REQUEST });
  apiGetGasPrices()
    .then(({ data }) => {
      data.fastest = parseInt(data.fastest, 10) / 10;
      data.fast = parseInt(data.fast, 10) / 10;
      data.average = parseInt(data.average, 10) / 10;
      data.safeLow = parseInt(data.safeLow, 10) / 10;
      const txFee = fromWei(21000 * data.average * 10 ** 9);
      dispatch({
        type: SEND_GET_GAS_PRICES_SUCCESS,
        payload: { gasPrices: data, txFee }
      });
    })
    .catch(error => {
      console.error(error);
      dispatch(notificationShow(`Failed to get Ethereum Gas prices`, true));
      dispatch({ type: SEND_GET_GAS_PRICES_FAILURE });
    });
};

export const sendUpdateGasPrice = newGasPriceOption => (dispatch, getState) => {
  const { send } = getState();
  const { selected, recipient, cryptoAmount, gasPrice, gasPriceOption, gasPrices } = send;
  const _gasPriceOption = newGasPriceOption || gasPriceOption;
  const _gasPrice = gasPriceOption ? gasPrices[_gasPriceOption] : gasPrice;
  dispatch({ type: SEND_UPDATE_GAS_PRICE_REQUEST });
  getTransactionFee({ tokenObject: selected, recipient, amount: cryptoAmount, gasPrice: _gasPrice })
    .then(txFee =>
      dispatch({
        type: SEND_UPDATE_GAS_PRICE_SUCCESS,
        payload: { txFee, gasPrice: _gasPrice, gasPriceOption: _gasPriceOption }
      })
    )
    .catch(error => {
      console.error(error);
      dispatch(notificationShow(`Failed to estimate Transaction fee`, true));
      dispatch({
        type: SEND_UPDATE_GAS_PRICE_FAILURE,
        payload: { txFee: '', gasPrice: _gasPrice, gasPriceOption: _gasPriceOption }
      });
    });
};

export const sendUpdateSelected = selected => (dispatch, getState) => {
  dispatch({ type: SEND_UPDATE_SELECTED, payload: selected });
  dispatch(sendUpdateGasPrice());
};

export const sendEtherMetamask = ({ address, recipient, amount, gasPrice }) => dispatch => {
  dispatch({ type: SEND_ETHER_METAMASK_REQUEST });
  const _gasPrice = String(parseInt(gasPrice, 10) * 10 ** 9);
  metamaskSendTransaction({
    from: address,
    to: recipient,
    value: amount,
    gasPrice: _gasPrice
  })
    .then(txHash =>
      dispatch({
        type: SEND_ETHER_METAMASK_SUCCESS,
        payload: txHash
      })
    )
    .catch(error => {
      console.error(error);
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: SEND_ETHER_METAMASK_FAILURE });
    });
};

export const sendTokenMetamask = ({
  address,
  recipient,
  amount,
  tokenObject,
  gasPrice
}) => dispatch => {
  dispatch({ type: SEND_TOKEN_METAMASK_REQUEST });
  const _gasPrice = String(parseInt(gasPrice, 10) * 10 ** 9);
  metamaskTransferToken({
    tokenObject,
    from: address,
    to: recipient,
    amount: amount,
    gasPrice: _gasPrice
  })
    .then(txHash =>
      dispatch({
        type: SEND_TOKEN_METAMASK_SUCCESS,
        payload: txHash
      })
    )
    .catch(error => {
      console.error(error);
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: SEND_TOKEN_METAMASK_FAILURE });
    });
};

export const sendEtherClient = ({
  address,
  recipient,
  amount,
  privateKey,
  gasPrice
}) => dispatch => {
  const _gasPrice = String(parseInt(gasPrice, 10) * 10 ** 9);
  dispatch({ type: SEND_ETHER_CLIENT_REQUEST });
  sendSignedTransaction({
    from: address,
    to: recipient,
    value: amount,
    gasPrice: _gasPrice,
    privateKey
  })
    .then(txHash =>
      dispatch({
        type: SEND_ETHER_CLIENT_SUCCESS,
        payload: txHash
      })
    )
    .catch(error => {
      console.error(error);
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: SEND_ETHER_CLIENT_FAILURE });
    });
};

export const sendTokenClient = ({
  address,
  recipient,
  amount,
  tokenObject,
  privateKey,
  gasPrice
}) => dispatch => {
  const _gasPrice = String(parseInt(gasPrice, 10) * 10 ** 9);
  dispatch({ type: SEND_TOKEN_CLIENT_REQUEST });
  transferToken({
    tokenObject,
    from: address,
    to: recipient,
    amount: amount,
    gasPrice: _gasPrice,
    privateKey: privateKey
  })
    .then(txHash =>
      dispatch({
        type: SEND_TOKEN_CLIENT_SUCCESS,
        payload: txHash
      })
    )
    .catch(error => {
      console.error(error);
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: SEND_TOKEN_CLIENT_FAILURE });
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

export const sendUpdateNativeAmount = (nativeAmount, selected, prices) => dispatch => {
  const _nativeAmount = nativeAmount.replace(/[^0-9.]/g, '');
  const cryptoAmount =
    String(convertFromNativeValue(_nativeAmount, selected, prices)) || _nativeAmount;
  dispatch({
    type: SEND_UPDATE_CRYPTO_AMOUNT,
    payload: { cryptoAmount, nativeAmount: _nativeAmount }
  });
};

export const sendUpdateCryptoAmount = (cryptoAmount, selected, prices) => dispatch => {
  const _cryptoAmount = cryptoAmount.replace(/[^0-9.]/g, '');
  const nativeAmount =
    String(convertToNativeValue(_cryptoAmount, selected, prices)) || _cryptoAmount;
  dispatch({
    type: SEND_UPDATE_CRYPTO_AMOUNT,
    payload: { cryptoAmount: _cryptoAmount, nativeAmount }
  });
};

export const sendUpdatePrivateKey = privateKey => dispatch => {
  const input = privateKey.replace(/[^\w]/g, '');
  if (input.length <= 66) {
    dispatch({
      type: SEND_UPDATE_PRIVATE_KEY,
      payload: input
    });
  }
};

export const sendClearFields = () => ({ type: SEND_CLEAR_FIELDS });

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  fetchingGasPrices: false,
  txFee: '',
  gasPrices: {},
  gasPrice: 0,
  gasPriceOption: 'average',
  fetching: false,
  recipient: '',
  nativeAmount: '',
  cryptoAmount: '',
  transaction: '',
  privateKey: '',
  confirm: false,
  selected: { symbol: 'ETH' }
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SEND_GET_GAS_PRICES_REQUEST:
      return { ...state, fetchingGasPrices: true };
    case SEND_GET_GAS_PRICES_SUCCESS:
      return {
        ...state,
        fetchingGasPrices: false,
        gasPrices: action.payload.gasPrices,
        gasPrice: action.payload.gasPrices.average,
        gasPriceOption: 'average',
        txFee: action.payload.txFee
      };
    case SEND_GET_GAS_PRICES_FAILURE:
      return {
        ...state,
        fetchingGasPrices: false,
        txFee: ''
      };
    case SEND_UPDATE_GAS_PRICE_REQUEST:
      return { ...state, fetchingGasPrices: true };
    case SEND_UPDATE_GAS_PRICE_SUCCESS:
    case SEND_UPDATE_GAS_PRICE_FAILURE:
      return {
        ...state,
        fetchingGasPrices: false,
        gasPrice: action.payload.gasPrice,
        gasPriceOption: action.payload.gasPriceOption,
        txFee: action.payload.txFee
      };
    case SEND_ETHER_METAMASK_REQUEST:
    case SEND_ETHER_CLIENT_REQUEST:
    case SEND_TOKEN_METAMASK_REQUEST:
    case SEND_TOKEN_CLIENT_REQUEST:
      return { ...state, fetching: true };
    case SEND_ETHER_METAMASK_SUCCESS:
    case SEND_TOKEN_METAMASK_SUCCESS:
      return {
        ...state,
        fetching: false,
        gasPrices: {},
        transaction: action.payload
      };
    case SEND_ETHER_CLIENT_SUCCESS:
    case SEND_TOKEN_CLIENT_SUCCESS:
      return {
        ...state,
        fetching: false,
        gasPrices: {},
        transaction: action.payload,
        privateKey: ''
      };
    case SEND_ETHER_METAMASK_FAILURE:
    case SEND_TOKEN_METAMASK_FAILURE:
      return {
        ...state,
        fetching: false,
        transaction: '',
        confirm: false
      };
    case SEND_ETHER_CLIENT_FAILURE:
    case SEND_TOKEN_CLIENT_FAILURE:
      return {
        ...state,
        fetching: false,
        transaction: '',
        privateKey: '',
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
        cryptoAmount: action.payload.cryptoAmount,
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
