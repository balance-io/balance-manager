import {
  apiWalletConnectInit,
  apiWalletConnectGetAddress,
  apiWalletConnectGetTransactionStatus,
  apiWalletConnectInitiateTransaction
} from '../helpers/api';
import { saveLocal } from '../helpers/utilities';
import { parseError } from '../helpers/parsers';
import { notificationShow } from './_notification';
import { modalClose } from './_modal';
import { accountUpdateWalletConnect } from './_account';

// -- Constants ------------------------------------------------------------- //

const WALLET_CONNECT_SEND_TOKEN_REQUEST = 'walletConnect/WALLET_CONNECT_SEND_TOKEN_REQUEST';
const WALLET_CONNECT_SEND_TOKEN_SUCCESS = 'walletConnect/WALLET_CONNECT_SEND_TOKEN_SUCCESS';
const WALLET_CONNECT_SEND_TOKEN_FAILURE = 'walletConnect/WALLET_CONNECT_SEND_TOKEN_FAILURE';

const WALLET_CONNECT_GET_ADDRESS_REQUEST = 'walletConnect/WALLET_CONNECT_GET_ADDRESS_REQUEST';
const WALLET_CONNECT_GET_ADDRESS_SUCCESS = 'walletConnect/WALLET_CONNECT_GET_ADDRESS_SUCCESS';
const WALLET_CONNECT_GET_ADDRESS_FAILURE = 'walletConnect/WALLET_CONNECT_GET_ADDRESS_FAILURE';

const WALLET_CONNECT_GET_TRANSACTION_STATUS_REQUEST =
  'walletConnect/WALLET_CONNECT_GET_TRANSACTION_STATUS_REQUEST';
const WALLET_CONNECT_GET_TRANSACTION_STATUS_SUCCESS =
  'walletConnect/WALLET_CONNECT_GET_TRANSACTION_STATUS_SUCCESS';
const WALLET_CONNECT_GET_TRANSACTION_STATUS_FAILURE =
  'walletConnect/WALLET_CONNECT_GET_TRANSACTION_STATUS_FAILURE';

const WALLET_CONNECT_INITIATE_TRANSACTION_REQUEST =
  'walletConnect/WALLET_CONNECT_INITIATE_TRANSACTION_REQUEST';
const WALLET_CONNECT_INITIATE_TRANSACTION_SUCCESS =
  'walletConnect/WALLET_CONNECT_INITIATE_TRANSACTION_SUCCESS';
const WALLET_CONNECT_INITIATE_TRANSACTION_FAILURE =
  'walletConnect/WALLET_CONNECT_INITIATE_TRANSACTION_FAILURE';

const WALLET_CONNECT_CLEAR_FIELDS = 'walletConnect/WALLET_CONNECT_CLEAR_FIELDS';

// -- Actions --------------------------------------------------------------- //

export const walletConnectGetAddress = () => (dispatch, getState) => {
  const sessionToken = getState().walletconnect.sessionToken;
  dispatch({ type: WALLET_CONNECT_GET_ADDRESS_REQUEST });
  apiWalletConnectGetAddress(sessionToken)
    .then(({ data }) => {
      const deviceUuid = data ? data.deviceUuid : '';
      const address = data ? JSON.parse(data.encryptedDeviceDetails).addresses[0] : '';
      // Q: why only taking the first address?
      if (address) {
        dispatch({
          type: WALLET_CONNECT_GET_ADDRESS_SUCCESS,
          payload: { address, deviceUuid }
        });
        // Q: do I need to also saveLocal the device UUID?
        saveLocal('walletconnect', address);
        dispatch(modalClose());
        // Q: do I need to add account update wallet connect for device UUID?
        dispatch(accountUpdateWalletConnect(address));
        window.browserHistory.push('/wallet');
      } else if (!getState().walletconnect.address) {
        setTimeout(() => dispatch(walletConnectGetAddress()), 500);
      }
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message), true);
      dispatch({ type: WALLET_CONNECT_GET_ADDRESS_FAILURE });
      setTimeout(() => dispatch(walletConnectGetAddress()), 500);
    });
};

