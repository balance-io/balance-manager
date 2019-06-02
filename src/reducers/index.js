import { combineReducers } from 'redux';
import account from './_account';
import exchange from './_exchange';
import modal from './_modal';
import ledger from './_ledger';
import send from './_send';
import trezor from './_trezor';
import metamask from './_metamask';
import walletconnect from './_walletconnect';
import notification from './_notification';
import warning from './_warning';
import zrxinstant from './_zrxinstant';

export default combineReducers({
  exchange,
  send,
  account,
  modal,
  ledger,
  trezor,
  metamask,
  notification,
  warning,
  walletconnect,
  zrxinstant,
});
