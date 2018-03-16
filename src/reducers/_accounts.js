import { apiGetEthplorerInfo, apiGetPrices, apiGetMetamaskNetwork } from '../helpers/api';
import { parseError, saveLocal } from '../helpers/utilities';
import { notificationShow } from './_notification';

// -- Constants ------------------------------------------------------------- //

const ACCOUNTS_GET_ETHPLORER_INFO_REQUEST = 'accounts/ACCOUNTS_GET_ETHPLORER_INFO_REQUEST';
const ACCOUNTS_GET_ETHPLORER_INFO_SUCCESS = 'accounts/ACCOUNTS_GET_ETHPLORER_INFO_SUCCESS';
const ACCOUNTS_GET_ETHPLORER_INFO_FAILURE = 'accounts/ACCOUNTS_GET_ETHPLORER_INFO_FAILURE';

const ACCOUNTS_UPDATE_METAMASK_ACCOUNT = 'accounts/ACCOUNTS_UPDATE_METAMASK_ACCOUNT';

const ACCOUNTS_METAMASK_GET_NETWORK_REQUEST = 'accounts/ACCOUNTS_METAMASK_GET_NETWORK_REQUEST';
const ACCOUNTS_METAMASK_GET_NETWORK_SUCCESS = 'accounts/ACCOUNTS_METAMASK_GET_NETWORK_SUCCESS';
const ACCOUNTS_METAMASK_GET_NETWORK_FAILURE = 'accounts/ACCOUNTS_METAMASK_GET_NETWORK_FAILURE';
const ACCOUNTS_METAMASK_NOT_AVAILABLE = 'accounts/ACCOUNTS_METAMASK_NOT_AVAILABLE';

const ACCOUNTS_GET_PRICES_REQUEST = 'accounts/ACCOUNTS_GET_PRICES_REQUEST';
const ACCOUNTS_GET_PRICES_SUCCESS = 'accounts/ACCOUNTS_GET_PRICES_SUCCESS';
const ACCOUNTS_GET_PRICES_FAILURE = 'accounts/ACCOUNTS_GET_PRICES_FAILURE';

const ACCOUNTS_CHANGE_NATIVE_CURRENCY = 'accounts/ACCOUNTS_CHANGE_NATIVE_CURRENCY';

// -- Actions --------------------------------------------------------------- //

let accountInterval = null;
let getPricesInterval = null;

export const accountsGetEthplorerInfo = (address, type) => dispatch => {
  dispatch({ type: ACCOUNTS_GET_ETHPLORER_INFO_REQUEST });
  apiGetEthplorerInfo(address, type)
    .then(account => {
      dispatch({ type: ACCOUNTS_GET_ETHPLORER_INFO_SUCCESS, payload: account });
      dispatch(accountsGetPrices());
    })
    .catch(err => {
      console.error(err);
      dispatch({ type: ACCOUNTS_GET_ETHPLORER_INFO_FAILURE });
    });
};

export const accountsUpdateMetamaskAccount = () => (dispatch, getState) => {
  const { metamaskAccount } = getState().accounts;
  const defaultAccount = window.web3.eth.defaultAccount;
  if (defaultAccount !== metamaskAccount) {
    const newAccount = window.web3.eth.defaultAccount;
    dispatch({ type: ACCOUNTS_UPDATE_METAMASK_ACCOUNT, payload: newAccount });
    dispatch(accountsGetEthplorerInfo(newAccount, 'METAMASK'));
  }
};

