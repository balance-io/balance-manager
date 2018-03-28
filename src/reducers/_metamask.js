import { apiGetMetamaskNetwork } from '../helpers/api';
import { modalClose } from './_modal';
import { accountUpdateAccountAddress, accountUpdateWeb3Network } from './_account';

// -- Constants ------------------------------------------------------------- //
const METAMASK_GET_NETWORK_REQUEST = 'metamask/METAMASK_GET_NETWORK_REQUEST';
const METAMASK_GET_NETWORK_SUCCESS = 'metamask/METAMASK_GET_NETWORK_SUCCESS';
const METAMASK_GET_NETWORK_FAILURE = 'metamask/METAMASK_GET_NETWORK_FAILURE';

const METAMASK_NOT_AVAILABLE = 'metamask/METAMASK_NOT_AVAILABLE';

const METAMASK_UPDATE_METAMASK_ACCOUNT = 'metamask/METAMASK_UPDATE_METAMASK_ACCOUNT';

// -- Actions --------------------------------------------------------------- //

let accountInterval = null;

export const metamaskUpdateMetamaskAccount = () => (dispatch, getState) => {
  if (window.web3.eth.defaultAccount !== getState().metamask.accountAddress) {
    const accountAddress = window.web3.eth.defaultAccount;
    dispatch(modalClose());
    dispatch({ type: METAMASK_UPDATE_METAMASK_ACCOUNT, payload: accountAddress });
    if (accountAddress) dispatch(accountUpdateAccountAddress(accountAddress, 'METAMASK'));
  }
};

export const metamaskConnectMetamask = () => (dispatch, getState) => {
  dispatch({ type: METAMASK_GET_NETWORK_REQUEST });
  if (typeof window.web3 !== 'undefined') {
    apiGetMetamaskNetwork()
      .then(network => {
        dispatch({ type: METAMASK_GET_NETWORK_SUCCESS, payload: network });
        dispatch(accountUpdateWeb3Network(network));
        dispatch(metamaskUpdateMetamaskAccount());
        accountInterval = setInterval(() => dispatch(metamaskUpdateMetamaskAccount()), 100);
      })
      .catch(err => dispatch({ type: METAMASK_GET_NETWORK_FAILURE }));
  } else {
    dispatch({ type: METAMASK_NOT_AVAILABLE });
  }
};

export const metamaskClearIntervals = () => dispatch => {
  clearInterval(accountInterval);
};

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  fetching: false,
  accountAddress: '',
  web3Available: false,
  web3Network: 'mainnet'
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case METAMASK_GET_NETWORK_REQUEST:
      return {
        ...state,
        fetching: true,
        web3Available: false
      };
    case METAMASK_GET_NETWORK_SUCCESS:
      return {
        ...state,
        fetching: false,
        web3Available: true,
        web3Network: action.payload
      };
    case METAMASK_GET_NETWORK_FAILURE:
      return {
        ...state,
        fetching: false,
        web3Available: true
      };
    case METAMASK_NOT_AVAILABLE:
      return {
        ...state,
        fetching: false,
        web3Available: false
      };
    case METAMASK_UPDATE_METAMASK_ACCOUNT:
      return {
        ...state,
        accountAddress: action.payload
      };
    default:
      return state;
  }
};
