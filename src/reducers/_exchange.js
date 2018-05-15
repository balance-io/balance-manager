import {
  apiShapeshiftGetCurrencies,
  apiShapeshiftGetQuotedPrice,
  apiGetGasPrices
} from '../handlers/api';
import { parseError, parseGasPrices } from '../handlers/parsers';
import { web3SendTransactionMultiWallet } from '../handlers/web3';
import {
  subtract,
  greaterThan,
  formatInputDecimals,
  convertAmountFromBigNumber,
  convertStringToNumber
} from '../helpers/bignumber';
import { notificationShow } from './_notification';
import { accountUpdateTransactions } from './_account';
import ethUnits from '../references/ethereum-units.json';

// -- Constants ------------------------------------------------------------- //

const EXCHANGE_GET_AVAILABLE_REQUEST = 'exchange/EXCHANGE_GET_AVAILABLE_REQUEST';
const EXCHANGE_GET_AVAILABLE_SUCCESS = 'exchange/EXCHANGE_GET_AVAILABLE_SUCCESS';
const EXCHANGE_GET_AVAILABLE_FAILURE = 'exchange/EXCHANGE_GET_AVAILABLE_FAILURE';

const EXCHANGE_GET_GAS_PRICE_REQUEST = 'exchange/EXCHANGE_GET_GAS_PRICE_REQUEST';
const EXCHANGE_GET_GAS_PRICE_SUCCESS = 'exchange/EXCHANGE_GET_GAS_PRICE_SUCCESS';
const EXCHANGE_GET_GAS_PRICE_FAILURE = 'exchange/EXCHANGE_GET_GAS_PRICE_FAILURE';

const EXCHANGE_GET_MARKET_INFO_REQUEST = 'exchange/EXCHANGE_GET_MARKET_INFO_REQUEST';
const EXCHANGE_GET_MARKET_INFO_SUCCESS = 'exchange/EXCHANGE_GET_MARKET_INFO_SUCCESS';
const EXCHANGE_GET_MARKET_INFO_FAILURE = 'exchange/EXCHANGE_GET_MARKET_INFO_FAILURE';

const EXCHANGE_TRANSACTION_REQUEST = 'exchange/EXCHANGE_TRANSACTION_REQUEST';
const EXCHANGE_TRANSACTION_SUCCESS = 'exchange/EXCHANGE_TRANSACTION_SUCCESS';
const EXCHANGE_TRANSACTION_FAILURE = 'exchange/EXCHANGE_TRANSACTION_FAILURE';

const EXCHANGE_TOGGLE_CONFIRMATION_VIEW = 'exchange/EXCHANGE_TOGGLE_CONFIRMATION_VIEW';

const EXCHANGE_UPDATE_DEPOSIT_AMOUNT = 'exchange/EXCHANGE_UPDATE_DEPOSIT_AMOUNT';
const EXCHANGE_UPDATE_WITHDRAWAL_AMOUNT = 'exchange/EXCHANGE_UPDATE_WITHDRAWAL_AMOUNT';

const EXCHANGE_UPDATE_DEPOSIT_SELECTED = 'exchange/EXCHANGE_UPDATE_DEPOSIT_SELECTED';
const EXCHANGE_UPDATE_WITHDRAWAL_SELECTED = 'exchange/EXCHANGE_UPDATE_WITHDRAWAL_SELECTED';

const EXCHANGE_CLEAR_FIELDS = 'exchange/EXCHANGE_CLEAR_FIELDS';

// -- Actions --------------------------------------------------------------- //

