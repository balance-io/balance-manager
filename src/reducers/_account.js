import _ from 'lodash';
import lang from '../languages';
import {
  apiGetAccountBalances,
  apiGetAccountTransactions,
  apiGetPrices,
  apiGetTransactionStatus
} from '../helpers/api';
import {
  parseError,
  parseNewTransaction,
  parseAccountBalancesPrices,
  parsePricesObject,
  parseConfirmedTransaction
} from '../helpers/parsers';
import {
  saveLocal,
  getLocal,
  updateLocalTransactions,
  updateLocalBalances
} from '../helpers/utilities';
import { web3SetHttpProvider, web3SetWebSocketProvider } from '../helpers/web3';
import { notificationShow } from './_notification';
import nativeCurrencies from '../libraries/native-currencies.json';

// -- Constants ------------------------------------------------------------- //

const ACCOUNT_GET_ACCOUNT_TRANSACTIONS_REQUEST = 'account/ACCOUNT_GET_ACCOUNT_TRANSACTIONS_REQUEST';
const ACCOUNT_GET_ACCOUNT_TRANSACTIONS_SUCCESS = 'account/ACCOUNT_GET_ACCOUNT_TRANSACTIONS_SUCCESS';
const ACCOUNT_GET_ACCOUNT_TRANSACTIONS_FAILURE = 'account/ACCOUNT_GET_ACCOUNT_TRANSACTIONS_FAILURE';

const ACCOUNT_CHECK_TRANSACTION_STATUS_REQUEST = 'account/ACCOUNT_CHECK_TRANSACTION_STATUS_REQUEST';
const ACCOUNT_CHECK_TRANSACTION_STATUS_SUCCESS = 'account/ACCOUNT_CHECK_TRANSACTION_STATUS_SUCCESS';
const ACCOUNT_CHECK_TRANSACTION_STATUS_FAILURE = 'account/ACCOUNT_CHECK_TRANSACTION_STATUS_FAILURE';

const ACCOUNT_UPDATE_TRANSACTIONS_REQUEST = 'account/ACCOUNT_UPDATE_TRANSACTIONS_REQUEST';
const ACCOUNT_UPDATE_TRANSACTIONS_SUCCESS = 'account/ACCOUNT_UPDATE_TRANSACTIONS_SUCCESS';
const ACCOUNT_UPDATE_TRANSACTIONS_FAILURE = 'account/ACCOUNT_UPDATE_TRANSACTIONS_FAILURE';

const ACCOUNT_GET_ACCOUNT_BALANCES_REQUEST = 'account/ACCOUNT_GET_ACCOUNT_BALANCES_REQUEST';
const ACCOUNT_GET_ACCOUNT_BALANCES_SUCCESS = 'account/ACCOUNT_GET_ACCOUNT_BALANCES_SUCCESS';
const ACCOUNT_GET_ACCOUNT_BALANCES_FAILURE = 'account/ACCOUNT_GET_ACCOUNT_BALANCES_FAILURE';

const ACCOUNT_UPDATE_BALANCES_REQUEST = 'account/ACCOUNT_UPDATE_BALANCES_REQUEST';
const ACCOUNT_UPDATE_BALANCES_SUCCESS = 'account/ACCOUNT_UPDATE_BALANCES_SUCCESS';
const ACCOUNT_UPDATE_BALANCES_FAILURE = 'account/ACCOUNT_UPDATE_BALANCES_FAILURE';

const ACCOUNT_GET_NATIVE_PRICES_REQUEST = 'account/ACCOUNT_GET_NATIVE_PRICES_REQUEST';
const ACCOUNT_GET_NATIVE_PRICES_SUCCESS = 'account/ACCOUNT_GET_NATIVE_PRICES_SUCCESS';
const ACCOUNT_GET_NATIVE_PRICES_FAILURE = 'account/ACCOUNT_GET_NATIVE_PRICES_FAILURE';

const ACCOUNT_CHANGE_NATIVE_CURRENCY = 'account/ACCOUNT_CHANGE_NATIVE_CURRENCY';
const ACCOUNT_UPDATE_WEB3_NETWORK = 'account/ACCOUNT_UPDATE_WEB3_NETWORK';
const ACCOUNT_UPDATE_ACCOUNT_ADDRESS = 'account/ACCOUNT_UPDATE_ACCOUNT_ADDRESS';

