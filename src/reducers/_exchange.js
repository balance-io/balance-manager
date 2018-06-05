import {
  apiShapeshiftGetCurrencies,
  apiShapeshiftSendAmount,
  apiShapeshiftGetExchangeDetails,
  apiGetGasPrices,
  apiGetSinglePrice,
} from '../handlers/api';
import { parseError, parseGasPrices } from '../handlers/parsers';
import { web3SendTransactionMultiWallet } from '../handlers/web3';
import {
  divide,
  multiply,
  subtract,
  greaterThan,
  greaterThanOrEqual,
  convertAmountFromBigNumber,
  convertStringToNumber,
  convertAmountToBigNumber,
  convertAmountToDisplay,
} from '../helpers/bignumber';
import { notificationShow } from './_notification';
import { accountUpdateExchange } from './_account';
import ethUnits from '../references/ethereum-units.json';

// -- Constants ------------------------------------------------------------- //

const EXCHANGE_GET_AVAILABLE_REQUEST =
  'exchange/EXCHANGE_GET_AVAILABLE_REQUEST';
const EXCHANGE_GET_AVAILABLE_SUCCESS =
  'exchange/EXCHANGE_GET_AVAILABLE_SUCCESS';
const EXCHANGE_GET_AVAILABLE_FAILURE =
  'exchange/EXCHANGE_GET_AVAILABLE_FAILURE';

const EXCHANGE_GET_GAS_PRICE_REQUEST =
  'exchange/EXCHANGE_GET_GAS_PRICE_REQUEST';
const EXCHANGE_GET_GAS_PRICE_SUCCESS =
  'exchange/EXCHANGE_GET_GAS_PRICE_SUCCESS';
const EXCHANGE_GET_GAS_PRICE_FAILURE =
  'exchange/EXCHANGE_GET_GAS_PRICE_FAILURE';

const EXCHANGE_TRANSACTION_REQUEST = 'exchange/EXCHANGE_TRANSACTION_REQUEST';
const EXCHANGE_TRANSACTION_SUCCESS = 'exchange/EXCHANGE_TRANSACTION_SUCCESS';
const EXCHANGE_TRANSACTION_FAILURE = 'exchange/EXCHANGE_TRANSACTION_FAILURE';

const EXCHANGE_CONFIRM_TRANSACTION_REQUEST =
  'exchange/EXCHANGE_CONFIRM_TRANSACTION_REQUEST';
const EXCHANGE_CONFIRM_TRANSACTION_SUCCESS =
  'exchange/EXCHANGE_CONFIRM_TRANSACTION_SUCCESS';
const EXCHANGE_CONFIRM_TRANSACTION_FAILURE =
  'exchange/EXCHANGE_CONFIRM_TRANSACTION_FAILURE';

const EXCHANGE_UPDATE_DEPOSIT_AMOUNT_REQUEST =
  'exchange/EXCHANGE_UPDATE_DEPOSIT_AMOUNT_REQUEST';
const EXCHANGE_UPDATE_DEPOSIT_AMOUNT_SUCCESS =
  'exchange/EXCHANGE_UPDATE_DEPOSIT_AMOUNT_SUCCESS';
const EXCHANGE_UPDATE_DEPOSIT_AMOUNT_FAILURE =
  'exchange/EXCHANGE_UPDATE_DEPOSIT_AMOUNT_FAILURE';

const EXCHANGE_UPDATE_WITHDRAWAL_AMOUNT_REQUEST =
  'exchange/EXCHANGE_UPDATE_WITHDRAWAL_AMOUNT_REQUEST';
const EXCHANGE_UPDATE_WITHDRAWAL_AMOUNT_SUCCESS =
  'exchange/EXCHANGE_UPDATE_WITHDRAWAL_AMOUNT_SUCCESS';
const EXCHANGE_UPDATE_WITHDRAWAL_AMOUNT_FAILURE =
  'exchange/EXCHANGE_UPDATE_WITHDRAWAL_AMOUNT_FAILURE';

const EXCHANGE_GET_WITHDRAWAL_PRICE_REQUEST =
  'exchange/EXCHANGE_GET_WITHDRAWAL_PRICE_REQUEST';
