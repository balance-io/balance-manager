import { combineReducers } from 'redux';
import exchange from './_exchange';
import send from './_send';
import account from './_account';
import modal from './_modal';
import ledger from './_ledger';
import trezor from './_trezor';
import elph from './_elph';
import metamask from './_metamask';
import walletconnect from './_walletconnect';
import notification from './_notification';
import warning from './_warning';

export default combineReducers({
  exchange,
  send,
  account,
  modal,
  ledger,
  trezor,
  elph,
  metamask,
  notification,
  warning,
  walletconnect,
});