const ACCOUNT_UPDATE_OPEN_WEBSOCKETS = 'account/ACCOUNT_UPDATE_OPEN_WEBSOCKETS';

const ACCOUNT_CLEAR_STATE = 'account/ACCOUNT_CLEAR_STATE';

// -- Actions --------------------------------------------------------------- //

let getPricesInterval = null;

export const accountCheckTransactionStatus = txHash => (dispatch, getState) => {
  const network = getState().account.network;
  dispatch({ type: ACCOUNT_CHECK_TRANSACTION_STATUS_REQUEST });
  apiGetTransactionStatus(txHash, network)
    .then(txObj => {
      if (txObj) {
        const address = getState().account.accountInfo.address;
        const transactions = getState().account.transactions;
        const _transactions = parseConfirmedTransaction(transactions, txObj.hash, txObj.timestamp);
        updateLocalTransactions(address, transactions, network);
        dispatch({
          type: ACCOUNT_CHECK_TRANSACTION_STATUS_SUCCESS,
          payload: _transactions
        });
        dispatch(accountUpdateBalances());
      } else {
        setTimeout(() => dispatch(accountCheckTransactionStatus(txHash)), 1000);
      }
    })
    .catch(error => {
      dispatch({ type: ACCOUNT_CHECK_TRANSACTION_STATUS_FAILURE });
      const message = parseError(error);
      dispatch(notificationShow(message, true));
    });
};

export const accountUpdateTransactions = txDetails => (dispatch, getState) => {
  dispatch({ type: ACCOUNT_UPDATE_TRANSACTIONS_REQUEST });
  const currentTransactions = getState().account.transactions;
  const network = getState().account.network;
  const address = getState().account.accountInfo.address;
  const nativeCurrency = getState().account.nativeCurrency;
  parseNewTransaction(txDetails, currentTransactions, nativeCurrency, address, network)
    .then(transactions => {
      updateLocalTransactions(address, transactions, network);
      dispatch({
        type: ACCOUNT_UPDATE_TRANSACTIONS_SUCCESS,
        payload: transactions
      });
      dispatch(accountCheckTransactionStatus(txDetails.hash));
    })
    .catch(error => {
      dispatch({ type: ACCOUNT_UPDATE_TRANSACTIONS_FAILURE });
      const message = parseError(error);
      dispatch(notificationShow(message, true));
    });
};

export const accountGetAccountTransactions = () => (dispatch, getState) => {
  const { accountAddress, network } = getState().account;
  let cachedTransactions = [];
  const accountLocal = getLocal(accountAddress) || null;
  if (accountLocal && accountLocal.network === network) {
    if (accountLocal && accountLocal.pending) {
      cachedTransactions = [...accountLocal.pending];
      accountLocal.pending.forEach(pendingTx =>
        dispatch(accountCheckTransactionStatus(pendingTx.hash))
      );
    }
    if (accountLocal && accountLocal.transactions) {
      cachedTransactions = _.unionBy(cachedTransactions, accountLocal.transactions, 'hash');
    }
  }
  dispatch({
    type: ACCOUNT_GET_ACCOUNT_TRANSACTIONS_REQUEST,
    payload: {
      transactions: cachedTransactions,
      fetchingTransactions:
        (accountLocal && accountLocal.network !== network) ||
        !accountLocal ||
        !accountLocal.transactions ||
        !accountLocal.transactions.length
    }
  });
  apiGetAccountTransactions(accountAddress, network)
    .then(transactions => {
      let _transactions = transactions;
      if (accountLocal && accountLocal.pending) {
        _transactions = _.unionBy(accountLocal.pending, transactions, 'hash');
      }
      dispatch({ type: ACCOUNT_GET_ACCOUNT_TRANSACTIONS_SUCCESS, payload: _transactions });
    })
    .catch(error => {
      // const message = parseError(error);
      dispatch(notificationShow(lang.t('notification.error.failed_get_account_tx'), true));
      dispatch({ type: ACCOUNT_GET_ACCOUNT_TRANSACTIONS_FAILURE });
    });
};