export const exchangeUpdateExchangeRate = () => (dispatch, getState) => {
  const { depositSelected, withdrawalSelected, depositAmount } = getState().exchange;
  dispatch({ type: EXCHANGE_GET_MARKET_INFO_REQUEST });
  apiShapeshiftGetQuotedPrice({
    depositSymbol: depositSelected.symbol,
    withdrawalSymbol: withdrawalSelected.symbol
  })
    .then(({ data }) => {
      const exchangeDetails = data.success;
      dispatch({ type: EXCHANGE_GET_MARKET_INFO_SUCCESS, payload: exchangeDetails });
      dispatch(exchangeUpdateDepositAmount(depositAmount));
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: EXCHANGE_GET_MARKET_INFO_FAILURE });
    });
};

export const exchangeGetGasPrices = () => (dispatch, getState) => {
  const { prices } = getState().account;
  const { gasLimit } = getState().exchange;
  dispatch({ type: EXCHANGE_GET_GAS_PRICE_REQUEST });
  apiGetGasPrices()
    .then(({ data }) => {
      const gasPrices = parseGasPrices(data, prices, gasLimit);
      const gasPrice = gasPrices.average;
      dispatch({ type: EXCHANGE_GET_GAS_PRICE_SUCCESS, payload: gasPrice });
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: EXCHANGE_GET_GAS_PRICE_FAILURE });
    });
};

export const exchangeModalInit = () => (dispatch, getState) => {
  const { accountAddress, accountInfo } = getState().account;
  const depositSelected = accountInfo.assets.filter(asset => asset.symbol === 'ETH')[0];
  dispatch({
    type: EXCHANGE_GET_AVAILABLE_REQUEST,
    payload: { address: accountAddress, depositSelected }
  });
  apiShapeshiftGetCurrencies()
    .then(({ data }) => {
      const withdrawalAssets = data;
      const availableSymbols = withdrawalAssets.map(availableAsset => availableAsset.symbol);
      const depositAssets = accountInfo.assets.filter(
        asset => availableSymbols.indexOf(asset.symbol) !== -1
      );
      dispatch({
        type: EXCHANGE_GET_AVAILABLE_SUCCESS,
        payload: { withdrawalAssets, depositAssets, withdrawalSelected: withdrawalAssets[1] }
      });
      dispatch(exchangeGetGasPrices());
      dispatch(exchangeUpdateExchangeRate());
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: EXCHANGE_GET_AVAILABLE_FAILURE });
    });
};

export const exchangeUpdateDepositSelected = value => (dispatch, getState) => {
  const { withdrawalAssets, depositAssets } = getState().exchange;
  let { withdrawalSelected, depositSelected } = getState().exchange;
  if (value === withdrawalSelected.symbol) {
    withdrawalSelected = withdrawalAssets.filter(
      asset => asset.symbol === depositSelected.symbol
    )[0];
    if (!withdrawalSelected) {
      withdrawalSelected = withdrawalAssets.filter(asset => asset.symbol !== value)[0];
    }
  }
  depositSelected = depositAssets.filter(asset => asset.symbol === 'ETH')[0];
  if (value !== 'ETH') {
    depositSelected = depositAssets.filter(asset => asset.symbol === value)[0];
  }
  dispatch({
    type: EXCHANGE_UPDATE_DEPOSIT_SELECTED,
    payload: { depositSelected, withdrawalSelected }
  });
  dispatch(exchangeUpdateExchangeRate());
};

export const exchangeUpdateWithdrawalSelected = value => (dispatch, getState) => {
  const { withdrawalAssets, depositAssets } = getState().exchange;
  let { withdrawalSelected, depositSelected } = getState().exchange;
  if (value === depositSelected.symbol) {
    depositSelected = depositAssets.filter(asset => asset.symbol === withdrawalSelected.symbol)[0];
    if (!depositSelected) {
      depositSelected = depositAssets.filter(asset => asset.symbol !== value)[0];
    }
  }
  withdrawalSelected = withdrawalAssets.filter(asset => asset.symbol === 'ETH')[0];
  if (value !== 'ETH') {
    withdrawalSelected = withdrawalAssets.filter(asset => asset.symbol === value)[0];
  }
  dispatch({
    type: EXCHANGE_UPDATE_WITHDRAWAL_SELECTED,
    payload: { depositSelected, withdrawalSelected }
  });
  dispatch(exchangeUpdateExchangeRate());
};

