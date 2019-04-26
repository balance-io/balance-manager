import { combineReducers } from 'redux';
import exchange from './_exchange';
import modal from './_modal';
import ledger from './_ledger';
import trezor from './_trezor';
import metamask from './_metamask';
import walletconnect from './_walletconnect';
import notification from './_notification';
import warning from './_warning';
import zrxinstant from './_zrxinstant';
import { settings, assets, prices, transactions, send } from 'balance-common';

export default combineReducers({
  exchange,
  send,
  settings,
  assets,
  prices,
  transactions,
  modal,
  ledger,
  trezor,
  metamask,
  notification,
  warning,
  walletconnect,
  zrxinstant,
});
