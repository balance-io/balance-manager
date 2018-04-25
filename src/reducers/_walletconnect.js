import {
  apiWalletConnectGetSession,
  apiWalletConnectNewTransaction,
  apiWalletConnectGetTransactionStatus
} from '../helpers/api';
import { encryptMessage, decryptMessage } from '../helpers/aes';
import { saveLocal } from '../helpers/utilities';
import { parseError } from '../helpers/parsers';
import { notificationShow } from './_notification';
import { modalClose } from './_modal';
import { accountUpdateAccountAddress } from './_account';

// -- Constants ------------------------------------------------------------- //

const WALLET_CONNECT_NEW_SESSION_REQUEST = 'walletConnect/WALLET_CONNECT_NEW_SESSION_REQUEST';
const WALLET_CONNECT_NEW_SESSION_SUCCESS = 'walletConnect/WALLET_CONNECT_NEW_SESSION_SUCCESS';
const WALLET_CONNECT_NEW_SESSION_FAILURE = 'walletConnect/WALLET_CONNECT_NEW_SESSION_FAILURE';

const WALLET_CONNECT_GET_SESSION_REQUEST = 'walletConnect/WALLET_CONNECT_GET_SESSION_REQUEST';
const WALLET_CONNECT_GET_SESSION_SUCCESS = 'walletConnect/WALLET_CONNECT_GET_SESSION_SUCCESS';
const WALLET_CONNECT_GET_SESSION_FAILURE = 'walletConnect/WALLET_CONNECT_GET_SESSION_FAILURE';

const WALLET_CONNECT_GET_TRANSACTION_STATUS_REQUEST =
  'walletConnect/WALLET_CONNECT_GET_TRANSACTION_STATUS_REQUEST';
const WALLET_CONNECT_GET_TRANSACTION_STATUS_SUCCESS =
  'walletConnect/WALLET_CONNECT_GET_TRANSACTION_STATUS_SUCCESS';
const WALLET_CONNECT_GET_TRANSACTION_STATUS_FAILURE =
  'walletConnect/WALLET_CONNECT_GET_TRANSACTION_STATUS_FAILURE';

const WALLET_CONNECT_NEW_TRANSACTION_REQUEST =
  'walletConnect/WALLET_CONNECT_NEW_TRANSACTION_REQUEST';
const WALLET_CONNECT_NEW_TRANSACTION_SUCCESS =
  'walletConnect/WALLET_CONNECT_NEW_TRANSACTION_SUCCESS';
const WALLET_CONNECT_NEW_TRANSACTION_FAILURE =
  'walletConnect/WALLET_CONNECT_NEW_TRANSACTION_FAILURE';

const WALLET_CONNECT_CLEAR_FIELDS = 'walletConnect/WALLET_CONNECT_CLEAR_FIELDS';

// -- Actions --------------------------------------------------------------- //

let getSessionInterval = null;
let getTransactionStatusInterval = null;

export const walletConnectModalInit = () => async (dispatch, getState) => {
  dispatch({ type: WALLET_CONNECT_NEW_SESSION_REQUEST });
  walletConnectWebConnector.createSession()
    .then(({ session }) => {
      const sessionId = session ? session.sessionId : '';
      const sessionKey = session ? session.sessionKey : '';
      console.log(`session key: ${sessionKey}`);
      dispatch({
        type: WALLET_CONNECT_NEW_SESSION_SUCCESS,
        payload: { sessionId, sessionKey }
      });
      dispatch(walletConnectGetSession());
    })
    .catch(error => {
      console.error(error);
      const message = parseError(error);
      dispatch(notificationShow(message), true);
      dispatch({ type: WALLET_CONNECT_NEW_SESSION_FAILURE });
    });
};

export const walletConnectGetSession = () => (dispatch, getState) => {
  const sessionId = getState().walletconnect.sessionId;
  const sessionKey = getState().walletconnect.sessionKey;
  dispatch({ type: WALLET_CONNECT_GET_SESSION_REQUEST });
  apiWalletConnectGetSession(sessionId)
    .then(({ data }) => {
      const encryptedDeviceDetails = data ? JSON.parse(data.data) : '';
      if (encryptedDeviceDetails) {
        const deviceDetails = decryptMessage(encryptedDeviceDetails, sessionKey);
        const addresses = deviceDetails.addresses;
        dispatch({
          type: WALLET_CONNECT_GET_SESSION_SUCCESS,
          payload: addresses
        });
        // Q: do I need to also saveLocal the device UUID?
        saveLocal('walletconnect', addresses);
        dispatch(modalClose());
        // Q: do I need to add account update wallet connect for device UUID?
        dispatch(accountUpdateAccountAddress(addresses[0], 'WALLETCONNECT'));
        window.browserHistory.push('/wallet');
      } else if (!getState().walletconnect.addresses.length) {
        getSessionInterval = setTimeout(() => dispatch(walletConnectGetSession()), 500);
      }
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message), true);
      dispatch({ type: WALLET_CONNECT_GET_SESSION_FAILURE });
      getSessionInterval = setTimeout(() => dispatch(walletConnectGetSession()), 500);
    });
};