export const accountGetAccountBalances = () => (dispatch, getState) => {
  const { network, accountInfo, accountAddress, accountType } = getState().account;
  let cachedAccount = { ...accountInfo };
  let cachedTransactions = [];
  const accountLocal = getLocal(accountAddress) || null;
  if (accountLocal && accountLocal.network === network) {
    if (accountLocal && accountLocal.balances) {
      cachedAccount = {
        ...cachedAccount,
        assets: accountLocal.balances.assets,
        total: accountLocal.balances.total
      };
    }
    if (accountLocal && accountLocal.pending) {
      cachedTransactions = [...accountLocal.pending];
    }
    if (accountLocal && accountLocal.transactions) {
      cachedTransactions = _.unionBy(cachedTransactions, accountLocal.transactions, 'hash');
    }
  }
  dispatch({
    type: ACCOUNT_GET_ACCOUNT_BALANCES_REQUEST,
    payload: {
      accountInfo: cachedAccount,
      transactions: cachedTransactions,
      fetching: (accountLocal && accountLocal.network !== network) || !accountLocal
    }
  });
  apiGetAccountBalances(accountAddress, network)
    .then(accountInfo => {
      accountInfo = { ...accountInfo, accountType };
      dispatch({ type: ACCOUNT_GET_ACCOUNT_BALANCES_SUCCESS });
      dispatch(accountGetNativePrices(accountInfo));
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: ACCOUNT_GET_ACCOUNT_BALANCES_FAILURE });
    });
};

export const accountUpdateBalances = () => (dispatch, getState) => {
  const { network, accountAddress, accountType } = getState().account;
  dispatch({ type: ACCOUNT_UPDATE_BALANCES_REQUEST });
  apiGetAccountBalances(accountAddress, network)
    .then(accountInfo => {
      const prices = getState().account.prices;
      accountInfo = { ...accountInfo, accountType };
      const parsedAccountInfo = parseAccountBalancesPrices(accountInfo, prices, network);
      dispatch({ type: ACCOUNT_UPDATE_BALANCES_SUCCESS, payload: parsedAccountInfo });
      dispatch(accountGetNativePrices(accountInfo));
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: ACCOUNT_UPDATE_BALANCES_FAILURE });
    });
};

export const accountUpdateNetwork = network => dispatch => {
  web3SetHttpProvider(`https://${network}.infura.io/`);
  web3SetWebSocketProvider(`wss://${network}.infura.io/ws`);
  dispatch({ type: ACCOUNT_UPDATE_WEB3_NETWORK, payload: network });
};

export const accountClearIntervals = () => dispatch => {
  clearInterval(getPricesInterval);
};

export const accountUpdateAccountAddress = (accountAddress, accountType) => dispatch => {
  dispatch({
    type: ACCOUNT_UPDATE_ACCOUNT_ADDRESS,
    payload: { accountAddress, accountType }
  });
  if (accountAddress) {
    dispatch(accountGetAccountTransactions());
    dispatch(accountGetAccountBalances());
  }
};

