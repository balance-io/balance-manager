import { apiWalletConnectInit, apiWalletConnectGetAddress } from '../helpers/api';
import { generateUUID } from '../helpers/utilities';
import { parseError } from '../helpers/parsers';
import { notificationShow } from './_notification';
import { modalClose } from './_modal';
import { accountUpdateWalletConnect } from './_account';

// -- Constants ------------------------------------------------------------- //

const WALLET_CONNECT_SEND_TOKEN_REQUEST = 'wallletConnect/WALLET_CONNECT_SEND_TOKEN_REQUEST';
const WALLET_CONNECT_SEND_TOKEN_SUCCESS = 'wallletConnect/WALLET_CONNECT_SEND_TOKEN_SUCCESS';
const WALLET_CONNECT_SEND_TOKEN_FAILURE = 'wallletConnect/WALLET_CONNECT_SEND_TOKEN_FAILURE';

const WALLET_CONNECT_GET_ADDRESS_REQUEST = 'wallletConnect/WALLET_CONNECT_GET_ADDRESS_REQUEST';
const WALLET_CONNECT_GET_ADDRESS_SUCCESS = 'wallletConnect/WALLET_CONNECT_GET_ADDRESS_SUCCESS';
const WALLET_CONNECT_GET_ADDRESS_FAILURE = 'wallletConnect/WALLET_CONNECT_GET_ADDRESS_FAILURE';

const WALLET_CONNECT_CLEAR_FIELDS = 'wallletConnect/WALLET_CONNECT_CLEAR_FIELDS';

// -- Actions --------------------------------------------------------------- //

export const walletConnectGetAddress = newGasPriceOption => (dispatch, getState) => {
  const uuid = getState().walletconnect.uuid;
  dispatch({ type: WALLET_CONNECT_GET_ADDRESS_REQUEST, payload: uuid });
  apiWalletConnectGetAddress(uuid)
    .then(({ data }) => {
      const address = data ? JSON.parse(data.encryptedPayload).addresses[0] : '';
      if (address) {
        dispatch({
          type: WALLET_CONNECT_GET_ADDRESS_SUCCESS,
          payload: address
        });
        dispatch(modalClose());
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

export const wallletConnectModalInit = (address, selected) => (dispatch, getState) => {
  const uuid = generateUUID();
  dispatch({ type: WALLET_CONNECT_SEND_TOKEN_REQUEST, payload: uuid });
  apiWalletConnectInit(uuid)
    .then(({ data }) => {
      dispatch({
        type: WALLET_CONNECT_SEND_TOKEN_SUCCESS
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
  uuid: '',
  address: ''
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case WALLET_CONNECT_SEND_TOKEN_REQUEST:
      return {
        ...state,
        fetching: true,
        uuid: action.payload
      };
    case WALLET_CONNECT_SEND_TOKEN_SUCCESS:
    case WALLET_CONNECT_SEND_TOKEN_FAILURE:
      return {
        ...state,
        fetching: false
      };
    case WALLET_CONNECT_GET_ADDRESS_REQUEST:
      return { ...state, fetching: true };
    case WALLET_CONNECT_GET_ADDRESS_SUCCESS:
      return {
        ...state,
        address: action.payload,
        fetching: false
      };
    case WALLET_CONNECT_GET_ADDRESS_FAILURE:
      return {
        ...state,
        fetching: false
      };
    case WALLET_CONNECT_CLEAR_FIELDS:
      return { ...state, ...INITIAL_STATE };
    default:
      return state;
  }
};
