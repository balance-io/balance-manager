// -- Constants ------------------------------------------------------------- //
const NOTIFICATION_SHOW = 'notification/NOTIFICATION_SHOW';
const NOTIFICATION_HIDE = 'notification/NOTIFICATION_HIDE';

// -- Actions --------------------------------------------------------------- //
let timeoutHide;

export const notificationShow = (message, error = false) => dispatch => {
  clearTimeout(timeoutHide);
  dispatch({ type: NOTIFICATION_SHOW, payload: { message, error } });
  timeoutHide = setTimeout(() => dispatch({ type: NOTIFICATION_HIDE }), 15000);
};

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  show: false,
  error: false,
  message: '',
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case NOTIFICATION_SHOW:
      return {
        ...state,
        show: true,
        message: action.payload.message,
        error: action.payload.error,
      };
    case NOTIFICATION_HIDE:
      return { ...state, show: false, message: '', error: false };
    default:
      return state;
  }
};
