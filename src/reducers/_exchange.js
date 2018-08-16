import {
  apiGetGasPrices,
  apiGetSinglePrice,
  apiShapeshiftGetMarketInfo,
  apiShapeshiftGetCurrencies,
  apiShapeshiftSendAmount,
  apiShapeshiftGetExchangeDetails,
  estimateGasLimit,
  parseError,
  parseGasPrices,
} from 'balance-common';
import { web3SendTransactionMultiWallet } from '../handlers/web3';
import {
  convertAmountFromBigNumber,
  convertStringToNumber,
  convertAmountToBigNumber,
  convertAmountToDisplay,
  divide,
  greaterThan,
  greaterThanOrEqual,
  multiply,
  subtract,
} from 'balance-common';
import { notificationShow } from './_notification';
import {
  accountUpdateExchange,
  accountUpdateHasPendingTransaction,
} from 'balance-common';
import ethUnits from '../references/ethereum-units.json';

// -- Constants ------------------------------------------------------------- //

const EXCHANGE_GET_AVAILABLE_REQUEST =
  'exchange/EXCHANGE_GET_AVAILABLE_REQUEST';
const EXCHANGE_GET_AVAILABLE_SUCCESS =
  'exchange/EXCHANGE_GET_AVAILABLE_SUCCESS';
const EXCHANGE_GET_AVAILABLE_FAILURE =
  'exchange/EXCHANGE_GET_AVAILABLE_FAILURE';

const EXCHANGE_UPDATE_GAS_LIMIT_REQUEST =
  'exchange/EXCHANGE_UPDATE_GAS_LIMIT_REQUEST';
const EXCHANGE_UPDATE_GAS_LIMIT_SUCCESS =
  'exchange/EXCHANGE_UPDATE_GAS_LIMIT_SUCCESS';
const EXCHANGE_UPDATE_GAS_LIMIT_FAILURE =
  'exchange/EXCHANGE_UPDATE_GAS_LIMIT_FAILURE';

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

const EXCHANGE_UPDATE_WITHDRAWAL_NATIVE =
  'exchange/EXCHANGE_UPDATE_WITHDRAWAL_NATIVE';

const EXCHANGE_UPDATE_COUNTDOWN = 'exchange/EXCHANGE_UPDATE_COUNTDOWN';

const EXCHANGE_TOGGLE_CONFIRMATION_VIEW =
  'exchange/EXCHANGE_TOGGLE_CONFIRMATION_VIEW';

const EXCHANGE_TOGGLE_WITHDRAWAL_NATIVE =
  'exchange/EXCHANGE_TOGGLE_WITHDRAWAL_NATIVE';

const EXCHANGE_UPDATE_EXCHANGE_DETAILS =
  'exchange/EXCHANGE_UPDATE_EXCHANGE_DETAILS';

const EXCHANGE_UPDATE_MIN_MAX_LIMITS =
  'exchange/EXCHANGE_UPDATE_MIN_MAX_LIMITS';

const EXCHANGE_UPDATE_SELECTED = 'exchange/EXCHANGE_UPDATE_SELECTED';

const EXCHANGE_CLEAR_FIELDS = 'exchange/EXCHANGE_CLEAR_FIELDS';

// -- Actions --------------------------------------------------------------- //

export const exchangeGetGasPrices = () => (dispatch, getState) => {
  const { prices } = getState().account;
  const { gasLimit } = getState().exchange;
  dispatch({ type: EXCHANGE_GET_GAS_PRICE_REQUEST });
  apiGetGasPrices()
    .then(({ data }) => {
      console.log('get gas prices', data);
      const gasPrices = parseGasPrices(data, prices, gasLimit);
      console.log('parsed gas prices', gasPrices);
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
  return apiGetSinglePrice(withdrawalSymbol, nativeSelected)
    .then(({ data }) => {
      const amount = convertAmountToBigNumber(data[nativeSelected]);
      const display = convertAmountToDisplay(amount, prices);
      const withdrawalPrice = { amount, display };
      dispatch({
        type: EXCHANGE_GET_WITHDRAWAL_PRICE_SUCCESS,
        payload: withdrawalPrice,
      });
      return withdrawalPrice;
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: EXCHANGE_GET_WITHDRAWAL_PRICE_FAILURE });
      const { withdrawalPrice } = getState().exchange;
      return withdrawalPrice;
    });
};

