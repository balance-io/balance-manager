import { lang } from 'balance-common';
import {
  accountUpdateAccountAddress,
  accountUpdateNetwork,
} from 'balance-common';
import { trezorEthInit, trezorEthAccounts } from '../handlers/trezor-eth';
import { notificationShow } from './_notification';

// -- Constants ------------------------------------------------------------- //
const TREZOR_CONNECT_REQUEST = 'trezor/TREZOR_CONNECT_REQUEST';
const TREZOR_CONNECT_SUCCESS = 'trezor/TREZOR_CONNECT_SUCCESS';
const TREZOR_CONNECT_FAILURE = 'trezor/TREZOR_CONNECT_FAILURE';

const TREZOR_UPDATE_NETWORK = 'trezor/TREZOR_UPDATE_NETWORK';
const TREZOR_CLEAR_STATE = 'trezor/TREZOR_CLEAR_STATE';

// -- Actions --------------------------------------------------------------- //

export const trezorConnectInit = () => (dispatch, getState) => {
  const network = getState().account.network;
  dispatch({ type: TREZOR_CONNECT_REQUEST });
  trezorEthInit(network)
    .then(() => {
      trezorEthAccounts()
        .then(accounts => {
          if (accounts.length) {
            dispatch({ type: TREZOR_CONNECT_SUCCESS, payload: accounts });
            dispatch(
              accountUpdateAccountAddress(accounts[0].address, 'TREZOR'),
            );
          } else {
            dispatch(
              notificationShow(
                lang.t('notification.error.no_accounts_found'),
                true,
              ),
            );
            dispatch({ type: TREZOR_CONNECT_FAILURE });
          }
        })
        .catch(error => {
          console.log(error);
          dispatch({ type: TREZOR_CONNECT_FAILURE });
        });
    })
    .catch(error => {
      console.log(error);
      dispatch({ type: TREZOR_CONNECT_FAILURE });
    });
};

export const trezorUpdateNetwork = network => (dispatch, getState) => {
  const accountAddress = getState().account.accountAddress;
  dispatch({ type: TREZOR_UPDATE_NETWORK, payload: network });
  dispatch(accountUpdateNetwork(network));
  dispatch(accountUpdateAccountAddress(accountAddress, 'TREZOR'));
  dispatch(trezorConnectInit());
};

export const trezorClearState = () => dispatch => {
  dispatch({ type: TREZOR_CLEAR_STATE });
};

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  network: 'mainnet',
  fetching: false,
  accounts: [],
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case TREZOR_CONNECT_REQUEST:
      return {
        ...state,
        fetching: true,
      };
    case TREZOR_CONNECT_SUCCESS:
      return {
        ...state,
        fetching: false,
        accounts: action.payload,
      };
    case TREZOR_CONNECT_FAILURE:
      return {
        ...state,
        fetching: false,
      };
    case TREZOR_UPDATE_NETWORK:
      return {
        ...state,
        fetching: false,
      };
    case TREZOR_CLEAR_STATE:
      return {
        ...state,
        ...INITIAL_STATE,
      };
    default:
      return state;
  }
};
