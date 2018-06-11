import { combineReducers } from 'redux';
import exchange from './_exchange';
import send from './_send';
import account from './_account';
import dharma from './_dharma';
import modal from './_modal';
import ledger from './_ledger';
import metamask from './_metamask';
import walletconnect from './_walletconnect';
import notification from './_notification';
import warning from './_warning';

export default combineReducers({
  exchange,
  send,
  account,
  dharma,
  modal,
  ledger,
  metamask,
  notification,
  warning,
  walletconnect,
});
