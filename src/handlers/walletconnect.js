import WalletConnect from 'walletconnect';
import { commonStorage } from 'balance-common';

const dappName = 'Balance Manager';
const bridgeUrl = 'https://walletconnect.balance.io';

/**
 * @desc init WalletConnect webConnector instance
 * @return {Object}
 */
export const walletConnectNewSession = async () => {
  const webConnector = new WalletConnect({ bridgeUrl, dappName });
  await webConnector.initSession();
  return webConnector;
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
  const webConnectorOptions = await commonStorage.getWalletConnectSession();
  const webConnector = new WalletConnect(webConnectorOptions);
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
  } catch (error) {
    // TODO: error handling
  }
};
