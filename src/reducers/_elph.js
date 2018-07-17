import { apiGetElphNetwork } from '../handlers/api';
import { accountUpdateAccountAddress, accountUpdateNetwork } from './_account';
import { ElphProvider } from 'elph';
import Web3 from 'web3';

// -- Constants ------------------------------------------------------------- //
const ELPH_CONNECT_REQUEST = 'elph/ELPH_CONNECT_REQUEST';
const ELPH_CONNECT_SUCCESS = 'elph/ELPH_CONNECT_SUCCESS';

const ELPH_NOT_AVAILABLE = 'elph/ELPH_NOT_AVAILABLE';

const ELPH_UPDATE_ELPH_ACCOUNT = 'elph/ELPH_UPDATE_ELPH_ACCOUNT';

// -- Actions --------------------------------------------------------------- //

export const elphConnectHelper = () => (dispatch, getState) => {
  apiGetElphNetwork()
    .then(network => {
      window.web3.eth.getAccounts(function(err, accounts) {
        if (err) {
          dispatch({ type: ELPH_NOT_AVAILABLE });
          return;
        }

        // Elph Provider returns a capitals-based checksum address by default.
        let accountAddress = accounts[0].toLowerCase();
        window.web3.eth.defaultAccount = accountAddress;
        if (accountAddress) {
          // Send dispatches for network
          dispatch({ type: ELPH_CONNECT_SUCCESS, payload: network });
          dispatch(accountUpdateNetwork(network));

          // Send dispatches for account
          dispatch({ type: ELPH_UPDATE_ELPH_ACCOUNT, payload: accountAddress });
          dispatch(accountUpdateAccountAddress(accountAddress, 'ELPH'));
        }
      });
    })
    .catch(err => {
      dispatch({ type: ELPH_NOT_AVAILABLE });
    });
};

export const elphConnectInit = () => (dispatch, getState) => {
  const accountAddress = getState().elph.accountAddress;
  if (accountAddress)
    dispatch(accountUpdateAccountAddress(accountAddress, 'ELPH'));

  dispatch({ type: ELPH_CONNECT_REQUEST });

  if (
    typeof window.web3 === 'undefined' ||
    !window.web3.currentProvider.isElph
  ) {
    let requestedNetwork =
      process.env.NODE_ENV === 'production' ? 'mainnet' : 'ropsten';
    window.web3 = new Web3(new ElphProvider({ network: requestedNetwork }));
  }

  dispatch(elphConnectHelper());
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
    case ELPH_CONNECT_REQUEST:
      return {
        ...state,
        fetching: true,
        web3Available: false,
      };
    case ELPH_CONNECT_SUCCESS:
      return {
        ...state,
        fetching: false,
        web3Available: true,
        network: action.payload,
      };
    case ELPH_NOT_AVAILABLE:
      return {
        ...state,
        fetching: false,
        web3Available: false,
      };
    case ELPH_UPDATE_ELPH_ACCOUNT:
      return {
        ...state,
        accountAddress: action.payload,
      };
    default:
      return state;
  }
};