export const walletConnectGetTransactionStatus = (transactionUuid) => (dispatch, getState) => {
  const deviceUuid = getState().walletconnect.deviceUuid;
  dispatch({ type: WALLET_CONNECT_GET_TRANSACTION_STATUS_REQUEST });
  apiWalletConnectGetTransactionStatus(deviceUuid, transactionUuid)
    .then(({ data }) => {
      const transactionSuccess = data ? data.success : '';
      const transactionHash = data ? data.transactionHash : '';
      // Q: differentiating between true, false, nil
      if (transactionSuccess) {
        dispatch({
          type: WALLET_CONNECT_GET_TRANSACTION_STATUS_SUCCESS,
          payload: transactionHash
        });
        dispatch(modalClose());
      } else if (!getState().walletconnect.address) {
        setTimeout(() => dispatch(walletConnectGetTransactionStatus(transactionUuid)), 500);
      }
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message), true);
      dispatch({ type: WALLET_CONNECT_GET_TRANSACTION_STATUS_FAILURE });
      setTimeout(() => dispatch(walletConnectGetTransactionStatus(transactionUuid)), 500);
    });
};

export const walletConnectInitiateTransaction = (
  encryptedTransactionDetails,
  notificationDetails
) => (dispatch, getState) => {
  const deviceUuid = getState().walletconnect.deviceUuid;
  // Q: get transaction details and make encryptedTransactionDetails, notificationDetails (json with  notficationTitle, notificationBody)
  dispatch({ type: WALLET_CONNECT_INITIATE_TRANSACTION_REQUEST });
  apiWalletConnectInitiateTransaction(
    deviceUuid,
    encryptedTransactionDetails,
    notificationDetails
  )
    .then(({ data }) => {
      const transactionUuid = data ? data.transactionUuid : '';
      dispatch({
        type: WALLET_CONNECT_INITIATE_TRANSACTION_SUCCESS,
        payload: transactionUuid
      });
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message), true);
      dispatch({ type: WALLET_CONNECT_INITIATE_TRANSACTION_FAILURE });
    });
};

export const wallletConnectModalInit = () => (dispatch, getState) => {
  dispatch({ type: WALLET_CONNECT_SEND_TOKEN_REQUEST });
  apiWalletConnectInit()
    .then(({ data }) => {
      const sessionToken = data ? data.sessionToken : '';
      dispatch({
        type: WALLET_CONNECT_SEND_TOKEN_SUCCESS,
        payload: sessionToken
      });
      dispatch(walletConnectGetAddress());
    })
    .catch(error => {
      console.error(error);
      const message = parseError(error);
      dispatch(notificationShow(message), true);
      dispatch({ type: WALLET_CONNECT_SEND_TOKEN_FAILURE });
    });
};

export const wallletConnectClearFields = () => ({ type: WALLET_CONNECT_CLEAR_FIELDS });

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  fetching: false,
  sessionToken: '',
  transactionUuid: '',
  deviceUuid: '',
  address: ''
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case WALLET_CONNECT_SEND_TOKEN_REQUEST:
      return {
        ...state,
        fetching: true
      };
    case WALLET_CONNECT_SEND_TOKEN_SUCCESS:
      return {
        ...state,
        fetching: false,
        sessionToken: action.payload
      };
    case WALLET_CONNECT_SEND_TOKEN_FAILURE:
      return {
        ...state,
        fetching: false,
        sessionToken: ''
      };
    case WALLET_CONNECT_GET_ADDRESS_REQUEST:
      return { ...state, fetching: true };
    case WALLET_CONNECT_GET_ADDRESS_SUCCESS:
      return {
        ...state,
        address: action.payload.address,
        deviceUuid: action.payload.deviceUuid,
        fetching: false
      };
    case WALLET_CONNECT_GET_ADDRESS_FAILURE:
      return {
        ...state,
        fetching: false,
        address: '',
        deviceUuid: ''
      };
    case WALLET_CONNECT_INITIATE_TRANSACTION_REQUEST:
      return { ...state, fetching: true };
    case WALLET_CONNECT_INITIATE_TRANSACTION_SUCCESS:
      return {
        ...state,
        transactionUuid: action.payload,
        fetching: false
      };
    case WALLET_CONNECT_INITIATE_TRANSACTION_FAILURE:
      return {
        ...state,
        fetching: false,
        transactionUuid: ''
      };
    case WALLET_CONNECT_GET_TRANSACTION_HASH_REQUEST:
      return { ...state, fetching: true };
    case WALLET_CONNECT_GET_TRANSACTION_HASH_SUCCESS:
      return {
        ...state,
        transactionHash: action.payload,
        fetching: false
      };
    case WALLET_CONNECT_GET_TRANSACTION_HASH_FAILURE:
      return {
        ...state,
        fetching: false,
        transactionHash: ''
      };
    case WALLET_CONNECT_CLEAR_FIELDS:
      return { ...state, ...INITIAL_STATE };
    default:
      return state;
  }
};
