import { lang } from 'balance-common';

// -- Constants ------------------------------------------------------------- //
const WARNING_PARSE = 'warning/WARNING_PARSE';
const WARNING_SHOW = 'warning/WARNING_SHOW';
const WARNING_HIDE = 'warning/WARNING_HIDE';
const WARNING_CLEAR = 'warning/WARNING_CLEAR';

const WARNING_USER_IS_OFFLINE = 'warning/WARNING_USER_IS_OFFLINE';
const WARNING_USER_IS_ONLINE = 'warning/WARNING_USER_IS_ONLINE';

// -- Actions --------------------------------------------------------------- //

export const warningShow = warning => (dispatch, getState) => {
  dispatch({ type: WARNING_PARSE });
  const warnings = getState().warning.active;
  const isActive = warnings.filter(
    activeWarning => activeWarning.key === warning.key,
  ).length;
  if (!isActive) {
    warnings.push(warning);
  }
  dispatch({ type: WARNING_SHOW, payload: warnings });
};

export const warningHide = key => (dispatch, getState) => {
  dispatch({ type: WARNING_PARSE });
  const warnings = getState().warning.active;
  const newWarnings = warnings.filter(warning => warning.key !== key);
  dispatch({ type: WARNING_SHOW, payload: newWarnings });
};

export const warningOffline = () => dispatch => {
  dispatch({ type: WARNING_USER_IS_OFFLINE });
  dispatch(
    warningShow({
      key: 'USER_IS_OFFLINE',
      color: 'red',
      message: lang.t('warning.user_is_offline'),
      action: () => {},
    }),
  );
};

let timeoutHide;

export const warningOnline = () => dispatch => {
  dispatch({ type: WARNING_USER_IS_ONLINE });
  clearTimeout(timeoutHide);
  dispatch(warningHide('USER_IS_OFFLINE'));
  dispatch(
    warningShow({
      key: 'USER_IS_ONLINE',
      color: 'green',
      message: lang.t('warning.user_is_online'),
      action: () => {},
    }),
  );
  timeoutHide = setTimeout(() => dispatch(warningHide('USER_IS_ONLINE')), 3000);
};

export const warningClear = () => dispatch => dispatch({ type: WARNING_CLEAR });

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  online: true,
  show: true,
  active: [],
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case WARNING_USER_IS_OFFLINE:
      return {
        ...state,
        online: false,
      };
    case WARNING_USER_IS_ONLINE:
      return {
        ...state,
        online: true,
      };
    case WARNING_PARSE:
      return {
        ...state,
        show: false,
      };
    case WARNING_SHOW:
    case WARNING_HIDE:
      return {
        ...state,
        show: true,
        active: action.payload,
      };
    case WARNING_CLEAR:
      return { ...state, show: false, active: [] };
    default:
      return state;
  }
};
