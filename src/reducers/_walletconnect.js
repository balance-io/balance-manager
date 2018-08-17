import WalletConnect from 'walletconnect';
import { parseError } from 'balance-common';
import { notificationShow } from './_notification';
import { modalClose } from './_modal';
import { accountUpdateAccountAddress, commonStorage } from 'balance-common';
import { walletConnectNewSession } from '../handlers/walletconnect';

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
const WALLET_CONNECT_CLEAR_STATE = 'walletConnect/WALLET_CONNECT_CLEAR_STATE';

// -- Actions --------------------------------------------------------------- //

export const walletConnectModalInit = () => (dispatch, getState) => {
  dispatch({ type: WALLET_CONNECT_NEW_SESSION_REQUEST });
  walletConnectNewSession()
    .then(webConnector => {
      const request = {
        domain: webConnector.bridgeUrl,
        sessionId: webConnector.sessionId,
        sharedKey: webConnector.sharedKey,
        dappName: webConnector.dappName,
      };
      const qrcode = JSON.stringify(request); //webConnector.qrcode;
      dispatch({
        type: WALLET_CONNECT_NEW_SESSION_SUCCESS,
        payload: { qrcode },
      });
      dispatch(walletConnectListenForSession(webConnector));
    })
    .catch(error => {
      console.error(error);
      const message = parseError(error);
      dispatch(notificationShow(message), true);
      dispatch({ type: WALLET_CONNECT_NEW_SESSION_FAILURE });
    });
};

export const walletConnectHasValidSession = () => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    commonStorage
      .getWalletConnectSession()
      .then(walletConnectDetails => {
        if (!walletConnectDetails) {
          resolve(false);
        }
        dispatch({ type: WALLET_CONNECT_GET_SESSION_REQUEST });
        const webConnector = new WalletConnect(walletConnectDetails);
        webConnector
          .getSessionStatus()
          .then(response => {
            if (response) {
              const accountAddress = response.data[0] || null;
              dispatch({
                type: WALLET_CONNECT_GET_SESSION_SUCCESS,
                payload: accountAddress,
              });
              dispatch(
                accountUpdateAccountAddress(accountAddress, 'WALLETCONNECT'),
              );
              resolve(true);
            } else {
              dispatch({ type: WALLET_CONNECT_GET_SESSION_FAILURE });
              resolve(false);
            }
          })
          .catch(error => {
            reject(error);
          });
      })
      .catch(error => {
        resolve(false);
      });
  });
};

export const walletConnectListenForSession = webConnector => (
  dispatch,
  getState,
) => {
  dispatch({ type: WALLET_CONNECT_GET_SESSION_REQUEST });
  webConnector.listenSessionStatus((error, data) => {
    const fetching = getState().walletconnect.fetching;
    if (error && fetching) {
      dispatch({ type: WALLET_CONNECT_GET_SESSION_FAILURE });
      dispatch(walletConnectModalInit());
    } else if (!error && data) {
      const accountAddress = data ? data.data[0].toLowerCase() : null;
      commonStorage.saveWalletConnectSession(
        {
          bridgeUrl: webConnector.bridgeUrl,
          dappName: webConnector.dappName,
          sessionId: webConnector.sessionId,
          sharedKey: webConnector.sharedKey,
        },
        data.ttlInSeconds,
      );
      dispatch({
        type: WALLET_CONNECT_GET_SESSION_SUCCESS,
        payload: accountAddress,
      });
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

export const walletConnectClearState = () => dispatch => {
  dispatch({ type: WALLET_CONNECT_CLEAR_STATE });
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
      return {
        ...state,
        fetching: false,
        qrcode: '',
      };
    case WALLET_CONNECT_CLEAR_STATE:
      return {
        ...state,
        ...INITIAL_STATE,
      };
    default:
      return state;
  }
};
