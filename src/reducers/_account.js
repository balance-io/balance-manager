import {
  apiGetEthplorerAddressInfo,
  apiGetEtherscanAccountTransactions,
  apiGetPrices,
  apiGetMetamaskNetwork
} from '../helpers/api';
import {
  parseError,
  parseTransactionsPrices,
  parseAccountBalances,
  parsePricesObject,
  parseEthplorerAddressInfo
} from '../helpers/parsers';
import { saveLocal, getLocal } from '../helpers/utilities';
import { web3SetProvider } from '../helpers/web3';
import { warningOffline, warningOnline } from './_warning';
import { notificationShow } from './_notification';
import { modalClose } from './_modal';

// -- Constants ------------------------------------------------------------- //

const ACCOUNT_GET_ACCOUNT_TRANSACTIONS_REQUEST = 'account/ACCOUNT_GET_ACCOUNT_TRANSACTIONS_REQUEST';
const ACCOUNT_GET_ACCOUNT_TRANSACTIONS_SUCCESS = 'account/ACCOUNT_GET_ACCOUNT_TRANSACTIONS_SUCCESS';
const ACCOUNT_GET_ACCOUNT_TRANSACTIONS_FAILURE = 'account/ACCOUNT_GET_ACCOUNT_TRANSACTIONS_FAILURE';

const ACCOUNT_GET_ACCOUNT_BALANCES_REQUEST = 'account/ACCOUNT_GET_ACCOUNT_BALANCES_REQUEST';
const ACCOUNT_GET_ACCOUNT_BALANCES_SUCCESS = 'account/ACCOUNT_GET_ACCOUNT_BALANCES_SUCCESS';
const ACCOUNT_GET_ACCOUNT_BALANCES_FAILURE = 'account/ACCOUNT_GET_ACCOUNT_BALANCES_FAILURE';

const ACCOUNT_UPDATE_METAMASK_ACCOUNT = 'account/ACCOUNT_UPDATE_METAMASK_ACCOUNT';
const ACCOUNT_CHECK_NETWORK_IS_CONNECTED = 'account/ACCOUNT_CHECK_NETWORK_IS_CONNECTED';

const ACCOUNT_METAMASK_GET_NETWORK_REQUEST = 'account/ACCOUNT_METAMASK_GET_NETWORK_REQUEST';
const ACCOUNT_METAMASK_GET_NETWORK_SUCCESS = 'account/ACCOUNT_METAMASK_GET_NETWORK_SUCCESS';
const ACCOUNT_METAMASK_GET_NETWORK_FAILURE = 'account/ACCOUNT_METAMASK_GET_NETWORK_FAILURE';
const ACCOUNT_METAMASK_NOT_AVAILABLE = 'account/ACCOUNT_METAMASK_NOT_AVAILABLE';

const ACCOUNT_GET_NATIVE_PRICES_REQUEST = 'account/ACCOUNT_GET_NATIVE_PRICES_REQUEST';
const ACCOUNT_GET_NATIVE_PRICES_SUCCESS = 'account/ACCOUNT_GET_NATIVE_PRICES_SUCCESS';
const ACCOUNT_GET_NATIVE_PRICES_FAILURE = 'account/ACCOUNT_GET_NATIVE_PRICES_FAILURE';

const ACCOUNT_CHANGE_NATIVE_CURRENCY = 'account/ACCOUNT_CHANGE_NATIVE_CURRENCY';

// -- Actions --------------------------------------------------------------- //

let accountInterval = null;
let getPricesInterval = null;

export const accountGetAccountTransactions = () => (dispatch, getState) => {
  const { account, web3Network } = getState().account;
  dispatch({ type: ACCOUNT_GET_ACCOUNT_TRANSACTIONS_REQUEST });
  apiGetEtherscanAccountTransactions(account.address, web3Network)
    .then(transactions => {
      dispatch({ type: ACCOUNT_GET_ACCOUNT_TRANSACTIONS_SUCCESS, payload: transactions });
      dispatch(accountGetNativePrices());
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: ACCOUNT_GET_ACCOUNT_TRANSACTIONS_FAILURE });
    });
};

export const accountGetAccountBalances = (address, type) => (dispatch, getState) => {
  const { web3Network } = getState().account;
  dispatch({ type: ACCOUNT_GET_ACCOUNT_BALANCES_REQUEST });
  apiGetEthplorerAddressInfo(address, web3Network)
    .then(account => {
      account = { ...account, type };
      dispatch({ type: ACCOUNT_GET_ACCOUNT_BALANCES_SUCCESS, payload: account });
      dispatch(accountGetNativePrices());
      if (account.txCount) dispatch(accountGetAccountTransactions());
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: ACCOUNT_GET_ACCOUNT_BALANCES_FAILURE });
    });
};

export const accountUpdateMetamaskAccount = () => (dispatch, getState) => {
  if (window.web3.eth.defaultAccount !== getState().account.metamaskAccount) {
    const newAccount = window.web3.eth.defaultAccount;
    dispatch(modalClose());
    dispatch({ type: ACCOUNT_UPDATE_METAMASK_ACCOUNT, payload: newAccount });
    if (newAccount) dispatch(accountGetAccountBalances(newAccount, 'METAMASK'));
  }
};

export const accountCheckNetworkIsConnected = online => dispatch => {
  if (online) {
    dispatch(warningOnline());
  } else {
    dispatch(warningOffline());
  }
  dispatch({ type: ACCOUNT_CHECK_NETWORK_IS_CONNECTED, payload: online });
};

