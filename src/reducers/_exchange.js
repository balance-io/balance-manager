import { apiShapeshiftGetCoins, apiShapeshiftGetMarketInfo } from '../helpers/api';
import ethTokens from '../libraries/coinwoke-tokens.json';
import { parseError } from '../helpers/parsers';
import { notificationShow } from './_notification';

// -- Constants ------------------------------------------------------------- //

const EXCHANGE_GET_AVAILABLE_REQUEST = 'exchange/EXCHANGE_GET_AVAILABLE_REQUEST';
const EXCHANGE_GET_AVAILABLE_SUCCESS = 'exchange/EXCHANGE_GET_AVAILABLE_SUCCESS';
const EXCHANGE_GET_AVAILABLE_FAILURE = 'exchange/EXCHANGE_GET_AVAILABLE_FAILURE';

const EXCHANGE_GET_MARKET_INFO_REQUEST = 'exchange/EXCHANGE_GET_MARKET_INFO_REQUEST';
const EXCHANGE_GET_MARKET_INFO_SUCCESS = 'exchange/EXCHANGE_GET_MARKET_INFO_SUCCESS';
const EXCHANGE_GET_MARKET_INFO_FAILURE = 'exchange/EXCHANGE_GET_MARKET_INFO_FAILURE';

const EXCHANGE_TOGGLE_CONFIRMATION_VIEW = 'exchange/EXCHANGE_TOGGLE_CONFIRMATION_VIEW';

const EXCHANGE_UPDATE_NATIVE_AMOUNT = 'exchange/EXCHANGE_UPDATE_NATIVE_AMOUNT';

const EXCHANGE_UPDATE_CRYPTO_AMOUNT = 'exchange/EXCHANGE_UPDATE_CRYPTO_AMOUNT';
const EXCHANGE_UPDATE_DEPOSIT_SELECTED = 'exchange/EXCHANGE_UPDATE_DEPOSIT_SELECTED';
const EXCHANGE_UPDATE_WITHDRAWAL_SELECTED = 'exchange/EXCHANGE_UPDATE_WITHDRAWAL_SELECTED';

const EXCHANGE_CLEAR_FIELDS = 'exchange/EXCHANGE_CLEAR_FIELDS';

// -- Actions --------------------------------------------------------------- //

export const exchangeUpdateExchangeRate = () => (dispatch, getState) => {
  const { withdrawalSelected, depositSelected } = getState().exchange;
  const exchangePair = `${withdrawalSelected.symbol}_${depositSelected.symbol}`.toLowerCase();
  dispatch({ type: EXCHANGE_GET_MARKET_INFO_REQUEST });
  apiShapeshiftGetMarketInfo(exchangePair)
    .then(({ data }) => {
      dispatch({ type: EXCHANGE_GET_MARKET_INFO_SUCCESS, payload: data });
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: EXCHANGE_GET_MARKET_INFO_FAILURE });
    });
};

export const exchangeModalInit = (address, depositSelected) => (dispatch, getState) => {
  const { accountInfo } = getState().account;
  const depositSelected = accountInfo.assets.filter(asset => asset.symbol === 'ETH')[0];
  const address = accountInfo.address;

  dispatch({ type: EXCHANGE_GET_AVAILABLE_REQUEST, payload: { address, depositSelected } });
  apiShapeshiftGetCoins()
    .then(({ data }) => {
      const availableAssets = [{ name: 'Ethereum', symbol: 'ETH', image: null, imageSmall: null }];
      if (data) {
        Object.keys(data).forEach(key => {
          if (data[key].status === 'available' && ethTokens.indexOf(key) !== -1) {
            availableAssets.push(data[key]);
          }
        });
      }
      dispatch({
        type: EXCHANGE_GET_AVAILABLE_SUCCESS,
        payload: { availableAssets, withdrawalSelected: availableAssets[1] }
      });
      dispatch(exchangeUpdateExchangeRate());
    })
    .catch(error => {
      const message = parseError(error);
      dispatch(notificationShow(message, true));
      dispatch({ type: EXCHANGE_GET_AVAILABLE_FAILURE });
    });
};

export const exchangeUpdateDepositSelected = depositSelected => (dispatch, getState) => {
  dispatch({ type: EXCHANGE_UPDATE_DEPOSIT_SELECTED, payload: depositSelected });
  dispatch(exchangeUpdateExchangeRate());
};

export const exchangeUpdateWithdrawalSelected = withdrawalSelected => (dispatch, getState) => {
  dispatch({ type: EXCHANGE_UPDATE_WITHDRAWAL_SELECTED, payload: withdrawalSelected });
  dispatch(exchangeUpdateExchangeRate());
};

export const exchangeToggleConfirmationView = boolean => (dispatch, getState) => {
  let confirm = boolean;
  if (!confirm) {
    confirm = !getState().exchange.confirm;
  }
  dispatch({ type: EXCHANGE_TOGGLE_CONFIRMATION_VIEW, payload: confirm });
};

export const exchangeUpdateDepositAmount = depositAmount => (dispatch, getState) => {
  const { exchangeDetails } = getState().exchange;
  const withdrawalAmount = `${depositAmount / exchangeDetails.rate}`;
  dispatch({
    type: EXCHANGE_UPDATE_CRYPTO_AMOUNT,
    payload: { depositAmount, withdrawalAmount }
  });
};

export const exchangeUpdateWithdrawalAmount = withdrawalAmount => (dispatch, getState) => {
  const { exchangeDetails } = getState().exchange;
  const depositAmount = `${withdrawalAmount * exchangeDetails.rate}`;
  dispatch({
    type: EXCHANGE_UPDATE_CRYPTO_AMOUNT,
    payload: { depositAmount, withdrawalAmount }
  });
};

export const exchangeClearFields = () => ({ type: EXCHANGE_CLEAR_FIELDS });

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  fetching: false,
  address: '',
  recipient: '',
  availableAssets: [],
  exchangeDetails: {},
  txHash: '',
  confirm: false,
  depositSelected: { symbol: 'ETH' },
  withdrawalSelected: { symbol: 'ZRX' },
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
        availableAssets: action.payload.availableAssets,
        withdrawalSelected: action.payload.withdrawalSelected
      };
    case EXCHANGE_GET_AVAILABLE_FAILURE:
      return {
        ...state,
        fetching: false,
        availableAssets: []
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
    case EXCHANGE_UPDATE_NATIVE_AMOUNT:
    case EXCHANGE_UPDATE_CRYPTO_AMOUNT:
      return {
        ...state,
        depositAmount: action.payload.depositAmount,
        withdrawalAmount: action.payload.withdrawalAmount
      };
    case EXCHANGE_UPDATE_DEPOSIT_SELECTED:
      return { ...state, depositSelected: action.payload };
    case EXCHANGE_UPDATE_WITHDRAWAL_SELECTED:
      return { ...state, withdrawalSelected: action.payload };

    case EXCHANGE_CLEAR_FIELDS:
      return { ...state, ...INITIAL_STATE };
    default:
      return state;
  }
};