const EXCHANGE_GET_WITHDRAWAL_PRICE_SUCCESS =
  'exchange/EXCHANGE_GET_WITHDRAWAL_PRICE_SUCCESS';
const EXCHANGE_GET_WITHDRAWAL_PRICE_FAILURE =
  'exchange/EXCHANGE_GET_WITHDRAWAL_PRICE_FAILURE';

const EXCHANGE_UPDATE_DEPOSIT_SELECTED =
  'exchange/EXCHANGE_UPDATE_DEPOSIT_SELECTED';
const EXCHANGE_UPDATE_WITHDRAWAL_SELECTED =
  'exchange/EXCHANGE_UPDATE_WITHDRAWAL_SELECTED';

const EXCHANGE_UPDATE_WITHDRAWAL_NATIVE =
  'exchange/EXCHANGE_UPDATE_WITHDRAWAL_NATIVE';

const EXCHANGE_UPDATE_COUNTDOWN = 'exchange/EXCHANGE_UPDATE_COUNTDOWN';

const EXCHANGE_TOGGLE_CONFIRMATION_VIEW =
  'exchange/EXCHANGE_TOGGLE_CONFIRMATION_VIEW';

const EXCHANGE_TOGGLE_WITHDRAWAL_NATIVE =
  'exchange/EXCHANGE_TOGGLE_WITHDRAWAL_NATIVE';

const EXCHANGE_UPDATE_EXCHANGE_DETAILS =
  'exchange/EXCHANGE_UPDATE_EXCHANGE_DETAILS';

const EXCHANGE_CLEAR_FIELDS = 'exchange/EXCHANGE_CLEAR_FIELDS';

// -- Actions --------------------------------------------------------------- //

let getExchangeDetailsTimeout = null;

export const exchangeGetGasPrices = () => (dispatch, getState) => {
  const { prices } = getState().account;
  const { gasLimit } = getState().exchange;
  dispatch({ type: EXCHANGE_GET_GAS_PRICE_REQUEST });
  apiGetGasPrices()
    .then(({ data }) => {
      const gasPrices = parseGasPrices(data, prices, gasLimit);
      const gasPrice = gasPrices.fast;
      dispatch({ type: EXCHANGE_GET_GAS_PRICE_SUCCESS, payload: gasPrice });
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: EXCHANGE_GET_GAS_PRICE_FAILURE });
    });
};

export const exchangeGetWithdrawalPrice = () => (dispatch, getState) => {
  const { withdrawalSelected } = getState().exchange;
  const { prices } = getState().account;
  dispatch({ type: EXCHANGE_GET_WITHDRAWAL_PRICE_REQUEST });
  const nativeSelected = prices.selected.currency;
  const withdrawalSymbol = withdrawalSelected.symbol;
  apiGetSinglePrice(withdrawalSymbol, nativeSelected)
    .then(({ data }) => {
      const amount = convertAmountToBigNumber(data[nativeSelected]);
      const display = convertAmountToDisplay(amount, prices);
      const withdrawalPrice = { amount, display };
      dispatch({
        type: EXCHANGE_GET_WITHDRAWAL_PRICE_SUCCESS,
        payload: withdrawalPrice,
      });
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: EXCHANGE_GET_WITHDRAWAL_PRICE_FAILURE });
    });
};

export const exchangeUpdateDepositSelected = value => (dispatch, getState) => {
  const {
    withdrawalAssets,
    depositAssets,
    depositAmount,
    withdrawalAmount,
    priorityInput,
  } = getState().exchange;
  let { withdrawalSelected, depositSelected } = getState().exchange;
  if (value === withdrawalSelected.symbol) {
    withdrawalSelected = withdrawalAssets.filter(
      asset => asset.symbol === depositSelected.symbol,
    )[0];
    if (!withdrawalSelected) {
      withdrawalSelected = withdrawalAssets.filter(
        asset => asset.symbol !== value,
      )[0];
    }
  }
  depositSelected = depositAssets.filter(asset => asset.symbol === 'ETH')[0];
  if (value !== 'ETH') {
    depositSelected = depositAssets.filter(asset => asset.symbol === value)[0];
  }
  dispatch({
    type: EXCHANGE_UPDATE_DEPOSIT_SELECTED,
    payload: { depositSelected, withdrawalSelected },
  });
  if (priorityInput === 'DEPOSIT') {
    dispatch(exchangeUpdateDepositAmount(depositAmount, false));
  } else {
    dispatch(exchangeUpdateWithdrawalAmount(withdrawalAmount, false));
  }
};

