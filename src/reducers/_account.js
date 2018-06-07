import _ from 'lodash';
import lang, { updateLanguage } from '../languages';
import {
  apiGetAccountBalances,
  apiGetAccountTransactions,
  apiGetPrices,
  apiGetTransactionStatus,
} from '../handlers/api';
import { apiGetAccountUniqueTokens } from '../handlers/opensea-api.js';
import {
  parseError,
  parseNewTransaction,
  parseAccountBalancesPrices,
  parsePricesObject,
  parseConfirmedTransaction,
} from '../handlers/parsers';
import {
  saveLocal,
  getLocal,
  updateLocalTransactions,
  updateLocalBalances,
} from '../handlers/localstorage';
import { web3SetHttpProvider } from '../handlers/web3';
import { notificationShow } from './_notification';
import nativeCurrencies from '../references/native-currencies.json';

// -- Constants ------------------------------------------------------------- //

const ACCOUNT_GET_ACCOUNT_TRANSACTIONS_REQUEST =
  'account/ACCOUNT_GET_ACCOUNT_TRANSACTIONS_REQUEST';
const ACCOUNT_GET_ACCOUNT_TRANSACTIONS_SUCCESS =
  'account/ACCOUNT_GET_ACCOUNT_TRANSACTIONS_SUCCESS';
const ACCOUNT_GET_ACCOUNT_TRANSACTIONS_FAILURE =
  'account/ACCOUNT_GET_ACCOUNT_TRANSACTIONS_FAILURE';

const ACCOUNT_CHECK_TRANSACTION_STATUS_REQUEST =
  'account/ACCOUNT_CHECK_TRANSACTION_STATUS_REQUEST';
const ACCOUNT_CHECK_TRANSACTION_STATUS_SUCCESS =
  'account/ACCOUNT_CHECK_TRANSACTION_STATUS_SUCCESS';
const ACCOUNT_CHECK_TRANSACTION_STATUS_FAILURE =
  'account/ACCOUNT_CHECK_TRANSACTION_STATUS_FAILURE';

const ACCOUNT_UPDATE_TRANSACTIONS_REQUEST =
  'account/ACCOUNT_UPDATE_TRANSACTIONS_REQUEST';
const ACCOUNT_UPDATE_TRANSACTIONS_SUCCESS =
  'account/ACCOUNT_UPDATE_TRANSACTIONS_SUCCESS';
const ACCOUNT_UPDATE_TRANSACTIONS_FAILURE =
  'account/ACCOUNT_UPDATE_TRANSACTIONS_FAILURE';

const ACCOUNT_GET_ACCOUNT_BALANCES_REQUEST =
  'account/ACCOUNT_GET_ACCOUNT_BALANCES_REQUEST';
const ACCOUNT_GET_ACCOUNT_BALANCES_SUCCESS =
  'account/ACCOUNT_GET_ACCOUNT_BALANCES_SUCCESS';
const ACCOUNT_GET_ACCOUNT_BALANCES_FAILURE =
  'account/ACCOUNT_GET_ACCOUNT_BALANCES_FAILURE';

const ACCOUNT_UPDATE_BALANCES_REQUEST =
  'account/ACCOUNT_UPDATE_BALANCES_REQUEST';
const ACCOUNT_UPDATE_BALANCES_SUCCESS =
  'account/ACCOUNT_UPDATE_BALANCES_SUCCESS';
const ACCOUNT_UPDATE_BALANCES_FAILURE =
  'account/ACCOUNT_UPDATE_BALANCES_FAILURE';

const ACCOUNT_GET_NATIVE_PRICES_REQUEST =
  'account/ACCOUNT_GET_NATIVE_PRICES_REQUEST';
const ACCOUNT_GET_NATIVE_PRICES_SUCCESS =
  'account/ACCOUNT_GET_NATIVE_PRICES_SUCCESS';
const ACCOUNT_GET_NATIVE_PRICES_FAILURE =
  'account/ACCOUNT_GET_NATIVE_PRICES_FAILURE';

const ACCOUNT_GET_ACCOUNT_UNIQUE_TOKENS_REQUEST =
  'account/ACCOUNT_GET_ACCOUNT_UNIQUE_TOKENS_REQUEST';
const ACCOUNT_GET_ACCOUNT_UNIQUE_TOKENS_SUCCESS =
  'account/ACCOUNT_GET_ACCOUNT_UNIQUE_TOKENS_SUCCESS';
