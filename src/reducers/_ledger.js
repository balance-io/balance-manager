import lang from '../languages';
import { accountUpdateAccountAddress } from './_account';
import { ledgerEthInit, ledgerEthAccounts } from '../helpers/ledger-eth';
import { notificationShow } from './_notification';

// -- Constants ------------------------------------------------------------- //
const LEDGER_CONNECT_REQUEST = 'ledger/LEDGER_CONNECT_REQUEST';
const LEDGER_CONNECT_SUCCESS = 'ledger/LEDGER_CONNECT_SUCCESS';
const LEDGER_CONNECT_FAILURE = 'ledger/LEDGER_CONNECT_FAILURE';

// -- Actions --------------------------------------------------------------- //

export const ledgerConnectInit = () => async (dispatch, getState) => {
  const network = getState().ledger.network;
  dispatch({ type: LEDGER_CONNECT_REQUEST });
  ledgerEthInit(network)
    .then(() => {
      ledgerEthAccounts()
        .then(accounts => {
          if (accounts.length) {
            dispatch({ type: LEDGER_CONNECT_SUCCESS, payload: accounts });
            dispatch(accountUpdateAccountAddress(accounts[0].address, 'LEDGER'));
          } else {
            dispatch(notificationShow(lang.t('notification.error.no_accounts_found'), true));
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

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  network: 'mainnet',
  fetching: false,
  accounts: []
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case LEDGER_CONNECT_REQUEST:
      return {
        ...state,
        fetching: true
      };
    case LEDGER_CONNECT_SUCCESS:
      return {
        ...state,
        fetching: false,
        accounts: action.payload
      };
    case LEDGER_CONNECT_FAILURE:
      return {
        ...state,
        fetching: false
      };
    default:
      return state;
  }
};