export const exchangeUpdateWithdrawalSelected = value => (
  dispatch,
  getState,
) => {
  const {
    withdrawalAssets,
    depositAssets,
    depositAmount,
    withdrawalAmount,
    priorityInput,
  } = getState().exchange;
  let { withdrawalSelected, depositSelected } = getState().exchange;
  if (value === depositSelected.symbol) {
    depositSelected = depositAssets.filter(
      asset => asset.symbol === withdrawalSelected.symbol,
    )[0];
    if (!depositSelected) {
      depositSelected = depositAssets.filter(
        asset => asset.symbol !== value,
      )[0];
    }
  }
  withdrawalSelected = withdrawalAssets.filter(
    asset => asset.symbol === 'ETH',
  )[0];
  if (value !== 'ETH') {
    withdrawalSelected = withdrawalAssets.filter(
      asset => asset.symbol === value,
    )[0];
  }
  dispatch({
    type: EXCHANGE_UPDATE_WITHDRAWAL_SELECTED,
    payload: { depositSelected, withdrawalSelected },
  });
  dispatch(exchangeGetWithdrawalPrice());
  if (priorityInput === 'DEPOSIT') {
    dispatch(exchangeUpdateDepositAmount(depositAmount, false));
  } else {
    dispatch(exchangeUpdateWithdrawalAmount(withdrawalAmount, false));
  }
};

export const exchangeUpdateDepositAmount = (
  depositAmount = '',
  timeout = false,
) => (dispatch, getState) => {
  let {
    withdrawalAmount,
    withdrawalNative,
    depositSelected,
    withdrawalSelected,
    withdrawalPrice,
  } = getState().exchange;
  const parsedDepositAmount = parseFloat(depositAmount);
  if (!parsedDepositAmount || parsedDepositAmount <= 0) {
    withdrawalAmount = '';
  }
  withdrawalNative = withdrawalAmount ? withdrawalNative : '';
  dispatch({
    type: EXCHANGE_UPDATE_DEPOSIT_AMOUNT_REQUEST,
    payload: { depositAmount, withdrawalAmount, withdrawalNative },
  });
  const getExchangeDetailsPromise = timeoutEnabled => {
    if (parsedDepositAmount && parsedDepositAmount > 0 && !timeoutEnabled) {
      apiShapeshiftGetExchangeDetails({
        request: {
          depositSymbol: depositSelected.symbol,
          withdrawalSymbol: withdrawalSelected.symbol,
          depositAmount,
        },
        inputOne: depositAmount,
        inputTwo: withdrawalAmount,
        withdrawal: false,
      })
        .then(result => {
          if (!result.exchangeDetails) {
            result.exchangeDetails = getState().exchange.exchangeDetails;
          }
          const withdrawalNative = result.withdrawalAmount
            ? multiply(
                result.withdrawalAmount,
                convertAmountFromBigNumber(withdrawalPrice.amount),
              )
            : '';
          result.withdrawalNative = withdrawalNative;
          dispatch({
            type: EXCHANGE_UPDATE_DEPOSIT_AMOUNT_SUCCESS,
            payload: result,
          });
        })
        .catch(error => {
          const message = parseError(error);
          dispatch(notificationShow(message, true));
          dispatch({ type: EXCHANGE_UPDATE_DEPOSIT_AMOUNT_FAILURE });
        });
    } else {
      dispatch({
        type: EXCHANGE_UPDATE_DEPOSIT_AMOUNT_SUCCESS,
        payload: {
          exchangeDetails: getState().exchange.exchangeDetails,
          withdrawalAmount: '',
        },
      });
    }
  };
  clearInterval(getExchangeDetailsTimeout);
  if (timeout) {
    getExchangeDetailsTimeout = setTimeout(
      () => getExchangeDetailsPromise(timeout),
      300,
    );
  } else {
    getExchangeDetailsPromise(timeout);
  }
};

