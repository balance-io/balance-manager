import { apiGetGasPrices } from '../handlers/api';
import lang from '../languages';
import ethUnits from '../references/ethereum-units.json';
import {
  convertAmountFromBigNumber,
  convertAmountToBigNumber,
  convertAssetAmountFromNativeValue,
  convertAssetAmountToNativeValue,
  convertStringToNumber,
  formatInputDecimals,
  greaterThan,
  subtract,
} from '../helpers/bignumber';
import {
  parseError,
  parseGasPrices,
  parseGasPricesTxFee,
} from '../handlers/parsers';
import {
  web3SendTransactionMultiWallet,
  estimateGasLimit,
} from '../handlers/web3';
import { notificationShow } from './_notification';
import {
  accountUpdateTransactions,
  accountUpdateHasPendingTransaction,
} from './_account';

// -- Constants ------------------------------------------------------------- //

const SEND_GET_GAS_PRICES_REQUEST = 'send/SEND_GET_GAS_PRICES_REQUEST';
const SEND_GET_GAS_PRICES_SUCCESS = 'send/SEND_GET_GAS_PRICES_SUCCESS';
const SEND_GET_GAS_PRICES_FAILURE = 'send/SEND_GET_GAS_PRICES_FAILURE';

const SEND_UPDATE_GAS_PRICE_REQUEST = 'send/SEND_UPDATE_GAS_PRICE_REQUEST';
const SEND_UPDATE_GAS_PRICE_SUCCESS = 'send/SEND_UPDATE_GAS_PRICE_SUCCESS';
const SEND_UPDATE_GAS_PRICE_FAILURE = 'send/SEND_UPDATE_GAS_PRICE_FAILURE';

const SEND_TRANSACTION_REQUEST = 'send/SEND_TRANSACTION_REQUEST';
const SEND_TRANSACTION_SUCCESS = 'send/SEND_TRANSACTION_SUCCESS';
const SEND_TRANSACTION_FAILURE = 'send/SEND_TRANSACTION_FAILURE';

const SEND_TOGGLE_CONFIRMATION_VIEW = 'send/SEND_TOGGLE_CONFIRMATION_VIEW';

const SEND_UPDATE_NATIVE_AMOUNT = 'send/SEND_UPDATE_NATIVE_AMOUNT';

const SEND_UPDATE_RECIPIENT = 'send/SEND_UPDATE_RECIPIENT';
const SEND_UPDATE_ASSET_AMOUNT = 'send/SEND_UPDATE_ASSET_AMOUNT';
const SEND_UPDATE_SELECTED = 'send/SEND_UPDATE_SELECTED';
const SEND_UPDATE_HAS_PENDING_TRANSACTION =
  'send/SEND_UPDATE_HAS_PENDING_TRANSACTION';

const SEND_CLEAR_FIELDS = 'send/SEND_CLEAR_FIELDS';

// -- Actions --------------------------------------------------------------- //

export const sendModalInit = () => (dispatch, getState) => {
  const { accountAddress, accountInfo, prices } = getState().account;
  const { gasLimit } = getState().send;
  const selected = accountInfo.assets.filter(
    asset => asset.symbol === 'ETH',
  )[0];
  const fallbackGasPrices = parseGasPrices(null, prices, gasLimit);
  dispatch({
    type: SEND_GET_GAS_PRICES_REQUEST,
    payload: {
      address: accountAddress,
      selected,
      gasPrices: fallbackGasPrices,
    },
  });
  apiGetGasPrices()
    .then(({ data }) => {
      const gasPrices = parseGasPrices(data, prices, gasLimit);
      dispatch({
        type: SEND_GET_GAS_PRICES_SUCCESS,
        payload: gasPrices,
      });
    })
    .catch(error => {
      console.error(error);

      dispatch({
        type: SEND_GET_GAS_PRICES_FAILURE,
        payload: fallbackGasPrices,
      });
    });
};

