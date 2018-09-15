import WalletConnect from 'walletconnect';
import { commonStorage } from 'balance-common';

const dappName = 'Balance Manager';
// TODO change bridge url back
const bridgeUrl = 'https://bridge.walletconnect.org';

/**
 * @desc init WalletConnect webConnector instance
 * @return {Object}
 */
export const walletConnectGetSession = async () => {
  const webConnector = new WalletConnect({ bridgeUrl, dappName });
  const session = await webConnector.initSession();
  console.log('session', session);
  return { webConnector, session };
};

const walletConnectListenTransactionStatus = async (
  webConnector,
  transactionId,
) => {
  return new Promise((resolve, reject) => {
    webConnector.listenTransactionStatus(transactionId, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

/**
 * @desc WalletConnect sign transaction
 * @param  {Object}  transaction { from, to, data, value, gasPrice, gasLimit }
 * @return {String}
 */
export const walletConnectSignTransaction = async transaction => {
  const { webConnector, session } = await walletConnectGetSession();
  if (session.new) {
    throw new Error('WalletConnect session has expired. Please reconnect.');
  } else {
    const transactionId = await webConnector.createTransaction(transaction);
    const data = await walletConnectListenTransactionStatus(
      webConnector,
      transactionId.transactionId,
    );
    if (data) {
      const transactionSentSuccess = data.success;
      if (transactionSentSuccess) {
        const transactionHash = data.txHash;
        return transactionHash;
      } else {
        return null;
      }
    }
    return null;
  }
};