export const accountConnectMetamask = () => (dispatch, getState) => {
  dispatch({ type: ACCOUNT_METAMASK_GET_NETWORK_REQUEST });
  if (typeof window.web3 !== 'undefined') {
    apiGetMetamaskNetwork()
      .then(network => {
        web3SetProvider(`https://${network}.infura.io/`);
        dispatch({ type: ACCOUNT_METAMASK_GET_NETWORK_SUCCESS, payload: network });
        dispatch(accountUpdateMetamaskAccount());
        accountInterval = setInterval(() => dispatch(accountUpdateMetamaskAccount()), 100);
      })
      .catch(err => dispatch({ type: ACCOUNT_METAMASK_GET_NETWORK_FAILURE }));
  } else {
    dispatch({ type: ACCOUNT_METAMASK_NOT_AVAILABLE });
  }
};

export const accountClearIntervals = () => dispatch => {
  clearInterval(accountInterval);
  clearInterval(getPricesInterval);
};

export const accountGetNativePrices = account => (dispatch, getState) => {
  const assetSymbols = getState().account.account.assets.map(asset => asset.symbol);
  const getPrices = () => {
    dispatch({
      type: ACCOUNT_GET_NATIVE_PRICES_REQUEST,
      payload: getState().account.nativeCurrency
    });
    apiGetPrices(assetSymbols, getState().account.nativeCurrency)
      .then(({ data }) => {
        if (getState().account.nativeCurrency === getState().account.nativePriceRequest) {
          const prices = parsePricesObject(data, assetSymbols, getState().account.nativeCurrency);
          const account = parseAccountBalances(getState().account.account, prices);
          parseTransactionsPrices(
            getState().account.transactions,
            getState().account.nativeCurrency
          )
            .then(transactions => {
              transactions =
                transactions && transactions.length
                  ? transactions
                  : getState().account.transactions;
              dispatch({
                type: ACCOUNT_GET_NATIVE_PRICES_SUCCESS,
                payload: { account, transactions, prices }
              });
            })
            .catch(error => {
              dispatch({ type: ACCOUNT_GET_NATIVE_PRICES_FAILURE });
              const message = parseError(error);
              dispatch(notificationShow(message, true));
            });
        }
      })
      .catch(error => {
        dispatch({ type: ACCOUNT_GET_NATIVE_PRICES_FAILURE });
        const message = parseError(error);
        dispatch(notificationShow(message, true));
      });
  };
  getPrices();
  clearInterval(getPricesInterval);
  getPricesInterval = setInterval(getPrices, 60000); // 1min
};

export const accountChangeNativeCurrency = nativeCurrency => dispatch => {
  saveLocal('native_currency', nativeCurrency);
  dispatch({
    type: ACCOUNT_CHANGE_NATIVE_CURRENCY,
    payload: nativeCurrency
  });
  dispatch(accountGetNativePrices());
};

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  nativePriceRequest: getLocal('native_currency') || 'USD',
  nativeCurrency: getLocal('native_currency') || 'USD',
  prices: {},
  web3Connected: true,
  web3Available: false,
  web3Network: 'mainnet',
  metamaskAccount: '',
  asset: ['ETH'],
  account: parseEthplorerAddressInfo(null),
  transactions: [],
  fetchingTransactions: false,
  fetching: false,
  error: false
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACCOUNT_UPDATE_METAMASK_ACCOUNT:
      return { ...state, metamaskAccount: action.payload, transactions: [] };
    case ACCOUNT_CHECK_NETWORK_IS_CONNECTED:
      return { ...state, web3Connected: action.payload };
    case ACCOUNT_GET_ACCOUNT_TRANSACTIONS_REQUEST:
      return { ...state, fetchingTransactions: true };
    case ACCOUNT_GET_ACCOUNT_TRANSACTIONS_SUCCESS:
      return { ...state, fetchingTransactions: false, transactions: action.payload };
    case ACCOUNT_GET_ACCOUNT_TRANSACTIONS_FAILURE:
      return { ...state, fetchingTransactions: false, transactions: [] };
    case ACCOUNT_GET_ACCOUNT_BALANCES_REQUEST:
      return { ...state, fetching: true };
    case ACCOUNT_GET_ACCOUNT_BALANCES_SUCCESS:
      return { ...state, fetching: false, account: action.payload };
    case ACCOUNT_GET_ACCOUNT_BALANCES_FAILURE:
      return {
        ...state,
        fetching: false,
        account: parseEthplorerAddressInfo(null)
      };
    case ACCOUNT_METAMASK_GET_NETWORK_REQUEST:
      return {
        ...state,
        fetching: true,
        web3Available: false
      };
    case ACCOUNT_METAMASK_GET_NETWORK_SUCCESS:
      return {
        ...state,
        fetching: false,
        web3Available: true,
        web3Network: action.payload
      };
    case ACCOUNT_METAMASK_GET_NETWORK_FAILURE:
      return {
        ...state,
        fetching: false,
        web3Available: true
      };
    case ACCOUNT_METAMASK_NOT_AVAILABLE:
      return {
        ...state,
        fetching: false,
        web3Available: false
      };
    case ACCOUNT_GET_NATIVE_PRICES_REQUEST:
      return {
        ...state,
        nativePriceRequest: action.payload
      };
    case ACCOUNT_GET_NATIVE_PRICES_SUCCESS:
      return {
        ...state,
        nativePriceRequest: '',
        prices: action.payload.prices,
        account: action.payload.account,
        transactions: action.payload.transactions
      };
    case ACCOUNT_GET_NATIVE_PRICES_FAILURE:
      return {
        ...state,
        nativePriceRequest: ''
      };
    case ACCOUNT_CHANGE_NATIVE_CURRENCY:
      return { ...state, nativeCurrency: action.payload };
    default:
      return state;
  }
};
