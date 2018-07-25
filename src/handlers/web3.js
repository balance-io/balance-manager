import Web3 from 'web3';
import { isValidAddress } from '../helpers/validators';
import { getDataString, removeHexPrefix } from '../helpers/utilities';
import {
  convertStringToNumber,
  convertNumberToString,
  convertAmountToBigNumber,
  convertAssetAmountFromBigNumber,
  convertHexToString,
  convertStringToHex,
  convertAmountToAssetAmount,
} from '../helpers/bignumber';
import { ledgerEthSignTransaction } from './ledger-eth';
import { trezorEthSignTransaction } from './trezor-eth';
import { walletConnectSignTransaction } from './walletconnect';
import ethUnits from '../references/ethereum-units.json';
import smartContractMethods from '../references/smartcontract-methods.json';
import ENS from 'ethjs-ens';
import HttpProvider from 'ethjs-provider-http';

const provider = `https://mainnet.infura.io/`;

export let ens = new ENS({ provider: new HttpProvider(provider), network: 1 });

Web3.providers.HttpProvider.prototype.sendAsync =
  Web3.providers.HttpProvider.prototype.send;

/**
 * @desc web3 http instance
 */
export const web3Instance = new Web3(new Web3.providers.HttpProvider(provider));

/**
 * @desc set a different web3 provider
 * @param {String}
 */
export const web3SetHttpProvider = provider => {
  let providerObj = null;
  if (provider.match(/(https?:\/\/)(\w+.)+/g)) {
    providerObj = new Web3.providers.HttpProvider(provider);

    let network = provider.includes('ropsten') ? 3 : 1;

    ens = new ENS({ provider: new HttpProvider(provider), network });
  }
  if (!providerObj) {
    throw new Error(
      'function web3SetHttpProvider requires provider to match a valid HTTP/HTTPS endpoint',
    );
  }
  return web3Instance.setProvider(providerObj);
};

/**
 * @desc convert to checksum address
 * @param  {String} address
 * @return {String}
 */
export const toChecksumAddress = address => {
  if (typeof address === 'undefined') return '';

  address = address.toLowerCase().replace('0x', '');
  const addressHash = web3Instance.utils.sha3(address).replace('0x', '');
  let checksumAddress = '0x';

  for (let i = 0; i < address.length; i++) {
    if (parseInt(addressHash[i], 16) > 7) {
      checksumAddress += address[i].toUpperCase();
    } else {
      checksumAddress += address[i];
    }
  }
  return checksumAddress;
};

/**
 * @desc convert from wei to ether
 * @param  {Number} wei
 * @return {BigNumber}
 */
export const fromWei = wei => web3Instance.utils.fromWei(wei);

/**
 * @desc convert from ether to wei
 * @param  {Number} ether
 * @return {BigNumber}
 */
export const toWei = ether => web3Instance.utils.toWei(ether);

/**
 * @desc hash string with sha3
 * @param  {String} string
 * @return {String}
 */
export const sha3 = string => web3Instance.utils.sha3(string);

/**
 * @desc get address transaction count
 * @param {String} address
 * @return {Promise}
 */
export const getTransactionCount = address =>
  web3Instance.eth.getTransactionCount(address, 'pending');

/**
 * @desc get transaction by hash
 * @param   {String}  hash
 * @return  {Promise}
 */
export const getTransactionByHash = hash =>
  web3Instance.eth.getTransaction(hash);

/**
 * @desc get block by hash
 * @param   {String}  hash
 * @return  {Promise}
 */
export const getBlockByHash = hash => web3Instance.eth.getBlock(hash);

/**
 * @desc get account ether balance
 * @param  {String} accountAddress
 * @param  {String} tokenAddress
 * @return {Array}
 */
export const getAccountBalance = async address => {
  const wei = await web3Instance.eth.getBalance(address);
  const ether = fromWei(wei);
  const balance =
    convertStringToNumber(ether) !== 0 ? convertNumberToString(ether) : 0;
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
    const balanceMethodHash = smartContractMethods.token_balance.hash;
    const dataString = getDataString(balanceMethodHash, [
      removeHexPrefix(accountAddress),
    ]);
    web3Instance.eth
      .call({ to: tokenAddress, data: dataString })
      .then(balanceHexResult => {
        const balance = convertHexToString(balanceHexResult);
        resolve(balance);
      })
      .catch(error => reject(error));
  });

/**
 * @desc get transaction details
 * @param  {Object} transaction { from, to, data, value, gasPrice, gasLimit }
 * @return {Object}
 */
export const getTxDetails = async ({
  from,
  to,
  data,
  value,
  gasPrice,
  gasLimit,
}) => {
  const _gasPrice = gasPrice || (await web3Instance.eth.getGasPrice());
  const estimateGasData = value === '0x00' ? { from, to, data } : { to, data };
  const _gasLimit =
    gasLimit || (await web3Instance.eth.estimateGas(estimateGasData));
  const nonce = await getTransactionCount(from);
  const tx = {
    from: from,
    to: to,
    nonce: web3Instance.utils.toHex(nonce),
    gasPrice: web3Instance.utils.toHex(_gasPrice),
    gasLimit: web3Instance.utils.toHex(_gasLimit),
    gas: web3Instance.utils.toHex(_gasLimit),
    value: web3Instance.utils.toHex(value),
    data: data,
  };
  return tx;
};

/**
 * @desc get transfer token transaction
 * @param  {Object}  transaction { asset, from, to, amount, gasPrice }
 * @return {Object}
 */