export const exchangeUpdateWithdrawalAmount = (
  withdrawalAmount = '',
  timeout = false,
  disableNative = false,
) => (dispatch, getState) => {
  let {
    depositAmount,
    depositSelected,
    withdrawalSelected,
    withdrawalPrice,
    withdrawalNative,
  } = getState().exchange;
  const parsedWithdrawalAmount = parseFloat(withdrawalAmount);
  if (!parsedWithdrawalAmount || parsedWithdrawalAmount <= 0) {
    depositAmount = '';
  }
  withdrawalNative = disableNative
    ? withdrawalNative
    : withdrawalAmount
      ? multiply(
          withdrawalAmount,
          convertAmountFromBigNumber(withdrawalPrice.amount),
        )
      : '';
  dispatch({
    type: EXCHANGE_UPDATE_WITHDRAWAL_AMOUNT_REQUEST,
    payload: {
      fetchingRate: !!withdrawalAmount,
      withdrawalAmount,
      withdrawalNative,
      depositAmount,
    },
  });
  const getExchangeDetailsPromise = timeoutEnabled => {
    if (
      parsedWithdrawalAmount &&
      parsedWithdrawalAmount > 0 &&
      !timeoutEnabled
    ) {
      apiShapeshiftGetExchangeDetails({
        request: {
          depositSymbol: depositSelected.symbol,
          withdrawalSymbol: withdrawalSelected.symbol,
          withdrawalAmount,
        },
        inputOne: withdrawalAmount,
        inputTwo: depositAmount,
        withdrawal: true,
      })
        .then(result => {
          if (!result.exchangeDetails) {
            result.exchangeDetails = getState().exchange.exchangeDetails;
          }
          dispatch({
            type: EXCHANGE_UPDATE_WITHDRAWAL_AMOUNT_SUCCESS,
            payload: result,
          });
        })
        .catch(error => {
          const message = parseError(error);
          dispatch(notificationShow(message, true));
          dispatch({ type: EXCHANGE_UPDATE_WITHDRAWAL_AMOUNT_FAILURE });
        });
    } else {
      dispatch({
        type: EXCHANGE_UPDATE_WITHDRAWAL_AMOUNT_SUCCESS,
        payload: {
          exchangeDetails: getState().exchange.exchangeDetails,
          depositAmount: '',
        },
      });
    }
  };
  clearInterval(getExchangeDetailsTimeout);
  if (timeout) {
    getExchangeDetailsTimeout = setTimeout(
      () => getExchangeDetailsPromise(timeout),
      300,
    );
  } else {
    getExchangeDetailsPromise(timeout);
  }
};

export const exchangeUpdateWithdrawalNative = withdrawalNative => (
  dispatch,
  getState,
) => {
  const { withdrawalPrice } = getState().exchange;
  const withdrawalAmount = divide(
    withdrawalNative,
    convertAmountFromBigNumber(withdrawalPrice.amount),
  );
  dispatch({
    type: EXCHANGE_UPDATE_WITHDRAWAL_NATIVE,
    payload: { withdrawalNative, withdrawalAmount },
  });
  dispatch(exchangeUpdateWithdrawalAmount(withdrawalAmount, false, true));
};

export const exchangeMaxBalance = () => (dispatch, getState) => {
  const { depositSelected, gasPrice, exchangeDetails } = getState().exchange;
  const { accountInfo } = getState().account;
  let amount = '';
  if (depositSelected.symbol === 'ETH') {
    const ethereum = accountInfo.assets.filter(
      asset => asset.symbol === 'ETH',
    )[0];
    const balanceAmount = ethereum.balance.amount;
    const txFeeAmount = gasPrice.txFee.value.amount;
    const remaining = convertStringToNumber(
      subtract(balanceAmount, txFeeAmount),
    );
    amount = convertAmountFromBigNumber(remaining < 0 ? '0' : remaining);
  } else {
    amount = convertAmountFromBigNumber(depositSelected.balance.amount);
  }
  if (greaterThan(amount, exchangeDetails.maxLimit)) {
    amount = exchangeDetails.maxLimit;
  }
  dispatch(exchangeUpdateDepositAmount(amount));
};

