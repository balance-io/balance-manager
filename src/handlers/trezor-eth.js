import EthereumTx from 'ethereumjs-tx';
import ethereumNetworks from '../references/ethereum-networks.json';
import { lang } from 'balance-common';

const HDKey = require('ethereumjs-wallet/hdkey');

export let trezorEthInstance = {
  length: 10,
  accounts: [],
  networkId: 1,
  basePath: `m/44'/60'/0'/0`,
  hdkey: '',
};

export const trezorEthInit = (network = 'mainnet') => {
  const networkId = ethereumNetworks[network].id;
  const basePath = `m/44'/${networkId === 1 ? '60' : '1'}'/0'/0`;
  return new Promise((resolve, reject) => {
    window.TrezorConnect.getXPubKey(basePath, response => {
      if (response.success) {
        trezorEthInstance.networkId = networkId;
        trezorEthInstance.hdkey = HDKey.fromExtendedKey(response.xpubkey);
        trezorEthInstance.basePath = basePath;
        resolve(trezorEthInstance);
      } else {
        reject(response.error);
      }
    });
  });
};

export const trezorEthAccounts = () => {
  let accounts = [];
  for (let i = 0; i < trezorEthInstance.length; i++) {
    let account = {};
    const childKey = trezorEthInstance.hdkey.deriveChild(i);
    const wallet = childKey.getWallet();
    const address = wallet.getAddressString();
    account.address = address;
    account.path = `${trezorEthInstance.basePath}/${i}`;
    accounts.push(account);
  }
  trezorEthInstance.accounts = accounts;
  return Promise.resolve(accounts);
};

export const trezorEthSignTransaction = async tx => {
  const account = trezorEthInstance.accounts.filter(
    account => account.address.toLowerCase() === tx.from,
  )[0];
  const { r, s, v } = await new Promise(resolve =>
    window.TrezorConnect.ethereumSignTx(
      account.path,
      ...[tx.nonce, tx.gasPrice, tx.gasLimit, tx.to, tx.value, tx.data].map(
        hex => {
          const cleaned = hex.replace('0x', '').toLowerCase();
          return cleaned.length % 2 !== 0 ? `0${cleaned}` : cleaned;
        },
      ),
      trezorEthInstance.networkId,
      resolve,
    ),
  );

  try {
    const str = `0x${new EthereumTx({
      ...tx,
      r: `0x${r}`,
      s: `0x${s}`,
      v: `0x${v.toString(16)}`,
    })
      .serialize()
      .toString('hex')}`;
    return str;
  } catch (error) {
    throw new Error(lang.t('message.failed_trezor_popup_blocked'));
  }
};
