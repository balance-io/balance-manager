import { saveWalletConnectAccount } from '../handlers/localstorage';
import { parseError } from '../handlers/parsers';
import { notificationShow } from './_notification';
import { modalClose } from './_modal';
import { accountUpdateAccountAddress } from './_account';
import { walletConnectInit } from '../handlers/walletconnect';

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

export const walletConnectModalInit = () => async (dispatch, getState) => {
  dispatch({ type: WALLET_CONNECT_NEW_SESSION_REQUEST });
  walletConnectInit()
    .then(walletConnectInstance => {
      const { bridgeUrl, webConnector } = walletConnectInstance;
      const request = {
        domain: bridgeUrl,
        sessionId: webConnector.sessionId,
        sharedKey: webConnector.sharedKey,
        dappName: webConnector.dappName,
      };
      const qrcode = JSON.stringify(request);
      dispatch({
        type: WALLET_CONNECT_NEW_SESSION_SUCCESS,
        payload: { qrcode },
      });
      dispatch(walletConnectGetSession(webConnector));
    })
    .catch(error => {
      console.error(error);
      const message = parseError(error);
      dispatch(notificationShow(message), true);
      dispatch({ type: WALLET_CONNECT_NEW_SESSION_FAILURE });
    });
};

export const walletConnectGetSession = webConnector => (dispatch, getState) => {
  dispatch({ type: WALLET_CONNECT_GET_SESSION_REQUEST });
  webConnector.listenSessionStatus((error, data) => {
    const fetching = getState().walletconnect.fetching;
    if (error && fetching) {
      dispatch({ type: WALLET_CONNECT_GET_SESSION_FAILURE });
      dispatch(walletConnectModalInit());
    } else if (!error && data) {
      const accountAddress = data ? data[0].toLowerCase() : null;
      dispatch({
        type: WALLET_CONNECT_GET_SESSION_SUCCESS,
        payload: accountAddress,
      });
      saveWalletConnectAccount(accountAddress);
      dispatch(accountUpdateAccountAddress(accountAddress, 'WALLETCONNECT'));
      dispatch(modalClose());
      window.browserHistory.push('/wallet');
    }
  });
};

export const walletConnectClearFields = () => (dispatch, getState) => {
  dispatch({
    type: WALLET_CONNECT_CLEAR_FIELDS,
  });
};

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  accountAddress: '',
  fetching: false,
  qrcode: '',
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
        qrcode: action.payload.qrcode,
      };
    case WALLET_CONNECT_NEW_SESSION_FAILURE:
      return {
        ...state,
        fetching: false,
        qrcode: '',
      };
    case WALLET_CONNECT_GET_SESSION_REQUEST:
      return { ...state, fetching: true };
    case WALLET_CONNECT_GET_SESSION_SUCCESS:
      return {
        ...state,
        fetching: false,
        accountAddress: action.payload,
      };
    case WALLET_CONNECT_GET_SESSION_FAILURE:
      return {
        ...state,
        fetching: false,
        qrcode: '',
      };
    case WALLET_CONNECT_CLEAR_FIELDS:
      return { ...state, ...INITIAL_STATE };
    default:
      return state;
  }
};
