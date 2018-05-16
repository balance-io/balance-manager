import lang from '../languages';
import { accountUpdateAccountAddress, accountUpdateNetwork } from './_account';
import { ledgerEthInit, ledgerEthAccounts } from '../handlers/ledger-eth';
import { notificationShow } from './_notification';

// -- Constants ------------------------------------------------------------- //
const LEDGER_CONNECT_REQUEST = 'ledger/LEDGER_CONNECT_REQUEST';
const LEDGER_CONNECT_SUCCESS = 'ledger/LEDGER_CONNECT_SUCCESS';
const LEDGER_CONNECT_FAILURE = 'ledger/LEDGER_CONNECT_FAILURE';

const LEDGER_UPDATE_NETWORK = 'ledger/LEDGER_UPDATE_NETWORK';

// -- Actions --------------------------------------------------------------- //

export const ledgerConnectInit = () => (dispatch, getState) => {
  const network = getState().ledger.network;
  dispatch({ type: LEDGER_CONNECT_REQUEST });
  ledgerEthInit(network)
    .then(() => {
      ledgerEthAccounts()
        .then(accounts => {
          if (accounts.length) {
            dispatch({ type: LEDGER_CONNECT_SUCCESS, payload: accounts });
            dispatch(
              accountUpdateAccountAddress(accounts[0].address, 'LEDGER'),
            );
          } else {
            dispatch(
              notificationShow(
                lang.t('notification.error.no_accounts_found'),
                true,
              ),
            );
            dispatch({ type: LEDGER_CONNECT_FAILURE });
          }
        })
        .catch(error => {
          dispatch({ type: LEDGER_CONNECT_FAILURE });
        });
    })
    .catch(error => {
      dispatch({ type: LEDGER_CONNECT_FAILURE });
    });
};

export const ledgerUpdateNetwork = network => (dispatch, getState) => {
  const accountAddress = getState().account.accountAddress;
  dispatch({ type: LEDGER_UPDATE_NETWORK, payload: network });
  dispatch(accountUpdateNetwork(network));
  dispatch(accountUpdateAccountAddress(accountAddress, 'LEDGER'));
};

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  network: 'mainnet',
  fetching: false,
  accounts: [],
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case LEDGER_CONNECT_REQUEST:
      return {
        ...state,
        fetching: true,
      };
    case LEDGER_CONNECT_SUCCESS:
      return {
        ...state,
        fetching: false,
        accounts: action.payload,
      };
    case LEDGER_CONNECT_FAILURE:
      return {
        ...state,
        fetching: false,
      };
    default:
      return state;
  }
};
