import { parseError } from 'balance-common';
import { modalClose } from './_modal';
import {
  accountUpdateAccountAddress,
  accountUpdateNetwork,
} from 'balance-common';
import { notificationShow } from './_notification';
import networkList from '../references/ethereum-networks.json';

// -- Constants ------------------------------------------------------------- //
const METAMASK_CONNECT_REQUEST = 'metamask/METAMASK_CONNECT_REQUEST';
const METAMASK_CONNECT_SUCCESS = 'metamask/METAMASK_CONNECT_SUCCESS';
const METAMASK_CONNECT_FAILURE = 'metamask/METAMASK_CONNECT_FAILURE';

const METAMASK_NOT_AVAILABLE = 'metamask/METAMASK_NOT_AVAILABLE';
const METAMASK_CLEAR_STATE = 'metamask/METAMASK_CLEAR_STATE';

const METAMASK_UPDATE_METAMASK_ACCOUNT =
  'metamask/METAMASK_UPDATE_METAMASK_ACCOUNT';

// -- Actions --------------------------------------------------------------- //

let accountInterval = null;

/**
 * @desc get metmask selected network
 * @return {Promise}
 */
const getMetamaskNetwork = () =>
  new Promise((resolve, reject) => {
    if (typeof window.web3 !== 'undefined') {
      window.web3.version.getNetwork((err, networkID) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        let networkIDList = {};
        Object.keys(networkList).forEach(network => {
          networkIDList[networkList[network].id] = network;
        });
        resolve(networkIDList[Number(networkID)] || null);
      });
    }
  });

export const metamaskUpdateMetamaskAccount = () => (dispatch, getState) => {
  if (window.web3.eth.defaultAccount !== getState().metamask.accountAddress) {
    const accountAddress = window.web3.eth.defaultAccount;
    dispatch(modalClose());
    dispatch({
      type: METAMASK_UPDATE_METAMASK_ACCOUNT,
      payload: accountAddress,
    });
    if (accountAddress)
      dispatch(accountUpdateAccountAddress(accountAddress, 'METAMASK'));
  }
};

export const metamaskConnectInit = () => (dispatch, getState) => {
  const accountAddress = getState().metamask.accountAddress;
  if (accountAddress)
    dispatch(accountUpdateAccountAddress(accountAddress, 'METAMASK'));
  dispatch({ type: METAMASK_CONNECT_REQUEST });
  if (typeof window.web3 !== 'undefined') {
    getMetamaskNetwork()
      .then(network => {
        dispatch({ type: METAMASK_CONNECT_SUCCESS, payload: network });
        dispatch(accountUpdateNetwork(network));
        dispatch(metamaskUpdateMetamaskAccount());
        accountInterval = setInterval(
          () => dispatch(metamaskUpdateMetamaskAccount()),
          100,
        );
      })
      .catch(error => {
        const message = parseError(error);
        dispatch(notificationShow(message, true));
        dispatch({ type: METAMASK_CONNECT_FAILURE });
      });
  } else {
    dispatch({ type: METAMASK_NOT_AVAILABLE });
  }
};

export const metamaskClearState = () => dispatch => {
  clearInterval(accountInterval);
  dispatch({ type: METAMASK_CLEAR_STATE });
};

export const metamaskClearIntervals = () => dispatch => {
  clearInterval(accountInterval);
};

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  fetching: false,
  accountAddress: '',
  web3Available: false,
  network: 'mainnet',
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case METAMASK_CONNECT_REQUEST:
      return {
        ...state,
        fetching: true,
        web3Available: false,
      };
    case METAMASK_CONNECT_SUCCESS:
      return {
        ...state,
        fetching: false,
        web3Available: true,
        network: action.payload,
      };
    case METAMASK_CONNECT_FAILURE:
      return {
        ...state,
        fetching: false,
        web3Available: true,
      };
    case METAMASK_NOT_AVAILABLE:
      return {
        ...state,
        fetching: false,
        web3Available: false,
      };
    case METAMASK_UPDATE_METAMASK_ACCOUNT:
      return {
        ...state,
        accountAddress: action.payload,
      };
    case METAMASK_CLEAR_STATE:
      return {
        ...state,
        ...INITIAL_STATE,
      };
    default:
      return state;
  }
};