export const exchangeUpdateGasLimit = depositSelected => (
  dispatch,
  getState,
) => {
  const { address, recipient, depositAmount } = getState().exchange;
  dispatch({ type: EXCHANGE_UPDATE_GAS_LIMIT_REQUEST });
  estimateGasLimit({
    asset: depositSelected,
    address,
    recipient,
    amount: depositAmount,
  })
    .then(gasLimit => {
      console.log('>>>> gas limit', gasLimit);
      dispatch({
        type: EXCHANGE_UPDATE_GAS_LIMIT_SUCCESS,
        payload: gasLimit,
      });
    })
    .catch(error => {
      dispatch({ type: EXCHANGE_UPDATE_GAS_LIMIT_FAILURE });
    });
};

export const exchangeUpdateMinMaxLimits = (
  depositSelected,
  withdrawalSelected,
) => (dispatch, getState) => {
  let { exchangeDetails } = getState().exchange;
  const pair = `${depositSelected.symbol.toLowerCase()}_${withdrawalSelected.symbol.toLowerCase()}`;
  return apiShapeshiftGetMarketInfo(pair)
    .then(marketInfo => {
      exchangeDetails.min = marketInfo.data.minimum;
      exchangeDetails.maxLimit = marketInfo.data.maxLimit;
      exchangeDetails.pair = marketInfo.data.pair.toLowerCase();
      exchangeDetails.quotedRate = marketInfo.data.rate;
      exchangeDetails.minerFee = marketInfo.data.minerFee;
      dispatch({
        type: EXCHANGE_UPDATE_MIN_MAX_LIMITS,
        payload: { exchangeDetails },
      });
      return exchangeDetails;
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({
        type: EXCHANGE_UPDATE_MIN_MAX_LIMITS,
        payload: { exchangeDetails },
      });
      return exchangeDetails;
    });
};

export const exchangeUpdateDepositSelected = value => (dispatch, getState) => {
  const {
    withdrawalAssets,
    depositAssets,
    depositAmount,
    withdrawalAmount,
    withdrawalPrice,
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
    type: EXCHANGE_UPDATE_SELECTED,
    payload: { depositSelected, withdrawalSelected },
  });

  dispatch(exchangeUpdateGasLimit(depositSelected));
  dispatch(
    exchangeUpdateMinMaxLimits(depositSelected, withdrawalSelected),
  ).then(exchangeDetails => {
    if (priorityInput === 'DEPOSIT') {
      dispatch(
        exchangeUpdateDepositAmount(
          depositAmount,
          depositSelected,
          withdrawalSelected,
          exchangeDetails,
        ),
      );
    } else {
      dispatch(
        exchangeUpdateWithdrawalAmount(
          withdrawalAmount,
          depositSelected,
          withdrawalSelected,
          withdrawalPrice,
        ),
      );
    }
  });
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
    type: EXCHANGE_UPDATE_SELECTED,
    payload: { depositSelected, withdrawalSelected },
  });
  dispatch(
    exchangeUpdateMinMaxLimits(depositSelected, withdrawalSelected),
  ).then(exchangeDetails => {
    dispatch(exchangeGetWithdrawalPrice()).then(withdrawalPrice => {
      if (priorityInput === 'DEPOSIT') {
        dispatch(
          exchangeUpdateDepositAmount(
            depositAmount,
            depositSelected,
            withdrawalSelected,
            exchangeDetails,
          ),
        );
      } else {
        dispatch(
          exchangeUpdateWithdrawalAmount(
            withdrawalAmount,
            depositSelected,
            withdrawalSelected,
            withdrawalPrice,
          ),
        );
      }
    });
  });
};

