import { apiGetEthplorerAddressInfo, apiGetPrices, apiGetMetamaskNetwork } from '../helpers/api';
import {
  parseError,
  parseAccountBalances,
  parsePricesObject,
  parseEthplorerAddressInfo
} from '../helpers/utilities';
import { warningOffline, warningOnline } from './_warning';
import { web3SetProvider } from '../helpers/web3';
import { notificationShow } from './_notification';

// -- Constants ------------------------------------------------------------- //

const ACCOUNTS_GET_ETHPLORER_INFO_REQUEST = 'accounts/ACCOUNTS_GET_ETHPLORER_INFO_REQUEST';
const ACCOUNTS_GET_ETHPLORER_INFO_SUCCESS = 'accounts/ACCOUNTS_GET_ETHPLORER_INFO_SUCCESS';
const ACCOUNTS_GET_ETHPLORER_INFO_FAILURE = 'accounts/ACCOUNTS_GET_ETHPLORER_INFO_FAILURE';

const ACCOUNTS_UPDATE_METAMASK_ACCOUNT = 'accounts/ACCOUNTS_UPDATE_METAMASK_ACCOUNT';
const ACCOUNTS_CHECK_NETWORK_IS_CONNECTED = 'accounts/ACCOUNTS_CHECK_NETWORK_IS_CONNECTED';

const ACCOUNTS_METAMASK_GET_NETWORK_REQUEST = 'accounts/ACCOUNTS_METAMASK_GET_NETWORK_REQUEST';
const ACCOUNTS_METAMASK_GET_NETWORK_SUCCESS = 'accounts/ACCOUNTS_METAMASK_GET_NETWORK_SUCCESS';
const ACCOUNTS_METAMASK_GET_NETWORK_FAILURE = 'accounts/ACCOUNTS_METAMASK_GET_NETWORK_FAILURE';
const ACCOUNTS_METAMASK_NOT_AVAILABLE = 'accounts/ACCOUNTS_METAMASK_NOT_AVAILABLE';

const ACCOUNTS_GET_NATIVE_PRICES_REQUEST = 'accounts/ACCOUNTS_GET_NATIVE_PRICES_REQUEST';
const ACCOUNTS_GET_NATIVE_PRICES_SUCCESS = 'accounts/ACCOUNTS_GET_NATIVE_PRICES_SUCCESS';
const ACCOUNTS_GET_NATIVE_PRICES_FAILURE = 'accounts/ACCOUNTS_GET_NATIVE_PRICES_FAILURE';

const ACCOUNTS_CHANGE_NATIVE_CURRENCY = 'accounts/ACCOUNTS_CHANGE_NATIVE_CURRENCY';

// -- Actions --------------------------------------------------------------- //

let accountInterval = null;
let getPricesInterval = null;

export const accountsGetEthplorerInfo = (address, type) => (dispatch, getState) => {
  const { web3Network } = getState().accounts;
  dispatch({ type: ACCOUNTS_GET_ETHPLORER_INFO_REQUEST });
  apiGetEthplorerAddressInfo(address, web3Network)
    .then(account => {
      dispatch({ type: ACCOUNTS_GET_ETHPLORER_INFO_SUCCESS, payload: { type, ...account } });
      dispatch(accountsGetNativePrices());
    })
    .catch(err => {
      console.error(err);
      dispatch({ type: ACCOUNTS_GET_ETHPLORER_INFO_FAILURE });
    });
};

export const accountsUpdateMetamaskAccount = () => (dispatch, getState) => {
  if (window.web3.eth.defaultAccount !== getState().accounts.metamaskAccount) {
    const newAccount = window.web3.eth.defaultAccount;
    dispatch({ type: ACCOUNTS_UPDATE_METAMASK_ACCOUNT, payload: newAccount });
    dispatch(accountsGetEthplorerInfo(newAccount, 'METAMASK'));
  }
};

export const accountsCheckNetworkIsConnected = online => dispatch => {
  if (online) {
    dispatch(warningOnline());
  } else {
    dispatch(warningOffline());
  }
  dispatch({ type: ACCOUNTS_CHECK_NETWORK_IS_CONNECTED, payload: online });
};

