import { combineReducers } from 'redux';
import send from './_send';
import account from './_account';
import modal from './_modal';
import metamask from './_metamask';
import walletconnect from './_walletconnect';
import notification from './_notification';
import warning from './_warning';

export default combineReducers({
  send,
  account,
  modal,
  metamask,
  notification,
  warning,
  walletconnect
});
