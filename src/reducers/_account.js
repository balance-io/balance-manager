import _ from 'lodash';
import { apiGetAccountBalances, apiGetAccountTransactions, apiGetPrices } from '../helpers/api';
import {
  parseError,
  parseNewTransaction,
  parseTransactionsPrices,
  parseAccountBalancesPrices,
  parsePricesObject
} from '../helpers/parsers';
import lang from '../languages';
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

const ACCOUNT_GET_ACCOUNT_BALANCES_REQUEST = 'account/ACCOUNT_GET_ACCOUNT_BALANCES_REQUEST';
const ACCOUNT_GET_ACCOUNT_BALANCES_SUCCESS = 'account/ACCOUNT_GET_ACCOUNT_BALANCES_SUCCESS';
const ACCOUNT_GET_ACCOUNT_BALANCES_FAILURE = 'account/ACCOUNT_GET_ACCOUNT_BALANCES_FAILURE';

const ACCOUNT_GET_NATIVE_PRICES_REQUEST = 'account/ACCOUNT_GET_NATIVE_PRICES_REQUEST';
const ACCOUNT_GET_NATIVE_PRICES_SUCCESS = 'account/ACCOUNT_GET_NATIVE_PRICES_SUCCESS';
const ACCOUNT_GET_NATIVE_PRICES_FAILURE = 'account/ACCOUNT_GET_NATIVE_PRICES_FAILURE';

const ACCOUNT_CHANGE_NATIVE_CURRENCY = 'account/ACCOUNT_CHANGE_NATIVE_CURRENCY';
const ACCOUNT_UPDATE_WEB3_NETWORK = 'account/ACCOUNT_UPDATE_WEB3_NETWORK';
const ACCOUNT_UPDATE_ACCOUNT_ADDRESS_REQUEST = 'account/ACCOUNT_UPDATE_ACCOUNT_ADDRESS_REQUEST';

const ACCOUNT_PARSE_TRANSACTION_PRICES_REQUEST = 'account/ACCOUNT_PARSE_TRANSACTION_PRICES_REQUEST';
const ACCOUNT_PARSE_TRANSACTION_PRICES_SUCCESS = 'account/ACCOUNT_PARSE_TRANSACTION_PRICES_SUCCESS';
const ACCOUNT_PARSE_TRANSACTION_PRICES_FAILURE = 'account/ACCOUNT_PARSE_TRANSACTION_PRICES_FAILURE';

const ACCOUNT_CLEAR_STATE = 'account/ACCOUNT_CLEAR_STATE';

// -- Actions --------------------------------------------------------------- //

let getPricesInterval = null;