export const sendUpdateGasPrice = newGasPriceOption => (dispatch, getState) => {
  const {
    selected,
    address,
    recipient,
    assetAmount,
    gasPrice,
    gasPriceOption,
    fetchingGasPrices,
  } = getState().send;
  if (fetchingGasPrices) return;
  let gasPrices = getState().send.gasPrices;
  if (!Object.keys(gasPrices).length) return null;
  const _gasPriceOption = newGasPriceOption || gasPriceOption;
  const _gasPrice = gasPriceOption ? gasPrices[_gasPriceOption] : gasPrice;
  dispatch({ type: SEND_UPDATE_GAS_PRICE_REQUEST });
  estimateGasLimit({
    asset: selected,
    address,
    recipient,
    amount: assetAmount,
  })
    .then(gasLimit => {
      const { prices } = getState().account;
      gasPrices = parseGasPricesTxFee(gasPrices, prices, gasLimit);
      dispatch({
        type: SEND_UPDATE_GAS_PRICE_SUCCESS,
        payload: {
          gasLimit,
          gasPrice: _gasPrice,
          gasPriceOption: _gasPriceOption,
          gasPrices,
        },
      });
    })
    .catch(error => {
      const message = parseError(error);
      if (assetAmount) {
        const requestedAmount = convertAmountToBigNumber(`${assetAmount}`);
        const availableBalance = selected.balance.amount;
        if (greaterThan(requestedAmount, availableBalance)) {
          dispatch(
            notificationShow(
              lang.t('notification.error.insufficient_balance'),
              true,
            ),
          );
        }
      } else {
        dispatch(
          notificationShow(
            message || lang.t('notification.error.failed_get_tx_fee'),
            true,
          ),
        );
      }
      dispatch({
        type: SEND_UPDATE_GAS_PRICE_FAILURE,
        payload: {
          gasPrice: _gasPrice,
          gasPriceOption: _gasPriceOption,
          gasPrices: gasPrices,
        },
      });
    });
};

export const sendAllTransactions = () => (dispatch, getState) => {
  dispatch({ type: SEND_TRANSACTION_REQUEST });
  const { address, recipient, gasPrice, gasLimit } = getState().send;
  const { accountType, accountInfo } = getState().account;

  accountInfo.assets.forEach(asset => {
    const txDetails = {
      asset: asset,
      from: address,
      to: recipient,
      nonce: null,
      amount: convertAmountFromBigNumber(asset.balance.amount),
      gasPrice: gasPrice.value.amount,
      gasLimit: gasLimit,
    };

    web3SendTransactionMultiWallet(txDetails, accountType)
      .then(txHash => {
        // has pending transactions set to true for redirect to Transactions route
        dispatch(accountUpdateHasPendingTransaction());
        txDetails.hash = txHash;
        dispatch(accountUpdateTransactions(txDetails));
        dispatch({
          type: SEND_TRANSACTION_SUCCESS,
          payload: txHash,
        });
      })
      .catch(error => {
        const message = parseError(error);
        dispatch(notificationShow(message, true));
        dispatch({ type: SEND_TRANSACTION_FAILURE });
      });
  });
};

export const sendTransaction = () => (dispatch, getState) => {
  dispatch({ type: SEND_TRANSACTION_REQUEST });
  const {
    address,
    recipient,
    assetAmount,
    selected,
    gasPrice,
    gasLimit,
  } = getState().send;
  const { accountType } = getState().account;
  const txDetails = {
    asset: selected,
    from: address,
    to: recipient,
    nonce: null,
    amount: assetAmount,
    gasPrice: gasPrice.value.amount,
    gasLimit: gasLimit,
  };
  web3SendTransactionMultiWallet(txDetails, accountType)
    .then(txHash => {
      // has pending transactions set to true for redirect to Transactions route
      dispatch(accountUpdateHasPendingTransaction());
      txDetails.hash = txHash;
      dispatch(accountUpdateTransactions(txDetails));
      dispatch({
        type: SEND_TRANSACTION_SUCCESS,
        payload: txHash,
      });
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: SEND_TRANSACTION_FAILURE });
    });
};

export const sendToggleConfirmationView = boolean => (dispatch, getState) => {
  let confirm = boolean;
  if (!confirm) {
    confirm = !getState().send.confirm;
  }
  dispatch({ type: SEND_TOGGLE_CONFIRMATION_VIEW, payload: confirm });
};

export const sendUpdateRecipient = recipient => dispatch => {
  const input = recipient.replace(/[^\w.]/g, '');
  if (input.length <= 42) {
    dispatch({
      type: SEND_UPDATE_RECIPIENT,
      payload: input,
    });
  }
};

export const sendUpdateAssetAmount = assetAmount => (dispatch, getState) => {
  const { prices, nativeCurrency } = getState().account;
  const { selected } = getState().send;
  const _assetAmount = assetAmount.replace(/[^0-9.]/g, '');
  let _nativeAmount = '';
  if (_assetAmount.length && prices[nativeCurrency][selected.symbol]) {
    const nativeAmount = convertAssetAmountToNativeValue(
      _assetAmount,
      selected,
      prices,
    );
    _nativeAmount = formatInputDecimals(nativeAmount, _assetAmount);
  }
  dispatch({
    type: SEND_UPDATE_ASSET_AMOUNT,
    payload: { assetAmount: _assetAmount, nativeAmount: _nativeAmount },
  });
};

