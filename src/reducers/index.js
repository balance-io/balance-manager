import { combineReducers } from 'redux';
import send from './_send';
import accounts from './_accounts';
import modal from './_modal';
import notification from './_notification';
import warning from './_warning';

export default combineReducers({
  send,
  accounts,
  modal,
  notification,
  warning
});