export const getTransferTokenTransaction = transaction => {
  const transferMethodHash = smartContractMethods.token_transfer.hash;
  const value = convertStringToHex(
    convertAmountToAssetAmount(transaction.amount, transaction.asset.decimals),
  );
  const recipient = removeHexPrefix(transaction.to);
  const dataString = getDataString(transferMethodHash, [recipient, value]);
  return {
    from: transaction.from,
    to: transaction.asset.address,
    data: dataString,
    gasPrice: transaction.gasPrice,
    gasLimit: transaction.gasLimit,
  };
};

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
export const web3MetamaskSendTransaction = transaction =>
  new Promise((resolve, reject) => {
    const from =
      transaction.from.substr(0, 2) === '0x'
        ? transaction.from
        : `0x${transaction.from}`;
    const to =
      transaction.to.substr(0, 2) === '0x'
        ? transaction.to
        : `0x${transaction.to}`;
    const value = transaction.value ? toWei(transaction.value) : '0x00';
    const data = transaction.data ? transaction.data : '0x';
    getTxDetails({
      from,
      to,
      data,
      value,
      gasPrice: transaction.gasPrice,
      gasLimit: transaction.gasLimit,
    })
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
 * @desc walletconnect send transaction
 * @param  {Object}  transaction { from, to, value, data, gasPrice}
 * @return {Promise}
 */
export const web3WalletConnectSendTransaction = transaction =>
  new Promise((resolve, reject) => {
    const from =
      transaction.from.substr(0, 2) === '0x'
        ? transaction.from
        : `0x${transaction.from}`;
    const to =
      transaction.to.substr(0, 2) === '0x'
        ? transaction.to
        : `0x${transaction.to}`;
    const value = transaction.value ? toWei(transaction.value) : '0x00';
    const data = transaction.data ? transaction.data : '0x';
    getTxDetails({
      from,
      to,
      data,
      value,
      gasPrice: transaction.gasPrice,
      gasLimit: transaction.gasLimit,
    })
      .then(txDetails => {
        walletConnectSignTransaction(txDetails)
          .then(txHash => {
            if (txHash) {
              resolve(txHash);
            } else {
              throw new Error('Could not send transaction via Wallet Connect');
            }
          })
          .catch(error => reject(error));
      })
      .catch(error => reject(error));
  });

/**
 * @desc ledger send transaction
 * @param  {Object}  transaction { from, to, value, data, gasPrice}
 * @return {Promise}
 */
export const web3LedgerSendTransaction = transaction =>
  new Promise((resolve, reject) => {
    const from =
      transaction.from.substr(0, 2) === '0x'
        ? transaction.from
        : `0x${transaction.from}`;
    const to =
      transaction.to.substr(0, 2) === '0x'
        ? transaction.to
        : `0x${transaction.to}`;
    const value = transaction.value ? toWei(transaction.value) : '0x00';
    const data = transaction.data ? transaction.data : '0x';
    getTxDetails({
      from,
      to,
      data,
      value,
      gasPrice: transaction.gasPrice,
      gasLimit: transaction.gasLimit,
    })
      .then(txDetails => {
        ledgerEthSignTransaction(txDetails)
          .then(signedTx =>
            web3SendSignedTransaction(signedTx)
              .then(txHash => resolve(txHash))
              .catch(error => reject(error)),
          )
          .catch(error => reject(error));
      })
      .catch(error => reject(error));
  });

export const web3TrezorSendTransaction = transaction =>
  new Promise((resolve, reject) => {
    const from =
      transaction.from.substr(0, 2) === '0x'
        ? transaction.from
        : `0x${transaction.from}`;
    const to =
      transaction.to.substr(0, 2) === '0x'
        ? transaction.to
        : `0x${transaction.to}`;
    const value = transaction.value ? toWei(transaction.value) : '0x00';
    const data = transaction.data ? transaction.data : '0x';
    getTxDetails({
      from,
      to,
      data,
      value,
      gasPrice: transaction.gasPrice,
      gasLimit: transaction.gasLimit,
    })
      .then(txDetails => {
        trezorEthSignTransaction(txDetails)
          .then(signedTx =>
            web3SendSignedTransaction(signedTx)
              .then(txHash => resolve(txHash))
              .catch(error => reject(error)),
          )
          .catch(error => reject(error));
      })
      .catch(error => reject(error));
  });

/**
 * @desc send transaction controller given asset transfered and account type
 * @param {Object} transaction { asset, from, to, amount, gasPrice }
 * @return {Promise}
 */
export const web3SendTransactionMultiWallet = (transaction, accountType) => {
  let method = null;
  transaction.value = transaction.amount;
  if (transaction.asset.symbol !== 'ETH') {
    transaction = getTransferTokenTransaction(transaction);
  }
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

/**
 * @desc estimate gas limit
 * @param {Object} [{selected, address, recipient, amount, gasPrice}]
 * @return {String}
 */
export const estimateGasLimit = async ({
  asset,
  address,
  recipient,
  amount,
}) => {
  let gasLimit = ethUnits.basic_tx;
  let data = '0x';
  let _amount =
    amount && Number(amount)
      ? convertAmountToBigNumber(amount)
      : asset.balance.amount * 0.1;
  let _recipient =
    recipient && isValidAddress(recipient)
      ? recipient
      : '0x737e583620f4ac1842d4e354789ca0c5e0651fbb';
  let estimateGasData = { to: _recipient, data };
  if (asset.symbol !== 'ETH') {
    const transferMethodHash = smartContractMethods.token_transfer.hash;
    let value = convertAssetAmountFromBigNumber(_amount, asset.decimals);
    value = convertStringToHex(value);
    data = getDataString(transferMethodHash, [
      removeHexPrefix(_recipient),
      value,
    ]);
    estimateGasData = { from: address, to: asset.address, data, value: '0x0' };
    gasLimit = await web3Instance.eth.estimateGas(estimateGasData);
  }
  return gasLimit;
};
