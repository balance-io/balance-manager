import WalletConnect from 'walletconnect';
import { commonStorage } from 'balance-common';

const dappName = 'Balance Manager';
const bridgeUrl = process.env.REACT_APP_WALLETCONNECT_BRIDGE;

/**
 * @desc init WalletConnect webConnector instance
 * @return {Object}
 */
export const walletConnectGetSession = async () => {
  const webConnector = new WalletConnect({ bridgeUrl, dappName });
  await webConnector.initSession();
  return webConnector;
};

/**
 * @desc WalletConnect send transaction
 * @param  {Object}  transaction { from, to, data, value, gasPrice, gasLimit }
 * @return {String}
 */
export const walletConnectSignTransaction = async transaction => {
  const webConnector = await walletConnectGetSession();
  if (webConnector.isConnected) {
    return await webConnector.sendTransaction(transaction);
  } else {
    throw new Error('WalletConnect session has expired. Please reconnect.');
  }
};