export const exchangeUpdateDepositAmount = (
  depositAmount = '',
  depositSelected = null,
  withdrawalSelected = null,
  exchangeDetails = null,
) => (dispatch, getState) => {
  let {
    withdrawalAmount,
    withdrawalNative,
    withdrawalPrice,
  } = getState().exchange;
  depositSelected = depositSelected || getState().exchange.depositSelected;
  withdrawalSelected =
    withdrawalSelected || getState().exchange.withdrawalSelected;
  exchangeDetails = exchangeDetails || getState().exchange.exchangeDetails;
  const parsedDepositAmount = parseFloat(depositAmount);
  if (
    !parsedDepositAmount ||
    parsedDepositAmount < exchangeDetails.min ||
    parsedDepositAmount > exchangeDetails.maxLimit
  ) {
    withdrawalAmount = '';
  }
  withdrawalNative = withdrawalAmount ? withdrawalNative : '';
  dispatch({
    type: EXCHANGE_UPDATE_DEPOSIT_AMOUNT_REQUEST,
    payload: { depositAmount, withdrawalAmount, withdrawalNative },
  });
  if (
    parsedDepositAmount &&
    parsedDepositAmount >= exchangeDetails.min &&
    parsedDepositAmount <= exchangeDetails.maxLimit
  ) {
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

export const exchangeUpdateWithdrawalAmount = (
  withdrawalAmount = '',
  depositSelected = null,
  withdrawalSelected = null,
  withdrawalPrice = null,
  disableNative = false,
) => (dispatch, getState) => {
  let { depositAmount, withdrawalNative } = getState().exchange;
  depositSelected = depositSelected || getState().exchange.depositSelected;
  withdrawalSelected =
    withdrawalSelected || getState().exchange.withdrawalSelected;
  withdrawalPrice = withdrawalPrice || getState().exchange.withdrawalPrice;

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
  if (parsedWithdrawalAmount && parsedWithdrawalAmount > 0) {
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

export const exchangeUpdateWithdrawalNative = withdrawalNative => (
  dispatch,
  getState,
) => {
  const {
    depositSelected,
    withdrawalSelected,
    withdrawalPrice,
  } = getState().exchange;
  const withdrawalAmount = divide(
    withdrawalNative,
    convertAmountFromBigNumber(withdrawalPrice.amount),
  );
  dispatch({
    type: EXCHANGE_UPDATE_WITHDRAWAL_NATIVE,
    payload: { withdrawalNative, withdrawalAmount },
  });
  dispatch(
    exchangeUpdateWithdrawalAmount(
      withdrawalAmount,
      depositSelected,
      withdrawalSelected,
      withdrawalPrice,
      true,
    ),
  );
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
      const withdrawalSelected = withdrawalAssets[0];
      dispatch({
        type: EXCHANGE_GET_AVAILABLE_SUCCESS,
        payload: {
          withdrawalAssets,
          depositAssets,
          withdrawalSelected,
        },
      });

      dispatch(exchangeGetGasPrices());
      dispatch(exchangeGetWithdrawalPrice());

      apiShapeshiftSendAmount({
        depositSymbol: depositSelected.symbol,
        withdrawalSymbol: withdrawalSelected.symbol,
        withdrawalAmount: '0.5',
      })
        .then(({ data }) => {
          dispatch(exchangeUpdateExchangeDetails(data.success));
        })
        .catch(error => {
          const message = parseError(error);
          dispatch(notificationShow(message, true));
        });
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
      // has pending transactions set to true for redirect to Transactions route
      dispatch(accountUpdateHasPendingTransaction());
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
    case EXCHANGE_UPDATE_GAS_LIMIT_SUCCESS:
      return {
        ...state,
        gasLimit: action.payload,
      };
    case EXCHANGE_UPDATE_SELECTED:
      return {
        ...state,
        depositSelected: action.payload.depositSelected,
        withdrawalSelected: action.payload.withdrawalSelected,
      };
    case EXCHANGE_UPDATE_MIN_MAX_LIMITS:
      return {
        ...state,
        exchangeDetails: action.payload.exchangeDetails,
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
