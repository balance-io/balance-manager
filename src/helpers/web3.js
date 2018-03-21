import Web3 from 'web3';
import Tx from 'ethereumjs-tx';
import BigNumber from 'bignumber.js';
import lang from '../languages';
import ethUnits from '../libraries/ethereum-units.json';
import { isValidAddress } from './validators';
import { getDataString, getNakedAddress, toWei, fromWei } from './utilities';

/**
 * @desc web3 instance
 */
export const web3Instance = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/`));

/**
 * @desc set a different web3 provider
 * @param {String}
 */
export const web3SetProvider = provider => {
  let providerObj = null;
  if (provider.match(/(https?:\/\/)(\w+.)+/g)) {
    providerObj = new Web3.providers.HttpProvider(provider);
  } else if (provider.match(/(wss?:\/\/)(\w+.)+/g)) {
    providerObj = new Web3.providers.WebsocketProvider(provider);
  }
  if (!providerObj) {
    throw new Error(
      'function web3SetProvider requires provider to match a valid HTTP/HTTPS or WS/WSS address'
    );
  }
  return web3Instance.setProvider(providerObj);
};

/**
 * @desc get account ether balance
 * @param  {String} accountAddress
 * @param  {String} tokenAddress
 * @return {Array}
 */
export const getAccountBalance = async address => {
  const wei = await web3Instance.eth.getBalance(address);
  const ether = fromWei(wei);
  const balance = Number(ether) !== 0 ? BigNumber(ether).toFormat(8) : 0;
  return balance;
};

/**
 * @desc get account token balance
 * @param  {String} accountAddress
 * @param  {String} tokenAddress
 * @return {Array}
 */
export const getTokenBalanceOf = (accountAddress, tokenAddress) =>
  new Promise((resolve, reject) => {
    const balanceHexMethod = web3Instance.utils.sha3('balanceOf(address)').substring(0, 10);
    const dataString = getDataString(balanceHexMethod, [getNakedAddress(accountAddress)]);
    web3Instance.eth
      .call({ to: tokenAddress, data: dataString })
      .then(balanceHexResult => {
        const balance = web3Instance.utils.fromWei(balanceHexResult);
        resolve(balance);
      })
      .catch(error => reject(error));
  });

/**
 * @desc sign transaction
 * @param {Object} txDetails
 * @param {String} privateKey
 * @return {String}
 */
export const signTx = (txDetails, privateKey) => {
  const tx = new Tx(txDetails);
  const key = Buffer.from(privateKey, 'hex');
  tx.sign(key);
  const serializedTx = `0x${tx.serialize().toString('hex')}`;
  return serializedTx;
};

/**
 * @desc get transaction details
 * @param {String} from
 * @param {String} to
 * @param {String} data
 * @param {String} value
 * @param {String} gasPrice
 * @return {Object}
 */
export const getTxDetails = async (from, to, data, value, gasPrice) => {
  const _gasPrice = gasPrice || (await web3Instance.eth.getGasPrice());
  const estimateGasData = value === '0x00' ? { from, to, data } : { to, data };
  const gasLimit = await web3Instance.eth.estimateGas(estimateGasData);
  const nonce = await web3Instance.eth.getTransactionCount(from);
  const tx = {
    nonce: web3Instance.utils.toHex(nonce),
    gasPrice: web3Instance.utils.toHex(_gasPrice),
    gasLimit: web3Instance.utils.toHex(gasLimit),
    value: web3Instance.utils.toHex(value),
    data: data,
    to
  };
  return tx;
};

/**
 * @desc send signed transaction
 * @param  {Object}  transaction { from, to, value, data, gasPrice, privateKey}
 * @return {Promise}
 */
export const sendSignedTransaction = transaction =>
  new Promise((resolve, reject) => {
    const from =
      transaction.from.substr(0, 2) === '0x' ? transaction.from : `0x${transaction.from}`;
    const to = transaction.to.substr(0, 2) === '0x' ? transaction.to : `0x${transaction.to}`;
    const value = transaction.value ? toWei(transaction.value) : '0x00';
    const data = transaction.data ? transaction.data : '0x';
    const privateKey =
      transaction.privateKey.substr(0, 2) === '0x'
        ? transaction.privateKey.substr(2)
        : transaction.privateKey;
    getTxDetails(from, to, data, value, transaction.gasPrice)
      .then(txDetails => {
        const signedTx = signTx(txDetails, privateKey);
        web3Instance.eth
          .sendSignedTransaction(signedTx)
          .once('transactionHash', txHash => resolve(txHash))
          .catch(error => reject(error));
      })
      .catch(error => reject(error));
  });

/**
 * @desc transfer token
 * @param  {Object}  transaction { tokenObject, from, to, amount, gasPrice, privateKey}
 * @return {Promise}
 */
export const transferToken = transaction =>
  new Promise((resolve, reject) => {
    const transferHexMethod = web3Instance.utils.sha3('transfer(address,uint256)').substring(0, 10);
    const value = new BigNumber(transaction.amount)
      .times(new BigNumber(10).pow(transaction.tokenObject.decimals))
      .toString(16);
    const recipient = getNakedAddress(transaction.to);
    const dataString = getDataString(transferHexMethod, [recipient, value]);
    sendSignedTransaction({
      from: transaction.from,
      to: transaction.tokenObject.address,
      data: dataString,
      gasPrice: transaction.gasPrice,
      privateKey: transaction.privateKey
    })
      .then(txHash => resolve(txHash))
      .catch(error => reject(error));
  });

/**
 * @desc metamask send transaction
 * @param  {Object}  transaction { from, to, value, data, gasPrice}
 * @return {Promise}
 */
export const metamaskSendTransaction = transaction =>
  new Promise((resolve, reject) => {
    const from =
      transaction.from.substr(0, 2) === '0x' ? transaction.from : `0x${transaction.from}`;
    const to = transaction.to.substr(0, 2) === '0x' ? transaction.to : `0x${transaction.to}`;
    const value = transaction.value ? toWei(transaction.value) : '0x00';
    const data = transaction.data ? transaction.data : '0x';
    getTxDetails(from, to, data, value, transaction.gasPrice)
      .then(txDetails => {
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
      })
      .catch(error => reject(error));
  });

/**
 * @desc metamask transfer token
 * @param  {Object}  transaction { tokenObject, from, to, amount, gasPrice }
 * @return {Promise}
 */
export const metamaskTransferToken = transaction =>
  new Promise((resolve, reject) => {
    const transferHexMethod = web3Instance.utils.sha3('transfer(address,uint256)').substring(0, 10);
    const value = new BigNumber(transaction.amount)
      .times(new BigNumber(10).pow(transaction.tokenObject.decimals))
      .toString(16);
    const recipient = getNakedAddress(transaction.to);
    const dataString = getDataString(transferHexMethod, [recipient, value]);
    metamaskSendTransaction({
      from: transaction.from,
      to: transaction.tokenObject.address,
      data: dataString,
      gasPrice: transaction.gasPrice
    })
      .then(txHash => resolve(txHash))
      .catch(error => reject(error));
  });

/**
 * @desc get transaction fee
 * @param {Object} [{selected, address, recipient, amount, gasPrice}]
 * @return {String}
 */
export const getTransactionFee = async ({ tokenObject, address, recipient, amount, gasPrice }) => {
  let gasLimit = ethUnits.basic_tx;
  let _gasPrice = gasPrice * ethUnits.gwei;
  let data = '0x';
  let _amount =
    amount && Number(amount)
      ? amount
      : Number(Number(tokenObject.balance) / 2).toFixed(tokenObject.decimals);
  let _recipient =
    recipient && isValidAddress(recipient)
      ? recipient
      : '0x737e583620f4ac1842d4e354789ca0c5e0651fbb';
  let estimateGasData = { to: _recipient, data };
  let tokenBalance =
    tokenObject.symbol !== 'ETH' ? await getTokenBalanceOf(address, tokenObject.address) : null;
  if (tokenObject.symbol !== 'ETH') {
    if (!Number.isNaN(Number(tokenBalance)) && Number(tokenBalance) === 0) {
      throw new Error(lang.t('notification.error.insufficient_balance'));
    } else if (tokenBalance) {
      _amount = tokenBalance;
    }
    const transferHexMethod = web3Instance.utils.sha3('transfer(address,uint256)').substring(0, 10);
    const value = new BigNumber(_amount)
      .times(new BigNumber(10).pow(tokenObject.decimals))
      .toString(16);
    data = getDataString(transferHexMethod, [getNakedAddress(_recipient), value]);
    estimateGasData = { from: address, to: tokenObject.address, data, value: '0x0' };
    gasLimit = await web3Instance.eth.estimateGas(estimateGasData);
  }
  const wei = String(gasLimit * _gasPrice);
  const txFee = fromWei(wei);
  return { txFee, gasLimit };
};
