import _ from 'lodash';
import lang, { updateLanguage } from '../languages';
import {
  apiGetAccountBalances,
  apiGetAccountTransactions,
  apiGetPrices,
} from '../handlers/api';
import { apiGetAccountUniqueTokens } from '../handlers/opensea-api.js';
import {
  parseError,
  parseAccountBalancesPrices,
  parseNewTransaction,
  parsePricesObject,
} from '../handlers/parsers';
import {
  getAccountLocal,
  getLanguage,
  getNativePrices,
  getNativeCurrency,
  resetAccount,
  saveLanguage,
  saveNativeCurrency,
  saveNativePrices,
  updateLocalBalances,
  updateLocalTransactions,
  updateLocalUniqueTokens,
} from '../handlers/commonStorage';
import { web3SetHttpProvider } from '../handlers/web3';
import { notificationShow } from './_notification';
import nativeCurrencies from '../references/native-currencies.json';

// -- Constants ------------------------------------------------------------- //
const ACCOUNT_GET_ACCOUNT_TRANSACTIONS_REQUEST =
  'account/ACCOUNT_GET_ACCOUNT_TRANSACTIONS_REQUEST';
const ACCOUNT_GET_ACCOUNT_TRANSACTIONS_SUCCESS =
  'account/ACCOUNT_GET_ACCOUNT_TRANSACTIONS_SUCCESS';
const ACCOUNT_GET_ACCOUNT_TRANSACTIONS_NO_NEW_PAYLOAD_SUCCESS =
  'account/ACCOUNT_GET_ACCOUNT_TRANSACTIONS_NO_NEW_PAYLOAD_SUCCESS';
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

const ACCOUNT_INITIALIZE_PRICES_SUCCESS =
  'account/ACCOUNT_INITIALIZE_PRICES_SUCCESS';
const ACCOUNT_INITIALIZE_PRICES_FAILURE =
  'account/ACCOUNT_INITIALIZE_PRICES_FAILURE';

const ACCOUNT_UPDATE_NETWORK = 'account/ACCOUNT_UPDATE_NETWORK';
const ACCOUNT_UPDATE_ACCOUNT_ADDRESS = 'account/ACCOUNT_UPDATE_ACCOUNT_ADDRESS';
const ACCOUNT_UPDATE_HAS_PENDING_TRANSACTION =
  'account/ACCOUNT_UPDATE_HAS_PENDING_TRANSACTION';
const ACCOUNT_CLEAR_STATE = 'account/ACCOUNT_CLEAR_STATE';

const ACCOUNT_CHANGE_NATIVE_CURRENCY_SUCCESS =
  'account/ACCOUNT_CHANGE_NATIVE_CURRENCY_SUCCESS';
const ACCOUNT_CHANGE_NATIVE_CURRENCY_FAILURE =
  'account/ACCOUNT_CHANGE_NATIVE_CURRENCY_FAILURE';

const ACCOUNT_CHANGE_LANGUAGE_SUCCESS =
  'account/ACCOUNT_CHANGE_LANGUAGE_SUCCESS';
const ACCOUNT_CHANGE_LANGUAGE_FAILURE =
  'account/ACCOUNT_CHANGE_LANGUAGE_FAILURE';

// -- Actions --------------------------------------------------------------- //
let getAccountTransactionsInterval = null;
let getAccountBalancesInterval = null;

export const accountUpdateHasPendingTransaction = (
  hasPending = true,
) => dispatch => {
  dispatch({
    type: ACCOUNT_UPDATE_HAS_PENDING_TRANSACTION,
    payload: hasPending,
  });
};