export const accountsConnectMetamask = () => (dispatch, getState) => {
  dispatch(accountsGetNativePrices());
  dispatch({ type: ACCOUNTS_METAMASK_GET_NETWORK_REQUEST });
  if (typeof window.web3 !== 'undefined') {
    apiGetMetamaskNetwork()
      .then(network => {
        web3SetProvider(`https://${network}.infura.io/`);
        dispatch({ type: ACCOUNTS_METAMASK_GET_NETWORK_SUCCESS, payload: network });
        dispatch(accountsUpdateMetamaskAccount());
        accountInterval = setInterval(() => dispatch(accountsUpdateMetamaskAccount()), 100);
      })
      .catch(err => dispatch({ type: ACCOUNTS_METAMASK_GET_NETWORK_FAILURE }));
  } else {
    dispatch({ type: ACCOUNTS_METAMASK_NOT_AVAILABLE });
  }
};

export const accountsClearIntervals = () => dispatch => {
  clearInterval(accountInterval);
  clearInterval(getPricesInterval);
};

export const accountsGetNativePrices = () => (dispatch, getState) => {
  let account = getState().accounts.account;
  const cryptoSymbols = account.crypto.map(crypto => crypto.symbol);
  const getPrices = () => {
    dispatch({
      type: ACCOUNTS_GET_NATIVE_PRICES_REQUEST,
      payload: getState().accounts.nativeCurrency
    });
    apiGetPrices(cryptoSymbols, getState().accounts.nativeCurrency)
      .then(({ data }) => {
        if (getState().accounts.nativeCurrency === getState().accounts.nativePriceRequest) {
          const prices = parsePricesObject(data, cryptoSymbols, getState().accounts.nativeCurrency);
          account = parseAccountBalances(account, prices);
          dispatch({
            type: ACCOUNTS_GET_NATIVE_PRICES_SUCCESS,
            payload: { account, prices }
          });
        }
      })
      .catch(error => {
        dispatch({ type: ACCOUNTS_GET_NATIVE_PRICES_FAILURE });
        const message = parseError(error);
        dispatch(notificationShow(message, true));
      });
  };
  getPrices();
  clearInterval(getPricesInterval);
  getPricesInterval = setInterval(getPrices, 300000); // 5mins
};

export const accountsChangeNativeCurrency = nativeCurrency => dispatch => {
  dispatch({
    type: ACCOUNTS_CHANGE_NATIVE_CURRENCY,
    payload: nativeCurrency
  });
  dispatch(accountsGetNativePrices());
};

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  nativePriceRequest: 'USD',
  nativeCurrency: 'USD',
  prices: {},
  web3Connected: true,
  web3Available: false,
  web3Network: 'mainnet',
  metamaskAccount: '',
  crypto: ['ETH'],
  account: parseEthplorerAddressInfo(null),
  fetching: false,
  error: false
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACCOUNTS_UPDATE_METAMASK_ACCOUNT:
      return { ...state, metamaskAccount: action.payload };
    case ACCOUNTS_CHECK_NETWORK_IS_CONNECTED:
      return { ...state, web3Connected: action.payload };
    case ACCOUNTS_GET_ETHPLORER_INFO_REQUEST:
      return { ...state, fetching: true };
    case ACCOUNTS_GET_ETHPLORER_INFO_SUCCESS:
      return { ...state, fetching: false, account: action.payload };
    case ACCOUNTS_GET_ETHPLORER_INFO_FAILURE:
      return {
        ...state,
        fetching: false,
        account: parseEthplorerAddressInfo(null)
      };
    case ACCOUNTS_METAMASK_GET_NETWORK_REQUEST:
      return {
        ...state,
        fetching: true,
        web3Available: false
      };
    case ACCOUNTS_METAMASK_GET_NETWORK_SUCCESS:
      return {
        ...state,
        fetching: false,
        web3Available: true,
        web3Network: action.payload
      };
    case ACCOUNTS_METAMASK_GET_NETWORK_FAILURE:
      return {
        ...state,
        fetching: false,
        web3Available: true
      };
    case ACCOUNTS_METAMASK_NOT_AVAILABLE:
      return {
        ...state,
        fetching: false,
        web3Available: false
      };
    case ACCOUNTS_GET_NATIVE_PRICES_REQUEST:
      return {
        ...state,
        nativePriceRequest: action.payload
      };
    case ACCOUNTS_GET_NATIVE_PRICES_SUCCESS:
      return {
        ...state,
        nativePriceRequest: '',
        prices: action.payload.prices,
        account: action.payload.account
      };
    case ACCOUNTS_GET_NATIVE_PRICES_FAILURE:
      return {
        ...state,
        nativePriceRequest: ''
      };
    case ACCOUNTS_CHANGE_NATIVE_CURRENCY:
      return { ...state, nativeCurrency: action.payload };
    default:
      return state;
  }
};