const ACCOUNT_GET_ACCOUNT_UNIQUE_TOKENS_FAILURE =
  'account/ACCOUNT_GET_ACCOUNT_UNIQUE_TOKENS_FAILURE';

const ACCOUNT_CHANGE_NATIVE_CURRENCY = 'account/ACCOUNT_CHANGE_NATIVE_CURRENCY';

const ACCOUNT_UPDATE_ACCOUNT_ADDRESS = 'account/ACCOUNT_UPDATE_ACCOUNT_ADDRESS';

const ACCOUNT_UPDATE_NETWORK = 'account/ACCOUNT_UPDATE_NETWORK';

const ACCOUNT_CLEAR_STATE = 'account/ACCOUNT_CLEAR_STATE';
const ACCOUNT_CHANGE_LANGUAGE = 'account/ACCOUNT_CHANGE_LANGUAGE';

// -- Actions --------------------------------------------------------------- //
let getPricesInterval = null;

export const accountCheckTransactionStatus = txHash => (dispatch, getState) => {
  const network = getState().account.network;
  dispatch({ type: ACCOUNT_CHECK_TRANSACTION_STATUS_REQUEST });
  apiGetTransactionStatus(txHash, network)
    .then(({ data }) => {
      if (data) {
        const address = getState().account.accountInfo.address;
        const transactions = getState().account.transactions;
        const _transactions = parseConfirmedTransaction(
          transactions,
          txHash,
          data.timestamp,
        );
        updateLocalTransactions(address, _transactions, network);
        dispatch({
          type: ACCOUNT_CHECK_TRANSACTION_STATUS_SUCCESS,
          payload: _transactions,
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
  parseNewTransaction(
    txDetails,
    currentTransactions,
    nativeCurrency,
    address,
    network,
  )
    .then(transactions => {
      updateLocalTransactions(address, transactions, network);
      dispatch({
        type: ACCOUNT_UPDATE_TRANSACTIONS_SUCCESS,
        payload: transactions,
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
  let confirmedTransactions = [];
  const accountLocal = getLocal(accountAddress) || null;
  if (accountLocal && accountLocal[network]) {
    if (accountLocal[network].pending) {
      cachedTransactions = [...accountLocal[network].pending];
      accountLocal[network].pending.forEach(pendingTx =>
        dispatch(accountCheckTransactionStatus(pendingTx.hash)),
      );
    }
    if (accountLocal[network].transactions) {
      confirmedTransactions = accountLocal[network].transactions;
      cachedTransactions = _.unionBy(
        cachedTransactions,
        accountLocal[network].transactions,
        'hash',
      );
      updateLocalTransactions(accountAddress, cachedTransactions, network);
    }
  }
  dispatch({
    type: ACCOUNT_GET_ACCOUNT_TRANSACTIONS_REQUEST,
    payload: {
      transactions: cachedTransactions,
      fetchingTransactions:
        (accountLocal && !accountLocal[network]) ||
        !accountLocal ||
        !accountLocal[network].transactions ||
        !accountLocal[network].transactions.length,
    },
  });
  const lastTxHash = confirmedTransactions.length
    ? confirmedTransactions[0].hash
    : '';
  apiGetAccountTransactions(accountAddress, network, lastTxHash)
    .then(({ data }) => {
      const transactions = data;
      const address = getState().account.accountAddress;
      const currentTransactions = getState().account.transactions;
      let _transactions = _.unionBy(transactions, currentTransactions, 'hash');
      updateLocalTransactions(address, _transactions, network);
      dispatch({
        type: ACCOUNT_GET_ACCOUNT_TRANSACTIONS_SUCCESS,
        payload: _transactions,
      });
    })
    .catch(error => {
      dispatch(
        notificationShow(
          lang.t('notification.error.failed_get_account_tx'),
          true,
        ),
      );
      dispatch({ type: ACCOUNT_GET_ACCOUNT_TRANSACTIONS_FAILURE });
    });
};

export const accountGetAccountBalances = () => (dispatch, getState) => {
  const {
    network,
    accountInfo,
    accountAddress,
    accountType,
  } = getState().account;
  let cachedAccount = { ...accountInfo };
  let cachedTransactions = [];
  const accountLocal = getLocal(accountAddress) || null;
  if (accountLocal && accountLocal[network]) {
    if (accountLocal[network].balances) {
      cachedAccount = {
        ...cachedAccount,
        assets: accountLocal[network].balances.assets,
        total: accountLocal[network].balances.total,
      };
    }
    if (accountLocal[network].type && !cachedAccount.type) {
      cachedAccount.type = accountLocal[network].type;
    }
    if (accountLocal[network].pending) {
      cachedTransactions = [...accountLocal[network].pending];
    }
    if (accountLocal[network].transactions) {
      cachedTransactions = _.unionBy(
        cachedTransactions,
        accountLocal[network].transactions,
        'hash',
      );
      updateLocalTransactions(accountAddress, cachedTransactions, network);
    }
  }
  dispatch({
    type: ACCOUNT_GET_ACCOUNT_BALANCES_REQUEST,
    payload: {
      accountType: cachedAccount.type || accountType,
      accountInfo: cachedAccount,
      transactions: cachedTransactions,
      fetching: (accountLocal && !accountLocal[network]) || !accountLocal,
    },
  });
  apiGetAccountBalances(accountAddress, network)
    .then(({ data }) => {
      let accountInfo = { ...data, type: accountType };
      updateLocalBalances(accountAddress, accountInfo, network);
      dispatch({ type: ACCOUNT_GET_ACCOUNT_BALANCES_SUCCESS });
      dispatch(accountGetNativePrices(accountInfo));
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: ACCOUNT_GET_ACCOUNT_BALANCES_FAILURE });
    });
};

export const accountGetUniqueTokens = () => (dispatch, getState) => {
  const { accountAddress } = getState().account;
  dispatch({
    type: ACCOUNT_GET_ACCOUNT_UNIQUE_TOKENS_REQUEST,
  });
  apiGetAccountUniqueTokens(accountAddress)
    .then(data => {
      dispatch({
        type: ACCOUNT_GET_ACCOUNT_UNIQUE_TOKENS_SUCCESS,
        payload: data,
      });
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: ACCOUNT_GET_ACCOUNT_UNIQUE_TOKENS_FAILURE });
    });
};

export const accountUpdateBalances = () => (dispatch, getState) => {
  const { network, accountAddress, accountType } = getState().account;
  dispatch({ type: ACCOUNT_UPDATE_BALANCES_REQUEST });
  apiGetAccountBalances(accountAddress, network)
    .then(({ data }) => {
      const prices = getState().account.prices;
      let accountInfo = { ...data, type: accountType };
      const parsedAccountInfo = parseAccountBalancesPrices(
        accountInfo,
        prices,
        network,
      );
      dispatch({
        type: ACCOUNT_UPDATE_BALANCES_SUCCESS,
        payload: parsedAccountInfo,
      });
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
  dispatch({ type: ACCOUNT_UPDATE_NETWORK, payload: network });
};

export const accountClearIntervals = () => dispatch => {
  clearInterval(getPricesInterval);
};

export const accountUpdateAccountAddress = (accountAddress, accountType) => (
  dispatch,
  getState,
) => {
  if (!accountAddress || !accountType) return;
  const { network } = getState().account;
  if (getState().account.accountType !== accountType)
    dispatch(accountClearState());
  dispatch({
    type: ACCOUNT_UPDATE_ACCOUNT_ADDRESS,
    payload: { accountAddress, accountType },
  });
  dispatch(accountUpdateNetwork(network));
  dispatch(accountGetAccountTransactions());
  dispatch(accountGetAccountBalances());
  dispatch(accountGetUniqueTokens());
};

export const accountChangeLanguage = language => dispatch => {
    //TODO: needs to trigger render after change
    updateLanguage(language);
    saveLocal('language', language);
    dispatch({
        type: ACCOUNT_CHANGE_LANGUAGE,
        payload: { language }
    });
}

export const accountGetNativePrices = accountInfo => (dispatch, getState) => {
  const assetSymbols = accountInfo.assets.map(asset => asset.symbol);
  const getPrices = () => {
    dispatch({
      type: ACCOUNT_GET_NATIVE_PRICES_REQUEST,
      payload: getState().account.nativeCurrency,
    });
    apiGetPrices(assetSymbols)
      .then(({ data }) => {
        const nativePriceRequest = getState().account.nativePriceRequest;
        const nativeCurrency = getState().account.nativeCurrency;
        const network = getState().account.network;
        if (nativeCurrency === nativePriceRequest) {
          const prices = parsePricesObject(data, assetSymbols, nativeCurrency);
          const parsedAccountInfo = parseAccountBalancesPrices(
            accountInfo,
            prices,
            network,
          );
          updateLocalBalances(parsedAccountInfo, network);
          saveLocal('native_prices', prices);
          dispatch({
            type: ACCOUNT_GET_NATIVE_PRICES_SUCCESS,
            payload: { accountInfo: parsedAccountInfo, prices },
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

export const accountChangeNativeCurrency = nativeCurrency => (
  dispatch,
  getState,
) => {
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
    payload: { nativeCurrency, prices: newPrices, accountInfo },
  });
};

export const accountClearState = () => dispatch => {
  clearInterval(getPricesInterval);
  dispatch({ type: ACCOUNT_CLEAR_STATE });
};

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  nativePriceRequest: getLocal('native_currency') || 'USD',
  nativeCurrency: getLocal('native_currency') || 'USD',
  language: getLocal('language') || 'en',
  prices: {},
  network: 'mainnet',
  accountType: '',
  accountAddress: '',
  accountInfo: {
    address: '',
    accountType: '',
    assets: [
      {
        name: 'Ethereum',
        symbol: 'ETH',
        address: null,
        decimals: 18,
        balance: {
          amount: '',
          display: '0.00 ETH',
        },
        native: null,
      },
    ],
    total: '———',
  },
  transactions: [],
  uniqueTokens: [],
  fetchingTransactions: false,
  fetchingUniqueTokens: false,
  fetching: false,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACCOUNT_UPDATE_ACCOUNT_ADDRESS:
      return {
        ...state,
        accountType: action.payload.accountType,
        accountAddress: action.payload.accountAddress,
        transactions: [],
      };
    case ACCOUNT_GET_ACCOUNT_TRANSACTIONS_REQUEST:
      return {
        ...state,
        fetchingTransactions: action.payload.fetchingTransactions,
        transactions: action.payload.transactions,
      };
    case ACCOUNT_GET_ACCOUNT_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        fetchingTransactions: false,
        transactions: action.payload,
      };
    case ACCOUNT_GET_ACCOUNT_TRANSACTIONS_FAILURE:
      return { ...state, fetchingTransactions: false };
    case ACCOUNT_GET_ACCOUNT_UNIQUE_TOKENS_REQUEST:
      return {
        ...state,
        fetchingUniqueTokens: true,
      };
    case ACCOUNT_GET_ACCOUNT_UNIQUE_TOKENS_SUCCESS:
      return {
        ...state,
        fetchingUniqueTokens: false,
        uniqueTokens: action.payload,
      };
    case ACCOUNT_GET_ACCOUNT_UNIQUE_TOKENS_FAILURE:
      return { ...state, fetchingUniqueTokens: false };
    case ACCOUNT_UPDATE_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        transactions: action.payload,
      };
    case ACCOUNT_UPDATE_BALANCES_SUCCESS:
      return {
        ...state,
        accountInfo: action.payload,
      };
    case ACCOUNT_CHECK_TRANSACTION_STATUS_SUCCESS:
      return {
        ...state,
        transactions: action.payload,
      };
    case ACCOUNT_GET_ACCOUNT_BALANCES_REQUEST:
      return {
        ...state,
        fetching: action.payload.fetching,
        accountType: action.payload.accountType,
        accountInfo: action.payload.accountInfo,
        transactions: action.payload.transactions,
      };
    case ACCOUNT_CHANGE_LANGUAGE:
      return {
        ...state,
        language: action.payload.language
      }
    case ACCOUNT_GET_ACCOUNT_BALANCES_SUCCESS:
    case ACCOUNT_GET_ACCOUNT_BALANCES_FAILURE:
      return { ...state, fetching: false };
    case ACCOUNT_GET_NATIVE_PRICES_REQUEST:
      return {
        ...state,
        fetchingNativePrices: true,
        nativePriceRequest: action.payload,
      };
    case ACCOUNT_GET_NATIVE_PRICES_SUCCESS:
      return {
        ...state,
        fetchingNativePrices: false,
        nativePriceRequest: '',
        prices: action.payload.prices,
        accountInfo: action.payload.accountInfo,
      };
    case ACCOUNT_GET_NATIVE_PRICES_FAILURE:
      return {
        ...state,
        fetchingNativePrices: false,
        nativePriceRequest: '',
      };
    case ACCOUNT_CHANGE_NATIVE_CURRENCY:
      return {
        ...state,
        nativeCurrency: action.payload.nativeCurrency,
        prices: action.payload.prices,
        accountInfo: action.payload.accountInfo,
      };
    case ACCOUNT_UPDATE_NETWORK:
      return {
        ...state,
        network: action.payload,
      };
    case ACCOUNT_CLEAR_STATE:
      return {
        ...state,
        ...INITIAL_STATE,
      };
    default:
      return state;
  }
};