export const exchangeUpdateDepositAmount = depositAmount => (dispatch, getState) => {
  let { withdrawalAmount, depositSelected, withdrawalSelected } = getState().exchange;
  depositAmount = depositAmount.replace(/[^0-9.]/g, '');
  apiShapeshiftGetQuotedPrice({
    depositSymbol: depositSelected.symbol,
    withdrawalSymbol: withdrawalSelected.symbol,
    depositAmount
  })
    .then(({ data }) => {
      const exchangeDetails = data.success;
      if (depositAmount) {
        withdrawalAmount = exchangeDetails.withdrawalAmount;
        withdrawalAmount = formatInputDecimals(withdrawalAmount, depositAmount);
      } else {
        withdrawalAmount = '';
      }
      if (withdrawalAmount && Number(withdrawalAmount) <= 0) {
        withdrawalAmount = '0';
      }
      dispatch({
        type: EXCHANGE_UPDATE_DEPOSIT_AMOUNT,
        payload: { exchangeDetails, depositAmount, withdrawalAmount }
      });
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: EXCHANGE_GET_MARKET_INFO_FAILURE });
    });
};

export const exchangeUpdateWithdrawalAmount = withdrawalAmount => (dispatch, getState) => {
  let { depositAmount, depositSelected, withdrawalSelected } = getState().exchange;
  withdrawalAmount = withdrawalAmount.replace(/[^0-9.]/g, '');
  apiShapeshiftGetQuotedPrice({
    depositSymbol: depositSelected.symbol,
    withdrawalSymbol: withdrawalSelected.symbol,
    withdrawalAmount
  })
    .then(({ data }) => {
      const exchangeDetails = data.success;
      if (withdrawalAmount) {
        depositAmount = exchangeDetails.depositAmount;
        depositAmount = formatInputDecimals(depositAmount, withdrawalAmount);
      } else {
        depositAmount = '';
      }
      if (depositAmount && Number(depositAmount) <= 0) {
        depositAmount = '0';
      }
      dispatch({
        type: EXCHANGE_UPDATE_WITHDRAWAL_AMOUNT,
        payload: { exchangeDetails, depositAmount, withdrawalAmount }
      });
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: EXCHANGE_GET_MARKET_INFO_FAILURE });
    });
};

export const exchangeMaxBalance = () => (dispatch, getState) => {
  const { depositSelected, gasPrice, exchangeDetails } = getState().exchange;
  const { accountInfo } = getState().account;
  let amount = '';
  if (depositSelected.symbol === 'ETH') {
    const ethereum = accountInfo.assets.filter(asset => asset.symbol === 'ETH')[0];
    const balanceAmount = ethereum.balance.amount;
    const txFeeAmount = gasPrice.txFee.value.amount;
    const remaining = convertStringToNumber(subtract(balanceAmount, txFeeAmount));
    amount = convertAmountFromBigNumber(remaining < 0 ? '0' : remaining);
  } else {
    amount = convertAmountFromBigNumber(depositSelected.balance.amount);
  }
  if (greaterThan(amount, exchangeDetails.maxLimit)) {
    amount = exchangeDetails.maxLimit;
  }
  dispatch(exchangeUpdateDepositAmount(amount));
};

export const exchangeTransaction = ({ address, recipient, amount, asset, gasPrice, gasLimit }) => (
  dispatch,
  getState
) => {
  dispatch({ type: EXCHANGE_TRANSACTION_REQUEST });
  const { accountType } = getState().account;
  const txDetails = {
    asset: asset,
    from: address,
    to: recipient,
    nonce: null,
    amount: amount,
    gasPrice: gasPrice.value.amount,
    gasLimit: gasLimit
  };
  web3SendTransactionMultiWallet(txDetails, accountType)
    .then(txHash => {
      txDetails.hash = txHash;
      dispatch(accountUpdateTransactions(txDetails));
      dispatch({
        type: EXCHANGE_TRANSACTION_SUCCESS,
        payload: txHash
      });
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: EXCHANGE_TRANSACTION_FAILURE });
    });
};