export const accountSetupWebSocket = address => dispatch => {
  window.WebSocket = window.WebSocket || window.MozWebSocket;

  const connection = new WebSocket('wss://socket.etherscan.io/wshandler');

  connection.onopen = () => {
    console.log('WebSocket open');
    const subscription = {
      event: 'txlist',
      address: address
    };
    console.log('WebSocket subscription', JSON.stringify(subscription, null, 2));
    connection.send(JSON.stringify(subscription));
  };

  connection.onerror = error => {
    console.log('WebSocket error');
  };

  connection.onmessage = message => {
    try {
      const json = JSON.parse(message.data);
      console.log('WebSocket message', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('WebSocket invalid', message.data);
      return;
    }
  };
};

export const accountUpdateTransactions = txDetails => (dispatch, getState) => {
  dispatch({ type: ACCOUNT_PARSE_TRANSACTION_PRICES_REQUEST });
  const currentTransactions = getState().account.transactions;
  const network = getState().account.network;
  const address = getState().account.accountInfo.address;
  const nativeCurrency = getState().account.nativeCurrency;
  parseNewTransaction(txDetails, currentTransactions, nativeCurrency, address, network)
    .then(transactions => {
      updateLocalTransactions(address, transactions, network);
      dispatch({
        type: ACCOUNT_PARSE_TRANSACTION_PRICES_SUCCESS,
        payload: transactions
      });
    })
    .catch(error => {
      dispatch({ type: ACCOUNT_PARSE_TRANSACTION_PRICES_FAILURE });
      const message = parseError(error);
      dispatch(notificationShow(message, true));
    });
};

export const accountParseTransactionPrices = transactions => (dispatch, getState) => {
  const currentTransactions = getState().account.transactions;
  const network = getState().account.network;
  dispatch({
    type: ACCOUNT_PARSE_TRANSACTION_PRICES_REQUEST,
    payload: !currentTransactions.length
  });
  const address = getState().account.accountInfo.address;
  const nativeCurrency = getState().account.nativeCurrency;
  parseTransactionsPrices(transactions, nativeCurrency)
    .then(parsedTransactions => {
      updateLocalTransactions(address, parsedTransactions, network);
      dispatch({
        type: ACCOUNT_PARSE_TRANSACTION_PRICES_SUCCESS,
        payload: parsedTransactions
      });
    })
    .catch(error => {
      dispatch({ type: ACCOUNT_PARSE_TRANSACTION_PRICES_FAILURE });
      const message = parseError(error);
      dispatch(notificationShow(message, true));
    });
};

export const accountGetAccountTransactions = () => (dispatch, getState) => {
  const { accountAddress, network } = getState().account;
  let cachedTransactions = [];
  const accountLocal = getLocal(accountAddress) || null;
  if (accountLocal && accountLocal.pending) {
    cachedTransactions = [...accountLocal.pending];
  }
  if (accountLocal && accountLocal.transactions) {
    cachedTransactions = _.unionBy(cachedTransactions, accountLocal.transactions, 'hash');
  }
  dispatch({
    type: ACCOUNT_GET_ACCOUNT_TRANSACTIONS_REQUEST,
    payload: {
      transactions: cachedTransactions,
      fetchingTransactions:
        !accountLocal || !accountLocal.transactions || !accountLocal.transactions.length
    }
  });
  apiGetAccountTransactions(accountAddress, network)
    .then(transactions => {
      dispatch({ type: ACCOUNT_GET_ACCOUNT_TRANSACTIONS_SUCCESS });
      let _transactions = transactions;
      if (accountLocal && accountLocal.pending) {
        _transactions = _.unionBy(accountLocal.pending, transactions, 'hash');
      }
      dispatch(accountParseTransactionPrices(_transactions));
    })
    .catch(error => {
      // const message = parseError(error);
      dispatch(notificationShow(lang.t('notification.error.failed_get_account_tx'), true));
      dispatch({ type: ACCOUNT_GET_ACCOUNT_TRANSACTIONS_FAILURE });
    });
};

export const accountGetAccountBalances = address => (dispatch, getState) => {
  const { network, accountInfo, accountType } = getState().account;
  let cachedAccount = { ...accountInfo };
  let cachedTransactions = [];
  const accountLocal = getLocal(address) || null;
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
  dispatch({
    type: ACCOUNT_GET_ACCOUNT_BALANCES_REQUEST,
    payload: {
      accountInfo: cachedAccount,
      transactions: cachedTransactions,
      fetching: !accountLocal
    }
  });
  apiGetAccountBalances(address, network)
    .then(accountInfo => {
      accountInfo = { ...accountInfo, accountType };
      dispatch({ type: ACCOUNT_GET_ACCOUNT_BALANCES_SUCCESS });
      dispatch(accountGetNativePrices(accountInfo));
      if (accountInfo.txCount) dispatch(accountGetAccountTransactions());
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: ACCOUNT_GET_ACCOUNT_BALANCES_FAILURE });
    });
};

export const accountUpdatenetwork = network => dispatch => {
  web3SetHttpProvider(`https://${network}.infura.io/`);
  web3SetWebSocketProvider(`wss://${network}.infura.io/ws`);
  dispatch({ type: ACCOUNT_UPDATE_WEB3_NETWORK, payload: network });
};

export const accountClearIntervals = () => dispatch => {
  clearInterval(getPricesInterval);
};

export const accountUpdateAccountAddress = (accountAddress, accountType) => dispatch => {
  dispatch({
    type: ACCOUNT_UPDATE_ACCOUNT_ADDRESS_REQUEST,
    payload: { accountAddress, accountType }
  });
  if (accountAddress) dispatch(accountGetAccountBalances(accountAddress));
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
    txCount: 0,
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
  fetchingTransactions: false,
  fetching: false
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACCOUNT_UPDATE_ACCOUNT_ADDRESS_REQUEST:
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
    case ACCOUNT_GET_ACCOUNT_TRANSACTIONS_FAILURE:
      return { ...state, fetchingTransactions: false };
    case ACCOUNT_PARSE_TRANSACTION_PRICES_REQUEST:
      return {
        ...state,
        fetchingTransactions: action.payload
      };
    case ACCOUNT_PARSE_TRANSACTION_PRICES_SUCCESS:
      return {
        ...state,
        transactions: action.payload,
        fetchingTransactions: false
      };
    case ACCOUNT_PARSE_TRANSACTION_PRICES_FAILURE:
      return {
        ...state,
        fetchingTransactions: false
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
    case ACCOUNT_CLEAR_STATE:
      return {
        ...state,
        ...INITIAL_STATE
      };
    default:
      return state;
  }
};
