import { saveLocal } from '../helpers/utilities';
import { parseError } from '../helpers/parsers';
import { notificationShow } from './_notification';
import { modalClose } from './_modal';
import { accountUpdateAccountAddress } from './_account';
import { WebConnector } from 'walletconnect';

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
  // Q: dapp name
  const webConnector = new WebConnector("https://walletconnect.balance.io", { "dappName": "Balance Manager" });
  dispatch({ type: WALLET_CONNECT_NEW_SESSION_REQUEST });
  webConnector.createSession()
    .then(({ session }) => {
      dispatch({
        type: WALLET_CONNECT_NEW_SESSION_SUCCESS,
        payload: webConnector
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
  const webConnector = getState().walletconnect.webConnector;
  dispatch({ type: WALLET_CONNECT_GET_SESSION_REQUEST });
  webConnector.listenSessionStatus((error, data) => {
    if (error) {
      const message = parseError(error);
      dispatch(notificationShow(message), true);
      dispatch({ type: WALLET_CONNECT_GET_SESSION_FAILURE });
    }
    else if (data) {
        dispatch({
          type: WALLET_CONNECT_GET_SESSION_SUCCESS,
          payload: data.address
        });
        // Q: do I need to also saveLocal the device UUID?
        saveLocal('walletconnect', data.address);
        dispatch(modalClose());
        // Q: do I need to add account update wallet connect for device UUID?
        dispatch(accountUpdateAccountAddress(data.address, 'WALLETCONNECT'));
        window.browserHistory.push('/wallet');
    }
  })
};

export const walletConnectNewTransaction = (transactionDetails, dappName) => (
  dispatch,
  getState
) => {
  const webConnector = getState().walletconnect.webConnector;
  dispatch({ type: WALLET_CONNECT_NEW_TRANSACTION_REQUEST });
  webConnector.createTransaction(transactionDetails)
    .then(({ transactionId }) => {
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
  const webConnector = getState().walletconnect.webConnector;
  dispatch({ type: WALLET_CONNECT_GET_TRANSACTION_STATUS_REQUEST });
  webConnector.listenTransactionStatus(transactionId)
    .then(({ err, data }) => {
      if (data) {
        const transactionSuccess = data.success;
        if (transactionSuccess) {
          const transactionHash = data.transactionHash;
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
  transactionId: '',
  address: '',
  webConnector: null
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
        webConnector: action.payload
      };
    case WALLET_CONNECT_NEW_SESSION_FAILURE:
      return {
        ...state,
        fetching: false,
        webConnector: null
      };
    case WALLET_CONNECT_GET_SESSION_REQUEST:
      return { ...state, fetching: true };
    case WALLET_CONNECT_GET_SESSION_SUCCESS:
      return {
        ...state,
        address: action.payload,
        fetching: false
      };
    case WALLET_CONNECT_GET_SESSION_FAILURE:
      return {
        ...state,
        fetching: false,
        address: '',
        webConnector: null,
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
