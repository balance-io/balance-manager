import Web3 from 'web3';
import Tx from 'ethereumjs-tx';
import BigNumber from 'bignumber.js';
import TransportU2F from '@ledgerhq/hw-transport-u2f';
import createLedgerSubprovider from '@ledgerhq/web3-subprovider';
import ProviderEngine from 'web3-provider-engine';
import FetchSubprovider from 'web3-provider-engine/subproviders/fetch';
import { isValidAddress } from './validators';
import { getDataString, getNakedAddress } from './utilities';
import {
  convertAmountToBigNumber,
  convertAssetAmountFromBigNumber,
  convertHexToString
} from './bignumber';
import ethUnits from '../libraries/ethereum-units.json';
import ethereumNetworks from '../libraries/ethereum-networks.json';
import smartContractMethods from '../libraries/smartcontract-methods.json';

/**
 * @desc web3 http instance
 */
export const web3Instance = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/`));

/**
 * @desc set a different web3 provider
 * @param {String}
 */
export const web3SetHttpProvider = provider => {
  let providerObj = null;
  if (provider.match(/(https?:\/\/)(\w+.)+/g)) {
    providerObj = new Web3.providers.HttpProvider(provider);
  }
  if (!providerObj) {
    throw new Error(
      'function web3SetHttpProvider requires provider to match a valid HTTP/HTTPS endpoint'
    );
  }
  return web3Instance.setProvider(providerObj);
};

/**
 * @desc web3 Ledger instance
 */
export let web3LedgerInstance = null;

/**
 * @desc init web3 Ledger instance
 * @param  {String} network
 * @return {Object}
 */
export const web3LedgerInit = async network => {
  try {
    const networkId = ethereumNetworks[network].id;
    const rpcUrl = `https://${network}.infura.io/`;
    const engine = new ProviderEngine();
    const getTransport = () => TransportU2F.create();
    const ledger = createLedgerSubprovider(getTransport, {
      networkId,
      accountsLength: 5
    });
    engine.addProvider(ledger);
    engine.addProvider(new FetchSubprovider({ rpcUrl }));
    engine.start();
    web3LedgerInstance = new Web3(engine);
    return web3LedgerInstance;
  } catch (error) {
    throw error;
  }
};

/**
 * @desc get web3 Ledger accounts
 * @param  {String} address
 * @return {Array}
 */
export const web3LedgerAccounts = () =>
  new Promise((resolve, reject) => {
    web3LedgerInstance.eth.getAccounts((error, accounts) => {
      if (error) console.error(error);
      if (error) reject(error);
      else resolve(accounts);
    });
  });

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
 * @desc check if address is checkum
 * @param  {String} address
 * @return {String}
 */
export const isChecksumAddress = address => address === toChecksumAddress(address);

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
 * @desc get account ether balance
 * @param  {String} accountAddress
 * @param  {String} tokenAddress
 * @return {Array}
 */
export const getAccountBalance = async address => {
  const wei = await web3Instance.eth.getBalance(address);
  const ether = fromWei(wei);
  const balance = Number(ether) !== 0 ? BigNumber(`${ether}`).toString() : 0;
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
    const dataString = getDataString(balanceMethodHash, [getNakedAddress(accountAddress)]);
    web3Instance.eth
      .call({ to: tokenAddress, data: dataString })
      .then(balanceHexResult => {
        const balance = convertHexToString(balanceHexResult);
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
 * @param  {Object} transaction { from, to, data, value, gasPrice, gasLimit }
 * @return {Object}
 */
export const getTxDetails = async ({ from, to, data, value, gasPrice, gasLimit }) => {
  const _gasPrice = gasPrice || (await web3Instance.eth.getGasPrice());
  const estimateGasData = value === '0x00' ? { from, to, data } : { to, data };
  const _gasLimit = gasLimit || (await web3Instance.eth.estimateGas(estimateGasData));
  const nonce = await getTransactionCount(from);
  const tx = {
    nonce: web3Instance.utils.toHex(nonce),
    gasPrice: web3Instance.utils.toHex(_gasPrice),
    gasLimit: web3Instance.utils.toHex(_gasLimit),
    gas: web3Instance.utils.toHex(_gasLimit),
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
export const web3SendSignedTransaction = transaction =>
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
          .web3SendSignedTransaction(signedTx)
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
export const web3TransferToken = transaction =>
  new Promise((resolve, reject) => {
    const transferMethodHash = smartContractMethods.token_transfer.hash;
    const value = BigNumber(transaction.amount)
      .times(BigNumber(10).pow(transaction.tokenObject.decimals))
      .toString(16);
    const recipient = getNakedAddress(transaction.to);
    const dataString = getDataString(transferMethodHash, [recipient, value]);
    web3SendSignedTransaction({
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
export const web3MetamaskSendTransaction = transaction =>
  new Promise((resolve, reject) => {
    const from =
      transaction.from.substr(0, 2) === '0x' ? transaction.from : `0x${transaction.from}`;
    const to = transaction.to.substr(0, 2) === '0x' ? transaction.to : `0x${transaction.to}`;
    const value = transaction.value ? toWei(transaction.value) : '0x00';
    const data = transaction.data ? transaction.data : '0x';
    getTxDetails({
      from,
      to,
      data,
      value,
      gasPrice: transaction.gasPrice,
      gasLimit: transaction.gasLimit
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
 * @desc metamask transfer token
 * @param  {Object}  transaction { tokenObject, from, to, amount, gasPrice }
 * @return {Promise}
 */
export const web3MetamaskTransferToken = transaction =>
  new Promise((resolve, reject) => {
    const transferMethodHash = smartContractMethods.token_transfer.hash;
    const value = BigNumber(transaction.amount)
      .times(BigNumber(10).pow(transaction.tokenObject.decimals))
      .toString(16);
    const recipient = getNakedAddress(transaction.to);
    const dataString = getDataString(transferMethodHash, [recipient, value]);
    web3MetamaskSendTransaction({
      from: transaction.from,
      to: transaction.tokenObject.address,
      data: dataString,
      gasPrice: transaction.gasPrice,
      gasLimit: transaction.gasLimit
    })
      .then(txHash => resolve(txHash))
      .catch(error => reject(error));
  });

/**
 * @desc estimate gas limit
 * @param {Object} [{selected, address, recipient, amount, gasPrice}]
 * @return {String}
 */
export const estimateGasLimit = async ({ tokenObject, address, recipient, amount }) => {
  let gasLimit = ethUnits.basic_tx;
  let data = '0x';
  let _amount =
    amount && Number(amount) ? convertAmountToBigNumber(amount) : tokenObject.balance.amount;
  let _recipient =
    recipient && isValidAddress(recipient)
      ? recipient
      : '0x737e583620f4ac1842d4e354789ca0c5e0651fbb';
  let estimateGasData = { to: _recipient, data };
  if (tokenObject.symbol !== 'ETH') {
    const transferMethodHash = smartContractMethods.token_transfer.hash;
    let value = convertAssetAmountFromBigNumber(_amount, tokenObject.decimals);
    value = BigNumber(value).toString(16);
    data = getDataString(transferMethodHash, [getNakedAddress(_recipient), value]);
    estimateGasData = { from: address, to: tokenObject.address, data, value: '0x0' };
    gasLimit = await web3Instance.eth.estimateGas(estimateGasData);
  }
  return gasLimit;
};

/**
 * @desc fetch transaction status/information
 * @param  {String} txHash
 * @return {Object}
 */
export const fetchTx = txHash => web3Instance.eth.getTransaction(txHash);