export const accountInitializeState = () => dispatch => {
  getLanguage()
    .then(language => {
      dispatch({
        type: ACCOUNT_CHANGE_LANGUAGE_SUCCESS,
        payload: { language },
      });
    })
    .catch(error => {
      dispatch({
        type: ACCOUNT_CHANGE_LANGUAGE_FAILURE,
      });
    });
  getNativeCurrency()
    .then(nativeCurrency => {
      dispatch({
        type: ACCOUNT_INITIALIZE_PRICES_SUCCESS,
        payload: { nativeCurrency },
      });
    })
    .catch(error => {
      dispatch({
        type: ACCOUNT_INITIALIZE_PRICES_FAILURE,
      });
    });
};

export const accountUpdateTransactions = txDetails => (dispatch, getState) =>
  new Promise((resolve, reject) => {
    dispatch({ type: ACCOUNT_UPDATE_TRANSACTIONS_REQUEST });
    const currentTransactions = getState().account.transactions;
    const network = getState().account.network;
    const address = getState().account.accountInfo.address;
    const nativeCurrency = getState().account.nativeCurrency;
    parseNewTransaction(txDetails, nativeCurrency)
      .then(parsedTransaction => {
        let _transactions = [...currentTransactions];
        // TODO: could technically send in pending and normal separately
        _transactions = [parsedTransaction, ..._transactions];
        updateLocalTransactions(address, _transactions, network);
        dispatch({
          type: ACCOUNT_UPDATE_TRANSACTIONS_SUCCESS,
          payload: _transactions,
        });
        resolve(true);
      })
      .catch(error => {
        dispatch({ type: ACCOUNT_UPDATE_TRANSACTIONS_FAILURE });
        const message = parseError(error);
        dispatch(notificationShow(message, true));
        reject(false);
      });
  });

export const accountUpdateAccountAddress = (accountAddress, accountType) => (
  dispatch,
  getState,
) => {
  if (!accountAddress || !accountType) return;
  const { network } = getState().account;
  if (getState().account.accountType !== accountType)
    dispatch(accountClearState());
  if (
    getState().account.accountType === accountType &&
    getState().account.accountAddress !== accountAddress
  ) {
    resetAccount(getState().account.accountAddress);
    dispatch(accountClearState());
  }
  dispatch({
    type: ACCOUNT_UPDATE_ACCOUNT_ADDRESS,
    payload: { accountAddress, accountType },
  });
  dispatch(accountUpdateNetwork(network));
  dispatch(accountGetAccountTransactions());
  dispatch(accountGetAccountBalances());
  dispatch(accountGetUniqueTokens());
};

export const accountUpdateNetwork = network => dispatch => {
  web3SetHttpProvider(`https://${network}.infura.io/`);
  dispatch({ type: ACCOUNT_UPDATE_NETWORK, payload: network });
};

export const accountChangeLanguage = language => dispatch => {
  //TODO: needs to trigger render after change
  updateLanguage(language);
  saveLanguage(language)
    .then(() => {
      dispatch({
        type: ACCOUNT_CHANGE_LANGUAGE_SUCCESS,
        payload: { language },
      });
    })
    .catch(error => {
      dispatch({
        type: ACCOUNT_CHANGE_LANGUAGE_FAILURE,
      });
    });
};

export const accountChangeNativeCurrency = nativeCurrency => (
  dispatch,
  getState,
) => {
  const prices = getState().account.prices;
  if (prices) {
    dispatch(accountUpdatePrices(nativeCurrency, prices));
  } else {
    getNativePrices()
      .then(nativePrices => {
        dispatch(accountUpdatePrices(nativeCurrency, nativePrices));
      })
      .catch(error => {
        dispatch({
          type: ACCOUNT_CHANGE_NATIVE_CURRENCY_FAILURE,
        });
      });
  }
};

