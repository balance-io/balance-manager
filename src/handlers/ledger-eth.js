import EthereumTx from 'ethereumjs-tx';
import TransportU2F from '@ledgerhq/hw-transport-u2f';
import AppEth from '@ledgerhq/hw-app-eth';
import ethereumNetworks from '../references/ethereum-networks.json';
import { removeHexPrefix, getDerivationPathComponents } from 'balance-common';

/**
 * @desc Ledger ETH App instance
 */
export let ledgerEthInstance = {
  path: "44'/60'/0'/0",
  length: 20,
  accounts: [],
  networkId: 1,
  getTransport: () => TransportU2F.create(),
  transport: null,
  eth: null,
};

/**
 * @desc init Ledger ETH App instance
 * @param  {String}  [network='mainnet']
 * @return {Object}
 */
export const ledgerEthInit = async (network = 'mainnet') => {
  try {
    const networkId = ethereumNetworks[network].id;
    const transport = await ledgerEthInstance.getTransport();
    const eth = new AppEth(transport);
    ledgerEthInstance.networkId = networkId;
    ledgerEthInstance.transport = transport;
    ledgerEthInstance.eth = eth;
    return ledgerEthInstance;
  } catch (error) {
    throw error;
  }
};

/**
 * @desc Ledger ETH App get accounts
 * @return {Array}
 */
export const ledgerEthAccounts = async () => {
  const transport = await ledgerEthInstance.getTransport();
  try {
    const accounts = [];
    const pathComponents = getDerivationPathComponents(ledgerEthInstance.path);
    for (let i = 0; i < ledgerEthInstance.length; i++) {
      const path = `${pathComponents.basePath}${pathComponents.index + i}`;
      const address = await ledgerEthInstance.eth.getAddress(path);
      address.path = path;
      accounts.push(address);
    }
    ledgerEthInstance.accounts = accounts;
    return accounts;
  } finally {
    transport.close();
  }
};

/**
 * @desc Ledget ETH App sign transaction
 * @param  {Object}  transaction { tokenObject, from, to, amount, gasPrice }
 * @return {String}
 */
export const ledgerEthSignTransaction = async transaction => {
  let accounts = ledgerEthInstance.accounts;
  if (!accounts.length) {
    accounts = await ledgerEthAccounts();
  }
  const account = accounts.filter(
    account => account.address.toLowerCase() === transaction.from.toLowerCase(),
  )[0];
  if (!account) throw new Error("address unknown '" + transaction.from + "'");
  const path = account.path;
  const transport = await ledgerEthInstance.getTransport();
  try {
    const tx = new EthereumTx(transaction);

    tx.raw[6] = Buffer.from([ledgerEthInstance.networkId]); // v
    tx.raw[7] = Buffer.from([]); // r
    tx.raw[8] = Buffer.from([]); // s
    const result = await ledgerEthInstance.eth.signTransaction(
      path,
      tx.serialize().toString('hex'),
    );

    tx.v = Buffer.from(result.v, 'hex');
    tx.r = Buffer.from(result.r, 'hex');
    tx.s = Buffer.from(result.s, 'hex');

    const signedChainId = Math.floor((tx.v[0] - 35) / 2);
    const validChainId = ledgerEthInstance.networkId & 0xff; // FIXME this is to fixed a current workaround that app don't support > 0xff
    if (signedChainId !== validChainId) {
      throw new Error(
        'Invalid ledgerEthInstance.networkId signature returned. Expected: ' +
          ledgerEthInstance.networkId +
          ', Got: ' +
          signedChainId,
      );
    }

    return `0x${tx.serialize().toString('hex')}`;
  } finally {
    transport.close();
  }
};

/**
 * @desc Ledget ETH App sign personal message
 * @param  {Object}  message
 * @return {String}
 */
export const signPersonalMessage = async message => {
  let accounts = ledgerEthInstance.accounts;
  if (!accounts.length) {
    accounts = await ledgerEthAccounts();
  }
  const account = accounts.filter(
    account => account.address.toLowerCase() === message.from.toLowerCase(),
  )[0];
  if (!account) throw new Error("address unknown '" + message.from + "'");
  const path = account.path;
  const transport = await ledgerEthInstance.getTransport();
  try {
    const result = await ledgerEthInstance.eth.signPersonalMessage(
      path,
      removeHexPrefix(message.data),
    );
    const v = parseInt(result.v, 10) - 27;
    let vHex = v.toString(16);
    if (vHex.length < 2) {
      vHex = `0${v}`;
    }
    return `0x${result.r}${result.s}${vHex}`;
  } finally {
    transport.close();
  }
};