export const exchangeModalInit = () => (dispatch, getState) => {
  const {
    accountAddress,
    accountInfo,
    shapeshiftAvailable,
  } = getState().account;
  if (!shapeshiftAvailable) return;
  const depositSelected = accountInfo.assets.filter(
    asset => asset.symbol === 'ETH',
  )[0];
  dispatch({
    type: EXCHANGE_GET_AVAILABLE_REQUEST,
    payload: { address: accountAddress, depositSelected },
  });
  apiShapeshiftGetCurrencies()
    .then(({ data }) => {
      const withdrawalAssets = data;
      const availableSymbols = withdrawalAssets.map(
        availableAsset => availableAsset.symbol,
      );
      const depositAssets = accountInfo.assets.filter(
        asset => availableSymbols.indexOf(asset.symbol) !== -1,
      );
      dispatch({
        type: EXCHANGE_GET_AVAILABLE_SUCCESS,
        payload: {
          withdrawalAssets,
          depositAssets,
          withdrawalSelected: withdrawalAssets[1],
        },
      });
      dispatch(exchangeGetGasPrices());
      dispatch(exchangeGetWithdrawalPrice());
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: EXCHANGE_GET_AVAILABLE_FAILURE });
    });
};

export const exchangeSendTransaction = () => (dispatch, getState) => {
  const {
    address,
    recipient,
    depositAmount,
    depositSelected,
    withdrawalAmount,
    withdrawalSelected,
    gasPrice,
    gasLimit,
  } = getState().exchange;
  dispatch({ type: EXCHANGE_TRANSACTION_REQUEST });
  const { accountType } = getState().account;
  const txDetails = {
    asset: depositSelected,
    from: address,
    to: recipient,
    nonce: null,
    amount: depositAmount,
    gasPrice: gasPrice.value.amount,
    gasLimit: gasLimit,
  };
  web3SendTransactionMultiWallet(txDetails, accountType)
    .then(txHash => {
      txDetails.hash = txHash;
      const incomingTx = {
        hash: `shapeshift_${recipient}`,
        asset: withdrawalSelected,
        nonce: null,
        from: '',
        to: address,
        amount: withdrawalAmount,
        value: withdrawalAmount,
        gasPrice: '',
        gasLimit: '',
      };
      console.log('about to exchange incoming', incomingTx);
      dispatch(accountUpdateExchange([txDetails, incomingTx]));
      dispatch({
        type: EXCHANGE_TRANSACTION_SUCCESS,
        payload: txHash,
      });
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: EXCHANGE_TRANSACTION_FAILURE });
    });
};

export const exchangeToggleConfirmationView = () => ({
  type: EXCHANGE_TOGGLE_CONFIRMATION_VIEW,
});

let countdownTimeout = null;

export const exchangeUpdateCountdown = () => (dispatch, getState) => {
  const { confirm, exchangeDetails } = getState().exchange;
  clearTimeout(countdownTimeout);
  const countdown = subtract(exchangeDetails.expiration, Date.now());
  if (confirm) {
    setTimeout(() => dispatch(exchangeUpdateCountdown()), 1000); // 1sec
    if (greaterThanOrEqual(countdown, 1000)) {
      dispatch({ type: EXCHANGE_UPDATE_COUNTDOWN, payload: countdown });
    } else {
      dispatch(exchangeToggleConfirmationView());
    }
  }
};

export const exchangeConfirmTransaction = request => (dispatch, getState) => {
  const {
    address,
    priorityInput,
    depositAmount,
    withdrawalAmount,
    depositSelected,
    withdrawalSelected,
  } = getState().exchange;
  let request = {
    address,
    depositSymbol: depositSelected.symbol,
    withdrawalSymbol: withdrawalSelected.symbol,
  };
  if (priorityInput === 'DEPOSIT') {
    request.depositAmount = depositAmount;
  } else if (priorityInput === 'WITHDRAWAL') {
    request.withdrawalAmount = withdrawalAmount;
  }
  dispatch({ type: EXCHANGE_CONFIRM_TRANSACTION_REQUEST });
  apiShapeshiftSendAmount(request)
    .then(({ data }) => {
      if (data.success) {
        const exchangeDetails = data.success;
        const recipient = exchangeDetails.deposit;
        const withdrawalAmount = exchangeDetails.withdrawalAmount;
        const depositAmount = exchangeDetails.depositAmount;
        dispatch({
          type: EXCHANGE_CONFIRM_TRANSACTION_SUCCESS,
          payload: {
            exchangeDetails,
            recipient,
            withdrawalAmount,
            depositAmount,
          },
        });
        dispatch(exchangeSendTransaction());
        dispatch(exchangeUpdateCountdown());
      }
    })
    .catch(error => {
      dispatch({ type: EXCHANGE_CONFIRM_TRANSACTION_FAILURE });
    });
};