export const accountGetNativePrices = accountInfo => (dispatch, getState) => {
  const assetSymbols = accountInfo.assets.map(asset => asset.symbol);
  const getPrices = () => {
    dispatch({
      type: ACCOUNT_GET_NATIVE_PRICES_REQUEST,
      payload: getState().account.nativeCurrency
    });
    apiGetPrices(assetSymbols)
      .then(({ data }) => {
        const nativePriceRequest = getState().account.nativePriceRequest;
        const nativeCurrency = getState().account.nativeCurrency;
        const network = getState().account.network;
        if (nativeCurrency === nativePriceRequest) {
          const prices = parsePricesObject(data, assetSymbols, nativeCurrency);
          const parsedAccountInfo = parseAccountBalancesPrices(accountInfo, prices, network);
          updateLocalBalances(parsedAccountInfo, network);
          saveLocal('native_prices', prices);
          dispatch({
            type: ACCOUNT_GET_NATIVE_PRICES_SUCCESS,
            payload: { accountInfo: parsedAccountInfo, prices }
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
  getPricesInterval = setInterval(getPrices, 15000); // 15secs
};

export const accountChangeNativeCurrency = nativeCurrency => (dispatch, getState) => {
  saveLocal('native_currency', nativeCurrency);
  let prices = getState().account.prices || getLocal('native_prices');
  const network = getState().account.network;
  const selected = nativeCurrencies[nativeCurrency];
  let newPrices = { ...prices, selected };
  let oldAccountInfo = getState().account.accountInfo;
  const newAccountInfo = parseAccountBalancesPrices(oldAccountInfo, newPrices);
  const accountInfo = { ...oldAccountInfo, ...newAccountInfo };
  updateLocalBalances(accountInfo, network);
  dispatch({
    type: ACCOUNT_CHANGE_NATIVE_CURRENCY,
    payload: { nativeCurrency, prices: newPrices, accountInfo }
  });
};

export const accountClearState = () => ({ type: ACCOUNT_CLEAR_STATE });

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  nativePriceRequest: getLocal('native_currency') || 'USD',
  nativeCurrency: getLocal('native_currency') || 'USD',
  prices: {},
  network: 'mainnet',
  accountType: '',
  accountAddress: '',
  accountInfo: {
    address: '',
    type: '',
    assets: [
      {
        name: 'Ethereum',
        symbol: 'ETH',
        address: null,
        decimals: 18,
        balance: {
          amount: '',
          display: '0.00 ETH'
        },
        native: null
      }
    ],
    total: '———'
  },
  transactions: [],
  websockets: [],
  fetchingTransactions: false,
  fetching: false
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACCOUNT_UPDATE_ACCOUNT_ADDRESS:
      return {
        ...state,
        accountType: action.payload.accountType,
        accountAddress: action.payload.accountAddress,
        transactions: []
      };
    case ACCOUNT_GET_ACCOUNT_TRANSACTIONS_REQUEST:
      return {
        ...state,
        fetchingTransactions: action.payload.fetchingTransactions,
        transactions: action.payload.transactions
      };
    case ACCOUNT_GET_ACCOUNT_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        fetchingTransactions: false,
        transactions: action.payload
      };
    case ACCOUNT_GET_ACCOUNT_TRANSACTIONS_FAILURE:
      return { ...state, fetchingTransactions: false };
    case ACCOUNT_UPDATE_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        transactions: action.payload
      };
    case ACCOUNT_UPDATE_BALANCES_SUCCESS:
      return {
        ...state,
        accountInfo: action.payload
      };
    case ACCOUNT_CHECK_TRANSACTION_STATUS_SUCCESS:
      return {
        ...state,
        transactions: action.payload
      };
    case ACCOUNT_GET_ACCOUNT_BALANCES_REQUEST:
      return {
        ...state,
        fetching: action.payload.fetching,
        accountInfo: action.payload.accountInfo,
        transactions: action.payload.transactions
      };
    case ACCOUNT_GET_ACCOUNT_BALANCES_SUCCESS:
    case ACCOUNT_GET_ACCOUNT_BALANCES_FAILURE:
      return { ...state, fetching: false };
    case ACCOUNT_GET_NATIVE_PRICES_REQUEST:
      return {
        ...state,
        fetchingNativePrices: true,
        nativePriceRequest: action.payload
      };
    case ACCOUNT_GET_NATIVE_PRICES_SUCCESS:
      return {
        ...state,
        fetchingNativePrices: false,
        nativePriceRequest: '',
        prices: action.payload.prices,
        accountInfo: action.payload.accountInfo
      };
    case ACCOUNT_GET_NATIVE_PRICES_FAILURE:
      return {
        ...state,
        fetchingNativePrices: false,
        nativePriceRequest: ''
      };
    case ACCOUNT_CHANGE_NATIVE_CURRENCY:
      return {
        ...state,
        nativeCurrency: action.payload.nativeCurrency,
        prices: action.payload.prices,
        accountInfo: action.payload.accountInfo
      };
    case ACCOUNT_UPDATE_WEB3_NETWORK:
      return {
        ...state,
        network: action.payload
      };
    case ACCOUNT_UPDATE_OPEN_WEBSOCKETS:
      return {
        ...state,
        websockets: [action.payload, ...state.websockets]
      };
    case ACCOUNT_CLEAR_STATE:
      return {
        ...state,
        ...INITIAL_STATE
      };
    default:
      return state;
  }
};
