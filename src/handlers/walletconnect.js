import { WebConnector } from 'walletconnect';

/**
 * @desc WalletConnect webConnector instance
 */
export let walletConnectInstance = {
  bridgeDomain: 'https://walletconnect.balance.io',
  dappName: 'Balance Manager',
  webConnector: null,
};

/**
 * @desc init WalletConnect webConnector instance
 * @return {Object}
 */
export const walletConnectInit = async () => {
  const webConnector = new WebConnector(walletConnectInstance.bridgeDomain, {
    dappName: walletConnectInstance.dappName,
  });
  await webConnector.createSession();
  walletConnectInstance.webConnector = webConnector;
  return walletConnectInstance;
};

/**
 * @desc WalletConnect get accounts
 * @return {Array}
 */
export const walletConnectEthAccounts = cb => {
  walletConnectInstance.webConnector.listenSessionStatus(cb);
};

const walletConnectListenTransactionStatus = transactionId =>
  new Promise((resolve, reject) => {
    walletConnectInstance.webConnector.listenTransactionStatus(
      transactionId,
      (err, data) => {
        if (err) reject(err);
        resolve(data);
      },
    );
  });

/**
 * @desc WalletConnect sign transaction
 * @param  {Object}  transaction { from, to, data, value, gasPrice, gasLimit }
 * @return {String}
 */
export const walletConnectSignTransaction = async transaction => {
  const transactionId = await walletConnectInstance.webConnector.createTransaction(
    transaction,
  );
  const data = await walletConnectListenTransactionStatus(
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
};