export const exchangeUpdateExchangeDetails = exchangeDetails => ({
  type: EXCHANGE_UPDATE_EXCHANGE_DETAILS,
  payload: exchangeDetails,
});

export const exchangeToggleWithdrawalNative = bool => (dispatch, getState) => {
  let {
    showWithdrawalNative,
    withdrawalNative,
    withdrawalAmount,
  } = getState().exchange;
  showWithdrawalNative =
    typeof bool !== 'undefined' ? bool : !showWithdrawalNative;
  const withdrawalInput = showWithdrawalNative
    ? withdrawalNative
    : withdrawalAmount;
  dispatch({
    type: EXCHANGE_TOGGLE_WITHDRAWAL_NATIVE,
    payload: { showWithdrawalNative, withdrawalInput },
  });
};

export const exchangeClearFields = () => (dispatch, getState) => {
  dispatch({ type: EXCHANGE_CLEAR_FIELDS });
  const { shapeshiftAvailable } = getState().account;
  if (!shapeshiftAvailable) return;
  apiShapeshiftSendAmount({
    depositSymbol: 'ETH',
    withdrawalSymbol: 'BNT',
    withdrawalAmount: '0.5',
  })
    .then(({ data }) => {
      dispatch(exchangeUpdateExchangeDetails(data.success));
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
    });
};

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  fetching: false,
  fetchingRate: false,
  fetchingFinal: false,
  address: '',
  recipient: '',
  txHash: '',
  confirm: false,
  gasLimit: ethUnits.basic_tx,
  gasPrice: {},
  countdown: '',
  exchangeDetails: {},
  priorityInput: 'DEPOSIT',
  depositAssets: [],
  withdrawalAssets: [],
  depositSelected: { symbol: 'ETH', decimals: 18 },
  withdrawalSelected: { symbol: 'ZRX', decimals: 18 },
  depositAmount: '',
  withdrawalAmount: '',
  withdrawalNative: '',
  showWithdrawalNative: false,
  withdrawalInput: '',
  withdrawalPrice: { amount: '', display: '' },
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case EXCHANGE_GET_AVAILABLE_REQUEST:
      return {
        ...state,
        address: action.payload.address,
        depositSelected: action.payload.depositSelected,
        fetching: true,
      };
    case EXCHANGE_GET_AVAILABLE_SUCCESS:
      return {
        ...state,
        fetching: false,
        withdrawalAssets: action.payload.withdrawalAssets,
        depositAssets: action.payload.depositAssets,
        withdrawalSelected: action.payload.withdrawalSelected,
      };
    case EXCHANGE_GET_AVAILABLE_FAILURE:
      return {
        ...state,
        fetching: false,
        withdrawalAssets: [],
      };
    case EXCHANGE_GET_GAS_PRICE_REQUEST:
      return {
        ...state,
        fetching: true,
      };
    case EXCHANGE_GET_GAS_PRICE_SUCCESS:
      return {
        ...state,
        fetching: false,
        gasPrice: action.payload,
      };
    case EXCHANGE_GET_GAS_PRICE_FAILURE:
      return {
        ...state,
        fetching: false,
      };
    case EXCHANGE_GET_WITHDRAWAL_PRICE_SUCCESS:
      return {
        ...state,
        withdrawalPrice: action.payload,
      };
    case EXCHANGE_CONFIRM_TRANSACTION_REQUEST:
      return {
        ...state,
        fetching: true,
      };
    case EXCHANGE_CONFIRM_TRANSACTION_SUCCESS:
      return {
        ...state,
        confirm: true,
        fetching: false,
        exchangeDetails: action.payload.exchangeDetails,
        recipient: action.payload.recipient,
        withdrawalAmount: action.payload.withdrawalAmount,
        depositAmount: action.payload.depositAmount,
      };
    case EXCHANGE_CONFIRM_TRANSACTION_FAILURE:
      return {
        ...state,
        fetching: false,
        confirm: false,
      };
    case EXCHANGE_TRANSACTION_SUCCESS:
      return {
        ...state,
        txHash: action.payload,
      };
    case EXCHANGE_TRANSACTION_FAILURE:
      return {
        ...state,
        fetching: false,
        txHash: '',
        confirm: false,
      };
    case EXCHANGE_UPDATE_DEPOSIT_AMOUNT_REQUEST:
      return {
        ...state,
        priorityInput: 'DEPOSIT',
        fetchingRate: true,
        depositAmount: action.payload.depositAmount,
        withdrawalAmount: action.payload.withdrawalAmount,
        withdrawalNative: action.payload.withdrawalNative,
        withdrawalInput: state.showWithdrawalNative
          ? action.payload.withdrawalNative
          : action.payload.withdrawalAmount,
      };
    case EXCHANGE_UPDATE_WITHDRAWAL_AMOUNT_REQUEST:
      return {
        ...state,
        priorityInput: 'WITHDRAWAL',
        fetchingRate: action.payload.fetchingRate,
        depositAmount: action.payload.depositAmount,
        withdrawalAmount: action.payload.withdrawalAmount,
        withdrawalNative: action.payload.withdrawalNative,
        withdrawalInput: state.showWithdrawalNative
          ? action.payload.withdrawalNative
          : action.payload.withdrawalAmount,
      };
    case EXCHANGE_UPDATE_DEPOSIT_AMOUNT_SUCCESS:
      return {
        ...state,
        fetchingRate: false,
        exchangeDetails: action.payload.exchangeDetails,
        withdrawalAmount: action.payload.withdrawalAmount,
        withdrawalNative: action.payload.withdrawalNative,
        withdrawalInput: state.showWithdrawalNative
          ? action.payload.withdrawalNative
          : action.payload.withdrawalAmount,
      };
    case EXCHANGE_UPDATE_WITHDRAWAL_AMOUNT_SUCCESS:
      return {
        ...state,
        fetchingRate: false,
        exchangeDetails: action.payload.exchangeDetails,
        depositAmount: action.payload.depositAmount,
      };
    case EXCHANGE_UPDATE_DEPOSIT_AMOUNT_FAILURE:
      return { ...state, fetchingRate: false };
    case EXCHANGE_UPDATE_WITHDRAWAL_AMOUNT_FAILURE:
      return { ...state, fetchingRate: false };
    case EXCHANGE_UPDATE_DEPOSIT_SELECTED:
      return {
        ...state,
        depositSelected: action.payload.depositSelected,
        withdrawalSelected: action.payload.withdrawalSelected,
      };
    case EXCHANGE_UPDATE_WITHDRAWAL_SELECTED:
      return {
        ...state,
        depositSelected: action.payload.depositSelected,
        withdrawalSelected: action.payload.withdrawalSelected,
      };
    case EXCHANGE_UPDATE_EXCHANGE_DETAILS:
      return {
        ...state,
        exchangeDetails: action.payload,
      };
    case EXCHANGE_UPDATE_COUNTDOWN:
      return { ...state, countdown: action.payload };
    case EXCHANGE_TOGGLE_CONFIRMATION_VIEW:
      return { ...state, countdown: '', confirm: !state.confirm };
    case EXCHANGE_UPDATE_WITHDRAWAL_NATIVE:
      return {
        ...state,
        withdrawalAmount: action.payload.withdrawalAmount,
        withdrawalNative: action.payload.withdrawalNative,
        withdrawalInput: state.showWithdrawalNative
          ? action.payload.withdrawalNative
          : action.payload.withdrawalAmount,
      };
    case EXCHANGE_TOGGLE_WITHDRAWAL_NATIVE:
      return {
        ...state,
        showWithdrawalNative: action.payload.showWithdrawalNative,
        withdrawalInput: action.payload.withdrawalInput,
      };
    case EXCHANGE_CLEAR_FIELDS:
      return { ...state, ...INITIAL_STATE };
    default:
      return state;
  }
};
