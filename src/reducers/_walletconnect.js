import { saveLocal } from '../handlers/localstorage';
import { parseError } from '../handlers/parsers';
import { notificationShow } from './_notification';
import { modalClose } from './_modal';
import { accountUpdateAccountAddress } from './_account';
import {
  walletConnectInit,
  walletConnectEthAccounts,
} from '../handlers/walletconnect';

// -- Constants ------------------------------------------------------------- //

const WALLET_CONNECT_NEW_SESSION_REQUEST =
  'walletConnect/WALLET_CONNECT_NEW_SESSION_REQUEST';
const WALLET_CONNECT_NEW_SESSION_SUCCESS =
  'walletConnect/WALLET_CONNECT_NEW_SESSION_SUCCESS';
const WALLET_CONNECT_NEW_SESSION_FAILURE =
  'walletConnect/WALLET_CONNECT_NEW_SESSION_FAILURE';

const WALLET_CONNECT_GET_SESSION_REQUEST =
  'walletConnect/WALLET_CONNECT_GET_SESSION_REQUEST';
const WALLET_CONNECT_GET_SESSION_SUCCESS =
  'walletConnect/WALLET_CONNECT_GET_SESSION_SUCCESS';
const WALLET_CONNECT_GET_SESSION_FAILURE =
  'walletConnect/WALLET_CONNECT_GET_SESSION_FAILURE';

const WALLET_CONNECT_CLEAR_FIELDS = 'walletConnect/WALLET_CONNECT_CLEAR_FIELDS';

// -- Actions --------------------------------------------------------------- //

let getSessionInterval = null;
let getTransactionStatusInterval = null;

export const walletConnectModalInit = () => async (dispatch, getState) => {
  dispatch({ type: WALLET_CONNECT_NEW_SESSION_REQUEST });
  walletConnectInit()
    .then(walletConnectInstance => {
      dispatch({
        type: WALLET_CONNECT_NEW_SESSION_SUCCESS,
        payload: walletConnectInstance.webConnector,
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
  dispatch({ type: WALLET_CONNECT_GET_SESSION_REQUEST });
  walletConnectEthAccounts((error, data) => {
    if (error) {
      const message = parseError(error);
      dispatch(notificationShow(message), true);
      dispatch({ type: WALLET_CONNECT_GET_SESSION_FAILURE });
    } else if (data) {
      dispatch({
        type: WALLET_CONNECT_GET_SESSION_SUCCESS,
      });
      const accountAddress = data.address.toLowerCase();
      saveLocal('walletconnect', accountAddress);
      dispatch(accountUpdateAccountAddress(accountAddress, 'WALLETCONNECT'));
      dispatch(modalClose());
      window.browserHistory.push('/wallet');
    }
  });
};

export const walletConnectClearFields = () => dispatch => {
  clearTimeout(getSessionInterval);
  clearTimeout(getTransactionStatusInterval);
  dispatch({ type: WALLET_CONNECT_CLEAR_FIELDS });
};

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  fetching: false,
  webConnector: null,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case WALLET_CONNECT_NEW_SESSION_REQUEST:
      return {
        ...state,
        fetching: true,
      };
    case WALLET_CONNECT_NEW_SESSION_SUCCESS:
      return {
        ...state,
        fetching: false,
        webConnector: action.payload,
      };
    case WALLET_CONNECT_NEW_SESSION_FAILURE:
      return {
        ...state,
        fetching: false,
        webConnector: null,
      };
    case WALLET_CONNECT_GET_SESSION_REQUEST:
      return { ...state, fetching: true };
    case WALLET_CONNECT_GET_SESSION_SUCCESS:
      return {
        ...state,
        fetching: false,
      };
    case WALLET_CONNECT_GET_SESSION_FAILURE:
      return {
        ...state,
        fetching: false,
        webConnector: null,
      };
    case WALLET_CONNECT_CLEAR_FIELDS:
      return { ...state, ...INITIAL_STATE };
    default:
      return state;
  }
};