const accountUpdatePrices = (nativeCurrency, prices) => (
  dispatch,
  getState,
) => {
  saveNativeCurrency(nativeCurrency);
  const accountAddress = getState().account.accountAddress;
  const network = getState().account.network;
  const selected = nativeCurrencies[nativeCurrency];
  let oldAccountInfo = getState().account.accountInfo;
  let newPrices = { ...prices, selected };
  const newAccountInfo = parseAccountBalancesPrices(oldAccountInfo, newPrices);
  const accountInfo = { ...oldAccountInfo, ...newAccountInfo };
  updateLocalBalances(accountAddress, accountInfo, network);
  dispatch({
    type: ACCOUNT_CHANGE_NATIVE_CURRENCY_SUCCESS,
    payload: { nativeCurrency, prices: newPrices, accountInfo },
  });
};

export const accountClearState = () => dispatch => {
  clearInterval(getAccountBalancesInterval);
  clearInterval(getAccountTransactionsInterval);
  dispatch({ type: ACCOUNT_CLEAR_STATE });
};

const accountGetNativePrices = accountInfo => (dispatch, getState) => {
  const assetSymbols = accountInfo.assets.map(asset => asset.symbol);
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
        updateLocalBalances(
          parsedAccountInfo.address,
          parsedAccountInfo,
          network,
        );
        saveNativePrices(prices);
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

const accountGetAccountBalances = () => (dispatch, getState) => {
  const {
    network,
    accountInfo,
    accountAddress,
    accountType,
  } = getState().account;
  let cachedAccount = { ...accountInfo };
  if (accountInfo.address && accountInfo.accountType) {
    dispatch(accountUpdateBalances());
  } else {
    getAccountLocal(accountAddress)
      .then(accountLocal => {
        if (accountLocal && accountLocal[network]) {
          if (accountLocal[network].balances) {
            cachedAccount = {
              ...cachedAccount,
              type: accountType,
              assets: accountLocal[network].balances.assets,
              total: accountLocal[network].balances.total,
            };
          }
          if (accountLocal[network].type && !cachedAccount.type) {
            cachedAccount.type = accountLocal[network].type;
          }
          dispatch({
            type: ACCOUNT_GET_ACCOUNT_BALANCES_REQUEST,
            payload: {
              accountType: cachedAccount.type || accountType,
              accountInfo: cachedAccount,
              fetching:
                (accountLocal && !accountLocal[network]) || !accountLocal,
            },
          });
        }
        dispatch(accountUpdateBalances());
      })
      .catch(error => {
        const message = parseError(error);
        dispatch(notificationShow(message, true));
      });
  }
};

const accountUpdateBalances = () => (dispatch, getState) => {
  const { network, accountAddress, accountType } = getState().account;
  dispatch({ type: ACCOUNT_UPDATE_BALANCES_REQUEST });
  const getAccountBalances = () => {
    apiGetAccountBalances(accountAddress, network)
      .then(({ data }) => {
        let accountInfo = { ...data, type: accountType };
        dispatch({
          type: ACCOUNT_GET_ACCOUNT_BALANCES_SUCCESS,
        });
        dispatch(accountGetNativePrices(accountInfo));
      })
      .catch(error => {
        const message = parseError(error);
        dispatch(notificationShow(message, true));
        dispatch({ type: ACCOUNT_UPDATE_BALANCES_FAILURE });
      });
  };
  getAccountBalances();
  clearInterval(getAccountBalancesInterval);
  getAccountBalancesInterval = setInterval(getAccountBalances, 15000); // 15 secs
};

const accountGetTransactions = (accountAddress, network, lastTxHash, page) => (
  dispatch,
  getState,
) => {
  const existingTransactions = getState().account.transactions;
  const partitions = _.partition(existingTransactions, txn => txn.pending);
  dispatch(
    accountGetTransactionsPages({
      newTransactions: [],
      pendingTransactions: partitions[0],
      confirmedTransactions: partitions[1],
      accountAddress,
      network,
      lastTxHash,
      page,
    }),
  );
};

const accountGetTransactionsPages = ({
  newTransactions,
  pendingTransactions,
  confirmedTransactions,
  accountAddress,
  network,
  lastTxHash,
  page,
}) => (dispatch, getState) => {
  apiGetAccountTransactions(accountAddress, network, lastTxHash, page)
    .then(({ data: transactionsForPage, pages }) => {
      if (!transactionsForPage.length) {
        dispatch({
          type: ACCOUNT_GET_ACCOUNT_TRANSACTIONS_NO_NEW_PAYLOAD_SUCCESS,
        });
        return;
      }
      let updatedPendingTransactions = pendingTransactions;
      if (pendingTransactions.length) {
        updatedPendingTransactions = _.filter(
          pendingTransactions,
          pendingTxn => {
            const matchingElement = _.find(
              transactionsForPage,
              txn => txn.hash && txn.hash.startsWith(pendingTxn.hash),
            );
            return !matchingElement;
          },
        );
      }
      const address = getState().account.accountAddress;
      let _newPages = newTransactions.concat(transactionsForPage);
      let _transactions = _.unionBy(
        updatedPendingTransactions,
        _newPages,
        confirmedTransactions,
        'hash',
      );
      updateLocalTransactions(address, _transactions, network);
      dispatch({
        type: ACCOUNT_GET_ACCOUNT_TRANSACTIONS_SUCCESS,
        payload: _transactions,
      });
      if (page < pages) {
        const nextPage = page + 1;
        dispatch(
          accountGetTransactionsPages({
            newTransactions: _newPages,
            pendingTransactions: updatedPendingTransactions,
            confirmedTransactions,
            accountAddress,
            network,
            lastTxHash,
            page: nextPage,
          }),
        );
      }
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

const accountGetAccountTransactions = () => (dispatch, getState) => {
  const getAccountTransactions = () => {
    const { accountAddress, network, transactions } = getState().account;
    if (transactions.length) {
      const lastSuccessfulTxn = _.find(
        transactions,
        txn => txn.hash && !txn.pending,
      );
      const lastTxHash = lastSuccessfulTxn ? lastSuccessfulTxn.hash : '';
      dispatch(accountGetTransactions(accountAddress, network, lastTxHash, 1));
    } else {
      let cachedTransactions = [];
      let confirmedTransactions = [];
      getAccountLocal(accountAddress)
        .then(accountLocal => {
          if (accountLocal && accountLocal[network]) {
            if (accountLocal[network].pending) {
              cachedTransactions = [...accountLocal[network].pending];
            }
            if (accountLocal[network].transactions) {
              confirmedTransactions = accountLocal[network].transactions;
              cachedTransactions = _.unionBy(
                cachedTransactions,
                accountLocal[network].transactions,
                'hash',
              );
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
          const lastSuccessfulTxn = _.find(
            confirmedTransactions,
            txn => txn.hash,
          );
          const lastTxHash = lastSuccessfulTxn ? lastSuccessfulTxn.hash : '';
          dispatch(
            accountGetTransactions(accountAddress, network, lastTxHash, 1),
          );
        })
        .catch(error => {
          console.log('error', error);
          dispatch({ type: ACCOUNT_GET_ACCOUNT_TRANSACTIONS_FAILURE });
        });
    }
  };
  getAccountTransactions();
  clearInterval(getAccountTransactionsInterval);
  getAccountTransactionsInterval = setInterval(getAccountTransactions, 15000); // 15 secs
};

const accountGetUniqueTokens = () => (dispatch, getState) => {
  dispatch({ type: ACCOUNT_GET_ACCOUNT_UNIQUE_TOKENS_REQUEST });
  const { accountAddress, network } = getState().account;
  getAccountLocal(accountAddress)
    .then(accountLocal => {
      const cachedUniqueTokens = _.get(
        accountLocal,
        `${network}.uniqueTokens`,
        null,
      );
      if (cachedUniqueTokens) {
        updateLocalUniqueTokens(accountAddress, cachedUniqueTokens, network);
        dispatch({
          type: ACCOUNT_GET_ACCOUNT_UNIQUE_TOKENS_SUCCESS,
          payload: cachedUniqueTokens,
        });
      }
      apiGetAccountUniqueTokens(accountAddress)
        .then(data => {
          updateLocalUniqueTokens(accountAddress, data, network);
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
    })
    .catch(error => {
      dispatch({ type: ACCOUNT_GET_ACCOUNT_UNIQUE_TOKENS_FAILURE });
    });
};

// -- Reducer --------------------------------------------------------------- //
export const INITIAL_ACCOUNT_STATE = {
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
    total: null,
  },
  fetching: null,
  fetchingTransactions: false,
  fetchingUniqueTokens: false,
  hasPendingTransaction: false,
  language: 'en',
  nativePriceRequest: 'USD',
  nativeCurrency: 'USD',
  network: 'mainnet',
  prices: {},
  transactions: [],
  uniqueTokens: [],
};

export default (state = INITIAL_ACCOUNT_STATE, action) => {
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
    case ACCOUNT_GET_ACCOUNT_TRANSACTIONS_NO_NEW_PAYLOAD_SUCCESS:
      return {
        ...state,
        fetchingTransactions: false,
      };
    case ACCOUNT_GET_ACCOUNT_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        fetchingTransactions: false,
        transactions: action.payload,
      };
    case ACCOUNT_GET_ACCOUNT_TRANSACTIONS_FAILURE:
      return { ...state, fetchingTransactions: false };
    case ACCOUNT_CHECK_TRANSACTION_STATUS_SUCCESS:
      return {
        ...state,
        transactions: action.payload,
      };
    case ACCOUNT_UPDATE_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        transactions: action.payload,
      };
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
    case ACCOUNT_GET_ACCOUNT_BALANCES_REQUEST:
      return {
        ...state,
        fetching: action.payload.fetching,
        accountType: action.payload.accountType,
        accountInfo: action.payload.accountInfo,
      };
    case ACCOUNT_GET_ACCOUNT_BALANCES_SUCCESS:
      return {
        ...state,
        fetching: false,
      };
    case ACCOUNT_GET_ACCOUNT_BALANCES_FAILURE:
      return {
        ...state,
        fetching: false,
      };
    case ACCOUNT_UPDATE_BALANCES_REQUEST:
      return {
        ...state,
        fetching: true,
      };
    case ACCOUNT_UPDATE_BALANCES_SUCCESS:
      return {
        ...state,
        accountInfo: action.payload,
        fetching: false,
      };
    case ACCOUNT_UPDATE_BALANCES_FAILURE:
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
        nativePriceRequest: 'USD',
      };
    case ACCOUNT_INITIALIZE_PRICES_SUCCESS:
      return {
        ...state,
        nativePriceRequest: action.payload.nativeCurrency,
        nativeCurrency: action.payload.nativeCurrency,
      };
    case ACCOUNT_INITIALIZE_PRICES_FAILURE:
      return {
        ...state,
      };
    case ACCOUNT_UPDATE_HAS_PENDING_TRANSACTION:
      return { ...state, hasPendingTransaction: action.payload };
    case ACCOUNT_CHANGE_NATIVE_CURRENCY_SUCCESS:
      return {
        ...state,
        nativeCurrency: action.payload.nativeCurrency,
        prices: action.payload.prices,
        accountInfo: action.payload.accountInfo,
      };
    case ACCOUNT_CHANGE_NATIVE_CURRENCY_FAILURE:
      return {
        ...state,
      };
    case ACCOUNT_CHANGE_LANGUAGE_SUCCESS:
      return {
        ...state,
        language: action.payload.language,
      };
    case ACCOUNT_CHANGE_LANGUAGE_FAILURE:
      return {
        ...state,
      };
    case ACCOUNT_CLEAR_STATE:
      return {
        ...state,
        ...INITIAL_ACCOUNT_STATE,
      };
    default:
      return state;
  }
};