export const accountsConnectMetamask = () => (dispatch, getState) => {
  dispatch({ type: ACCOUNTS_METAMASK_GET_NETWORK_REQUEST });
  if (typeof window.web3 !== 'undefined') {
    accountInterval = setInterval(() => dispatch(accountsUpdateMetamaskAccount()), 100);
    apiGetMetamaskNetwork()
      .then(network => {
        if (network === 'mainnet') {
          dispatch({ type: ACCOUNTS_METAMASK_GET_NETWORK_SUCCESS, payload: true });
          dispatch(accountsGetEthplorerInfo(getState().accounts.metamaskAccount, 'METAMASK'));
        } else {
          dispatch({ type: ACCOUNTS_METAMASK_GET_NETWORK_SUCCESS, payload: false });
        }
      })
      .catch(err => dispatch({ type: ACCOUNTS_METAMASK_GET_NETWORK_FAILURE }));
  } else {
    dispatch({ type: ACCOUNTS_METAMASK_NOT_AVAILABLE });
  }
};

export const accountsClearUpdateAccountInterval = () => dispatch => clearInterval(accountInterval);

export const accountsGetPrices = () => (dispatch, getState) => {
  let { nativeCurrency, crypto, account } = getState().accounts;
  if (account.tokens) {
    for (let j = 0; j < account.tokens.length; j++) {
      if (!crypto.includes(account.tokens[j].symbol)) {
        crypto.push(account.tokens[j].symbol);
      }
    }
  }
  const getPrices = () => {
    dispatch({ type: ACCOUNTS_GET_PRICES_REQUEST, payload: nativeCurrency });
    apiGetPrices(crypto, nativeCurrency)
      .then(({ data }) => {
        if (getState().nativeCurrency === getState().nativePriceRequest) {
          let prices = { native: nativeCurrency };
          crypto.map(coin => (prices[coin] = data[coin] ? data[coin][nativeCurrency] : null));
          prices['WETH'] = prices['ETH'];
          if (process.env.NODE_ENV === 'development') {
            prices['STT'] = 0.21;
          }
          saveLocal('NATIVE_PRICES', prices);
          dispatch({
            type: ACCOUNTS_GET_PRICES_SUCCESS,
            payload: prices
          });
        }
      })
      .catch(error => {
        dispatch({ type: ACCOUNTS_GET_PRICES_FAILURE });
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
  dispatch(accountsGetPrices());
};

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  nativePriceRequest: 'USD',
  nativeCurrency: 'USD',
  prices: {},
  web3Available: false,
  web3Mainnet: false,
  metamaskAccount: '',
  crypto: ['ETH'],
  account: { address: '', type: 'METAMASK', balance: '0.00000000', tokens: null },
  fetching: false,
  error: false
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACCOUNTS_UPDATE_METAMASK_ACCOUNT:
      return { ...state, metamaskAccount: action.payload };
    case ACCOUNTS_GET_ETHPLORER_INFO_REQUEST:
      return { ...state, fetching: true };
    case ACCOUNTS_GET_ETHPLORER_INFO_SUCCESS:
      return { ...state, fetching: false, account: action.payload };
    case ACCOUNTS_GET_ETHPLORER_INFO_FAILURE:
      return {
        ...state,
        fetching: false,
        account: { address: '', type: 'METAMASK', balance: '0.00000000', tokens: null }
      };
    case ACCOUNTS_METAMASK_GET_NETWORK_REQUEST:
      return {
        ...state,
        fetching: true,
        web3Available: false,
        web3Mainnet: false
      };
    case ACCOUNTS_METAMASK_GET_NETWORK_SUCCESS:
      return {
        ...state,
        fetching: false,
        web3Available: true,
        web3Mainnet: action.payload
      };
    case ACCOUNTS_METAMASK_GET_NETWORK_FAILURE:
      return {
        ...state,
        fetching: false,
        web3Available: true,
        web3Mainnet: false
      };
    case ACCOUNTS_METAMASK_NOT_AVAILABLE:
      return {
        ...state,
        fetching: false,
        web3Available: false,
        web3Mainnet: false
      };
    case ACCOUNTS_GET_PRICES_REQUEST:
      return {
        ...state,
        nativePriceRequest: action.payload
      };
    case ACCOUNTS_GET_PRICES_SUCCESS:
      return {
        ...state,
        nativePriceRequest: '',
        prices: action.payload
      };
    case ACCOUNTS_GET_PRICES_FAILURE:
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