export const sendUpdateNativeAmount = nativeAmount => (dispatch, getState) => {
  const { prices, nativeCurrency } = getState().account;
  const { selected } = getState().send;
  const _nativeAmount = nativeAmount.replace(/[^0-9.]/g, '');
  let _assetAmount = '';
  if (_nativeAmount.length && prices[nativeCurrency][selected.symbol]) {
    const assetAmount = convertAssetAmountFromNativeValue(
      _nativeAmount,
      selected,
      prices,
    );
    _assetAmount = formatInputDecimals(assetAmount, _nativeAmount);
  }
  dispatch({
    type: SEND_UPDATE_ASSET_AMOUNT,
    payload: { assetAmount: _assetAmount, nativeAmount: _nativeAmount },
  });
};

export const sendUpdateSelected = value => (dispatch, getState) => {
  const { prices, nativeCurrency, accountInfo } = getState().account;
  const { assetAmount } = getState().send;
  let selected = accountInfo.assets.filter(asset => asset.symbol === 'ETH')[0];
  if (value !== 'ETH') {
    selected = accountInfo.assets.filter(asset => asset.symbol === value)[0];
  }
  dispatch({ type: SEND_UPDATE_SELECTED, payload: selected });
  dispatch(sendUpdateGasPrice());
  if (prices[nativeCurrency] && prices[nativeCurrency][selected.symbol]) {
    dispatch(sendUpdateAssetAmount(assetAmount));
  }
};

export const sendMaxBalance = () => (dispatch, getState) => {
  const { selected, gasPrice } = getState().send;
  const { accountInfo } = getState().account;
  let amount = '';
  if (selected.symbol === 'ETH') {
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
    amount = convertAmountFromBigNumber(selected.balance.amount);
  }
  dispatch(sendUpdateAssetAmount(amount));
};

export const sendClearFields = () => ({ type: SEND_CLEAR_FIELDS });

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  fetchingGasPrices: false,
  gasPrice: {},
  gasPrices: {},
  gasLimit: ethUnits.basic_tx,
  gasPriceOption: 'average',
  fetching: false,
  address: '',
  recipient: '',
  nativeAmount: '',
  assetAmount: '',
  txHash: '',
  confirm: false,
  selected: { symbol: 'ETH' },
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SEND_GET_GAS_PRICES_REQUEST:
      return {
        ...state,
        fetchingGasPrices: true,
        address: action.payload.address,
        selected: action.payload.selected,
        gasPrice: action.payload.gasPrices.average,
        gasPrices: action.payload.gasPrices,
        gasPriceOption: action.payload.gasPrices.average.option,
      };
    case SEND_GET_GAS_PRICES_SUCCESS:
      return {
        ...state,
        fetchingGasPrices: false,
        gasPrice: action.payload.average,
        gasPrices: action.payload,
        gasPriceOption: action.payload.average.option,
      };
    case SEND_GET_GAS_PRICES_FAILURE:
      return {
        ...state,
        fetchingGasPrices: false,
        gasPrice: action.payload.average,
        gasPrices: action.payload,
        gasPriceOption: action.payload.average.option,
      };
    case SEND_UPDATE_GAS_PRICE_REQUEST:
      return { ...state, fetchingGasPrices: true };
    case SEND_UPDATE_GAS_PRICE_SUCCESS:
      return {
        ...state,
        fetchingGasPrices: false,
        gasLimit: action.payload.gasLimit,
        gasPrice: action.payload.gasPrice,
        gasPrices: action.payload.gasPrices,
        gasPriceOption: action.payload.gasPriceOption,
      };

    case SEND_UPDATE_GAS_PRICE_FAILURE:
      return {
        ...state,
        fetchingGasPrices: false,
        gasPrice: action.payload.gasPrice,
        gasPrices: action.payload.gasPrices,
        gasPriceOption: action.payload.gasPriceOption,
      };
    case SEND_TRANSACTION_REQUEST:
      return { ...state, fetching: true };
    case SEND_TRANSACTION_SUCCESS:
      return {
        ...state,
        fetching: false,
        gasPrices: {},
        txHash: action.payload,
      };
    case SEND_TRANSACTION_FAILURE:
      return {
        ...state,
        fetching: false,
        txHash: '',
        confirm: false,
      };
    case SEND_UPDATE_HAS_PENDING_TRANSACTION:
      return { ...state, hasPendingTransaction: action.payload };
    case SEND_TOGGLE_CONFIRMATION_VIEW:
      return {
        ...state,
        confirm: action.payload,
      };
    case SEND_UPDATE_RECIPIENT:
      return { ...state, recipient: action.payload };
    case SEND_UPDATE_NATIVE_AMOUNT:
    case SEND_UPDATE_ASSET_AMOUNT:
      return {
        ...state,
        assetAmount: action.payload.assetAmount,
        nativeAmount: action.payload.nativeAmount,
      };
    case SEND_UPDATE_SELECTED:
      return { ...state, selected: action.payload };
    case SEND_CLEAR_FIELDS:
      return { ...state, ...INITIAL_STATE };
    default:
      return state;
  }
};
