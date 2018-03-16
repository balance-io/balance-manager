import { apiGetEthplorerInfo, apiGetPrices, apiGetMetamaskNetwork } from '../helpers/api';
import { parseError, saveLocal, parseAccountBalances } from '../helpers/utilities';
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

const ACCOUNTS_GET_NATIVE_PRICES_REQUEST = 'accounts/ACCOUNTS_GET_NATIVE_PRICES_REQUEST';
const ACCOUNTS_GET_NATIVE_PRICES_SUCCESS = 'accounts/ACCOUNTS_GET_NATIVE_PRICES_SUCCESS';
const ACCOUNTS_GET_NATIVE_PRICES_FAILURE = 'accounts/ACCOUNTS_GET_NATIVE_PRICES_FAILURE';

const ACCOUNTS_CHANGE_NATIVE_CURRENCY = 'accounts/ACCOUNTS_CHANGE_NATIVE_CURRENCY';

// -- Actions --------------------------------------------------------------- //

let accountInterval = null;
let getPricesInterval = null;

export const accountsGetEthplorerInfo = (address, type) => dispatch => {
  dispatch({ type: ACCOUNTS_GET_ETHPLORER_INFO_REQUEST });
  apiGetEthplorerInfo(address, type)
    .then(account => {
      dispatch({ type: ACCOUNTS_GET_ETHPLORER_INFO_SUCCESS, payload: account });
      dispatch(accountsGetNativePrices(account));
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

export const accountsGetNativePrices = account => (dispatch, getState) => {
  let _account = account || getState().accounts.account;
  const cryptoSymbols = _account.crypto.map(crypto => crypto.symbol);
  const getPrices = () => {
    dispatch({
      type: ACCOUNTS_GET_NATIVE_PRICES_REQUEST,
      payload: getState().accounts.nativeCurrency
    });
    apiGetPrices(cryptoSymbols, getState().accounts.nativeCurrency)
      .then(({ data }) => {
        if (getState().accounts.nativeCurrency === getState().accounts.nativePriceRequest) {
          let prices = { native: getState().accounts.nativeCurrency };
          cryptoSymbols.map(
            coin =>
              (prices[coin] = data[coin] ? data[coin][getState().accounts.nativeCurrency] : null)
          );
          prices['WETH'] = prices['ETH'];
          prices['STT'] = 0.21;
          _account = parseAccountBalances(_account, prices);
          saveLocal('NATIVE_PRICES', prices);
          dispatch({
            type: ACCOUNTS_GET_NATIVE_PRICES_SUCCESS,
            payload: { account: _account, prices }
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
  web3Available: false,
  web3Mainnet: false,
  metamaskAccount: '',
  crypto: ['ETH'],
  account: {
    address: '',
    type: 'METAMASK',
    crypto: [
      {
        name: 'Ethereum',
        symbol: 'ETH',
        address: null,
        decimals: 18,
        balance: '0.00000000',
        native: null
      }
    ],
    totalNative: '---'
  },
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
        account: {
          address: '',
          type: 'METAMASK',
          crypto: [
            {
              name: 'Ethereum',
              symbol: 'ETH',
              address: null,
              decimals: 18,
              balance: '0.00000000',
              native: null
            }
          ],
          totalNative: '---'
        }
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