export const exchangeToggleConfirmationView = boolean => (dispatch, getState) => {
  let confirm = boolean;
  if (!confirm) {
    confirm = !getState().exchange.confirm;
  }
  dispatch({ type: EXCHANGE_TOGGLE_CONFIRMATION_VIEW, payload: confirm });
};

export const exchangeClearFields = () => ({ type: EXCHANGE_CLEAR_FIELDS });

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  fetching: false,
  fetchingRate: false,
  address: '',
  recipient: '',
  txHash: '',
  confirm: false,
  gasLimit: ethUnits.basic_tx,
  gasPrice: {},
  exchangeDetails: {},
  depositAssets: [],
  withdrawalAssets: [],
  depositSelected: { symbol: 'ETH', decimals: 18 },
  withdrawalSelected: { symbol: 'ZRX', decimals: 18 },
  depositAmount: '',
  withdrawalAmount: ''
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case EXCHANGE_GET_AVAILABLE_REQUEST:
      return {
        ...state,
        address: action.payload.address,
        depositSelected: action.payload.depositSelected,
        fetching: true
      };
    case EXCHANGE_GET_AVAILABLE_SUCCESS:
      return {
        ...state,
        fetching: false,
        withdrawalAssets: action.payload.withdrawalAssets,
        depositAssets: action.payload.depositAssets,
        withdrawalSelected: action.payload.withdrawalSelected
      };
    case EXCHANGE_GET_AVAILABLE_FAILURE:
      return {
        ...state,
        fetching: false,
        withdrawalAssets: []
      };
    case EXCHANGE_GET_GAS_PRICE_REQUEST:
      return {
        ...state,
        fetching: true
      };
    case EXCHANGE_GET_GAS_PRICE_SUCCESS:
      return {
        ...state,
        fetching: false,
        gasPrice: action.payload
      };
    case EXCHANGE_GET_GAS_PRICE_FAILURE:
      return {
        ...state,
        fetching: false
      };
    case EXCHANGE_GET_MARKET_INFO_SUCCESS:
      return {
        ...state,
        exchangeDetails: action.payload
      };
    case EXCHANGE_TOGGLE_CONFIRMATION_VIEW:
      return {
        ...state,
        confirm: action.payload
      };
    case EXCHANGE_TRANSACTION_REQUEST:
      return { ...state, fetching: true };
    case EXCHANGE_TRANSACTION_SUCCESS:
      return {
        ...state,
        fetching: false,
        txHash: action.payload
      };
    case EXCHANGE_TRANSACTION_FAILURE:
      return {
        ...state,
        fetching: false,
        txHash: '',
        confirm: false
      };
    case EXCHANGE_UPDATE_DEPOSIT_AMOUNT:
    case EXCHANGE_UPDATE_WITHDRAWAL_AMOUNT:
      return {
        ...state,
        exchangeDetails: action.payload.exchangeDetails,
        depositAmount: action.payload.depositAmount,
        withdrawalAmount: action.payload.withdrawalAmount
      };
    case EXCHANGE_UPDATE_DEPOSIT_SELECTED:
      return {
        ...state,
        depositSelected: action.payload.depositSelected,
        withdrawalSelected: action.payload.withdrawalSelected
      };
    case EXCHANGE_UPDATE_WITHDRAWAL_SELECTED:
      return {
        ...state,
        depositSelected: action.payload.depositSelected,
        withdrawalSelected: action.payload.withdrawalSelected
      };

    case EXCHANGE_CLEAR_FIELDS:
      return { ...state, ...INITIAL_STATE };
    default:
      return state;
  }
};
