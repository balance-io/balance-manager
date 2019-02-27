import WalletConnect from '@walletconnect/browser';
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal';
import {
  accountUpdateAccountAddress,
  accountUpdateNetwork,
} from 'balance-common';
import { notificationShow } from './_notification';
import { modalOpen, modalClose } from './_modal';
import chains from '../references/chains.json';

// -- Constants ------------------------------------------------------------- //

const WALLET_CONNECT_INIT_REQUEST = 'walletConnect/WALLET_CONNECT_INIT_REQUEST';
const WALLET_CONNECT_INIT_SUCCESS = 'walletConnect/WALLET_CONNECT_INIT_SUCCESS';
const WALLET_CONNECT_INIT_FAILURE = 'walletConnect/WALLET_CONNECT_INIT_FAILURE';

const WALLET_CONNECT_SESSION_UPDATE =
  'walletConnect/WALLET_CONNECT_SESSION_UPDATE';

const WALLET_CONNECT_CLEAR_STATE = 'walletConnect/WALLET_CONNECT_CLEAR_STATE';

// -- Actions --------------------------------------------------------------- //

export const walletConnectInit = () => async dispatch => {
  const walletConnector = new WalletConnect({
    bridge: 'https://bridge.walletconnect.org',
  });

  dispatch({ type: WALLET_CONNECT_INIT_REQUEST, payload: walletConnector });

  if (!walletConnector.connected) {
    try {
      await walletConnector.createSession();
      WalletConnectQRCodeModal.open(walletConnector.uri, () => {
        dispatch(walletConnectClearState());
      });
    } catch (error) {
      dispatch(walletConnectClearState());
    }
  }

  dispatch(walletConnectRegisterEvents());
};

export const walletConnectHandleSession = ({
  newSession,
  accounts,
  chainId,
}) => dispatch => {
  function getNetworkFromChainId(chainId) {
    let result = 'mainnet';
    const matches = chains.filter(chain => chain.chain_id === chainId);
    if (matches && matches.length) {
      result = matches[0].network;
    }
    return result;
  }

  const type = newSession
    ? WALLET_CONNECT_INIT_SUCCESS
    : WALLET_CONNECT_SESSION_UPDATE;

  const accountAddress = accounts[0];
  const network = getNetworkFromChainId(chainId);
  dispatch({
    type,
    payload: { accountAddress, network },
  });
  dispatch(accountUpdateAccountAddress(accountAddress, 'WALLETCONNECT'));
  dispatch(accountUpdateNetwork(network));
};

export const walletConnectRegisterEvents = () => async (dispatch, getState) => {
  const { walletConnector } = getState().walletconnect;

  walletConnector.on('connect', (error, payload) => {
    if (error) {
      throw error;
    }

    dispatch(modalClose());

    const { accounts, chainId } = payload.params[0];
    dispatch(
      walletConnectHandleSession({ newSession: true, accounts, chainId }),
    );
  });

  walletConnector.on('session_update', (error, payload) => {
    if (error) {
      throw error;
    }

    const { accounts, chainId } = payload.params[0];
    dispatch(
      walletConnectHandleSession({ newSession: false, accounts, chainId }),
    );
  });

  walletConnector.on('disconnect', (error, payload) => {
    if (error) {
      throw error;
    }

    dispatch(walletConnectClearState());
  });
};

export const walletConnectClearState = () => async (dispatch, getState) => {
  const { walletConnector } = getState().walletconnect;

  if (walletConnector && walletConnector.connected) {
    walletConnector.killSession();
    dispatch(notificationShow('WalletConnect Session Disconnected', true));
  } else {
    dispatch(notificationShow('WalletConnect Connection Cancelled', true));
  }

  dispatch({ type: WALLET_CONNECT_CLEAR_STATE });
  window.browserHistory.push('/');
};

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  walletConnector: null,
  accountAddress: '',
  network: 'mainnet',
  fetching: false,
  uri: '',
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case WALLET_CONNECT_INIT_REQUEST:
      return {
        ...state,
        fetching: true,
        walletConnector: action.payload,
      };
    case WALLET_CONNECT_INIT_SUCCESS:
      return {
        ...state,
        fetching: false,
        accountAddress: action.payload.accountAddress,
        network: action.payload.network,
      };
    case WALLET_CONNECT_INIT_FAILURE:
      return {
        ...state,
        fetching: false,
        accountAddress: '',
        network: 'mainnet',
      };
    case WALLET_CONNECT_SESSION_UPDATE:
      return {
        ...state,
        accountAddress: action.payload.accountAddress,
        network: action.payload.network,
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
