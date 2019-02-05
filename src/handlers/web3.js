import Web3 from 'web3';
import { ledgerEthSignTransaction } from './ledger-eth';
import piwik from '../piwik';
import { trezorEthSignTransaction } from './trezor-eth';
import { walletConnectSendTransaction } from './walletconnect';

/**
 * @desc web3 http instance
 */
export const web3Instance = new Web3(
  new Web3.providers.HttpProvider(`https://mainnet.infura.io/`),
);

/**
 * @desc send signed transaction
 * @param  {String}  signedTx
 * @return {Promise}
 */
export const web3SendSignedTransaction = signedTx =>
  new Promise((resolve, reject) => {
    const serializedTx = typeof signedTx === 'string' ? signedTx : signedTx.raw;
    web3Instance.eth
      .sendSignedTransaction(serializedTx)
      .once('transactionHash', txHash => resolve(txHash))
      .catch(error => reject(error));
  });

/**
 * @desc metamask send transaction
 * @param  {Object}  transaction { from, to, value, data, gasPrice}
 * @return {Promise}
 */
export const web3MetamaskSendTransaction = txDetails =>
  new Promise((resolve, reject) => {
    if (typeof window.web3 !== 'undefined') {
      window.web3.eth.sendTransaction(txDetails, (err, txHash) => {
        if (err) {
          reject(err);
        }
        resolve(txHash);
      });
    } else {
      throw new Error(`Metamask is not present`);
    }
  });

/**
 * @desc walletconnect send transaction
 * @param  {Object}  transaction { from, to, value, data, gasPrice}
 * @return {Promise}
 */
export const web3WalletConnectSendTransaction = txDetails =>
  new Promise((resolve, reject) => {
    walletConnectSendTransaction(txDetails)
      .then(txHash => {
        resolve(txHash);
      })
      .catch(error => {
        reject(error);
      });
  });

/**
 * @desc ledger send transaction
 * @param  {Object}  transaction { from, to, value, data, gasPrice}
 * @return {Promise}
 */
export const web3LedgerSendTransaction = txDetails =>
  new Promise((resolve, reject) => {
    ledgerEthSignTransaction(txDetails)
      .then(signedTx =>
        web3SendSignedTransaction(signedTx)
          .then(txHash => resolve(txHash))
          .catch(error => reject(error)),
      )
      .catch(error => reject(error));
  });

export const web3TrezorSendTransaction = txDetails =>
  new Promise((resolve, reject) => {
    trezorEthSignTransaction(txDetails)
      .then(signedTx =>
        web3SendSignedTransaction(signedTx)
          .then(txHash => resolve(txHash))
          .catch(error => reject(error)),
      )
      .catch(error => reject(error));
  });

/**
 * @desc send transaction controller given asset transfered and account type
 * @param {Object} transaction { asset, from, to, amount, gasPrice }
 * @return {Promise}
 */
export const web3SendTransactionMultiWallet = ({
  accountType,
  tracking,
  transaction,
}) => {
  piwik.push([
    'trackEvent',
    'Send',
    accountType,
    tracking.name,
    tracking.amount,
  ]);
  let method = null;
  switch (accountType) {
    case 'METAMASK':
      method = web3MetamaskSendTransaction;
      break;
    case 'LEDGER':
      method = web3LedgerSendTransaction;
      break;
    case 'TREZOR':
      method = web3TrezorSendTransaction;
      break;
    case 'WALLETCONNECT':
      method = web3WalletConnectSendTransaction;
      break;
    default:
      method = web3MetamaskSendTransaction;
      break;
  }
  return method(transaction);
};
