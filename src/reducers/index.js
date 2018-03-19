import { combineReducers } from 'redux';
import send from './_send';
import account from './_account';
import modal from './_modal';
import notification from './_notification';
import warning from './_warning';

export default combineReducers({
  send,
  account,
  modal,
  notification,
  warning
});
