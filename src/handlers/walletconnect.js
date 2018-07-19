import WalletConnect from 'walletconnect';
import {
  getWalletConnectWebConnector,
  saveWalletConnectWebConnector,
} from './localstorage';

const dappName = 'Balance Manager';
const bridgeUrl = 'https://walletconnect.balance.io';

/**
 * @desc init WalletConnect webConnector instance
 * @return {Object}
 */
export const walletConnectInit = async () => {
  const webConnector = new WalletConnect({ bridgeUrl, dappName });
  const session = await webConnector.createSession();
  saveWalletConnectWebConnector({
    bridgeUrl,
    dappName,
    sessionId: session.sessionId,
    sharedKey: session.sharedKey,
  });
  return { bridgeUrl, webConnector };
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
  const webConnectorOptions = getWalletConnectWebConnector();
  const webConnector = new WalletConnect(webConnectorOptions);
  // TODO try catch
  try {
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
  } catch (error) {}
};