export const walletConnectNewTransaction = (transactionDetails, dappName) => (
  dispatch,
  getState
) => {
  const sessionKey = getState().walletconnect.sessionKey;
  const sessionId = getState().walletconnect.sessionId;
  const encryptedTransactionDetails = encryptMessage(transactionDetails, sessionKey);
  dispatch({ type: WALLET_CONNECT_NEW_TRANSACTION_REQUEST });
  apiWalletConnectNewTransaction(sessionId, encryptedTransactionDetails, dappName)
    .then(({ data }) => {
      const transactionId = data ? data.transactionId : '';
      dispatch({
        type: WALLET_CONNECT_NEW_TRANSACTION_SUCCESS,
        payload: transactionId
      });
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message), true);
      dispatch({ type: WALLET_CONNECT_NEW_TRANSACTION_FAILURE });
    });
};

export const walletConnectGetTransactionStatus = transactionId => (dispatch, getState) => {
  const sessionId = getState().walletconnect.sessionId;
  const sessionKey = getState().walletconnect.sessionKey;
  dispatch({ type: WALLET_CONNECT_GET_TRANSACTION_STATUS_REQUEST });
  apiWalletConnectGetTransactionStatus(sessionId, transactionId)
    .then(({ data }) => {
      const encryptedTransactionStatus = data ? data.data : '';
      if (encryptedTransactionStatus) {
        const transactionStatus = decryptMessage(encryptedTransactionStatus, sessionKey);
        const transactionSuccess = transactionStatus.success;
        if (transactionSuccess) {
          const transactionHash = transactionStatus.transactionHash;
          dispatch({
            type: WALLET_CONNECT_GET_TRANSACTION_STATUS_SUCCESS,
            payload: transactionHash
          });
          dispatch(modalClose());
        } else {
          dispatch({ type: WALLET_CONNECT_GET_TRANSACTION_STATUS_FAILURE });
          // Q: do anything else if failed?
        }
        //Q: any specific check required?
      } else {
        getTransactionStatusInterval = setTimeout(() => dispatch(walletConnectGetTransactionStatus(transactionId)), 500);
      }
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message), true);
      dispatch({ type: WALLET_CONNECT_GET_TRANSACTION_STATUS_FAILURE });
      getTransactionStatusInterval = setTimeout(() => dispatch(walletConnectGetTransactionStatus(transactionId)), 500);
    });
};

export const walletConnectClearFields = () => (dispatch) => {
  clearTimeout(getSessionInterval);
  clearTimeout(getTransactionStatusInterval);
  dispatch({ type: WALLET_CONNECT_CLEAR_FIELDS });
}

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  fetching: false,
  sessionId: '',
  transactionId: '',
  addresses: [],
  sessionKey: {},
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case WALLET_CONNECT_NEW_SESSION_REQUEST:
      return {
        ...state,
        fetching: true
      };
    case WALLET_CONNECT_NEW_SESSION_SUCCESS:
      return {
        ...state,
        fetching: false,
        sessionId: action.payload.sessionId,
        sessionKey: action.payload.sessionKey
      };
    case WALLET_CONNECT_NEW_SESSION_FAILURE:
      return {
        ...state,
        fetching: false,
        sessionId: ''
      };
    case WALLET_CONNECT_GET_SESSION_REQUEST:
      return { ...state, fetching: true };
    case WALLET_CONNECT_GET_SESSION_SUCCESS:
      return {
        ...state,
        addresses: action.payload,
        fetching: false
      };
    case WALLET_CONNECT_GET_SESSION_FAILURE:
      return {
        ...state,
        fetching: false,
        addresses: [],
        sessionId: '',
      };
    case WALLET_CONNECT_NEW_TRANSACTION_REQUEST:
      return { ...state, fetching: true };
    case WALLET_CONNECT_NEW_TRANSACTION_SUCCESS:
      return {
        ...state,
        transactionId: action.payload,
        fetching: false
      };
    case WALLET_CONNECT_NEW_TRANSACTION_FAILURE:
      return {
        ...state,
        fetching: false,
        transactionId: ''
      };
    case WALLET_CONNECT_GET_TRANSACTION_STATUS_REQUEST:
      return { ...state, fetching: true };
    case WALLET_CONNECT_GET_TRANSACTION_STATUS_SUCCESS:
      return {
        ...state,
        transactionHash: action.payload,
        fetching: false
      };
    case WALLET_CONNECT_GET_TRANSACTION_STATUS_FAILURE:
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
