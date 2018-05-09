import { apiShapeshiftGetCoins, apiShapeshiftGetMarketInfo } from '../handlers/api';
import ethTokens from '../references/coinwoke-tokens.json';
import { parseError } from '../handlers/parsers';
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

const EXCHANGE_UPDATE_ASSET_AMOUNT = 'exchange/EXCHANGE_UPDATE_ASSET_AMOUNT';
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

export const exchangeModalInit = () => (dispatch, getState) => {
  const { accountAddress, accountInfo } = getState().account;
  const depositSelected = accountInfo.assets.filter(asset => asset.symbol === 'ETH')[0];
  dispatch({
    type: EXCHANGE_GET_AVAILABLE_REQUEST,
    payload: { address: accountAddress, depositSelected }
  });
  apiShapeshiftGetCoins()
    .then(({ data }) => {
      const withdrawalAssets = [{ name: 'Ethereum', symbol: 'ETH', image: null, imageSmall: null }];
      if (data) {
        Object.keys(data).forEach(key => {
          if (data[key].status === 'available' && ethTokens.indexOf(key) !== -1) {
            withdrawalAssets.push(data[key]);
          }
        });
      }
      const availableSymbols = withdrawalAssets.map(availableAsset => availableAsset.symbol);
      const depositAssets = accountInfo.assets.filter(
        asset => availableSymbols.indexOf(asset.symbol) !== -1
      );

      dispatch({
        type: EXCHANGE_GET_AVAILABLE_SUCCESS,
        payload: { withdrawalAssets, depositAssets, withdrawalSelected: withdrawalAssets[1] }
      });
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
    type: EXCHANGE_UPDATE_ASSET_AMOUNT,
    payload: { depositAmount, withdrawalAmount }
  });
};

export const exchangeUpdateWithdrawalAmount = withdrawalAmount => (dispatch, getState) => {
  const { exchangeDetails } = getState().exchange;
  const depositAmount = `${withdrawalAmount * exchangeDetails.rate}`;
  dispatch({
    type: EXCHANGE_UPDATE_ASSET_AMOUNT,
    payload: { depositAmount, withdrawalAmount }
  });
};

export const exchangeClearFields = () => ({ type: EXCHANGE_CLEAR_FIELDS });

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  fetching: false,
  address: '',
  recipient: '',
  exchangeDetails: {},
  txHash: '',
  confirm: false,
  depositAssets: [],
  withdrawalAssets: [],
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
    case EXCHANGE_UPDATE_ASSET_AMOUNT:
      return {
        ...state,
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
