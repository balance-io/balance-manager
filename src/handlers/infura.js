import axios from 'axios';
import { convertHexToString } from '../helpers/bignumber';
import { getNakedAddress, getDataString } from '../helpers/utilities';
import smartContractMethods from '../references/smartcontract-methods.json';

/**
 * @desc infura rpc request ethereum balance
 * @param  {String}  [address='']
 * @param  {String}  [network='mainnet']
 * @return {Promise}
 */
export const infuraGetEthereumBalance = async (
  address = '',
  network = 'mainnet',
) => {
  try {
    const response = await axios.get(
      `https://api.infura.io/v1/jsonrpc/${network}/eth_getBalance?params=["${address}","latest"]`,
    );
    const result = convertHexToString(response.data.result);
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * @desc infura rpc request transaction count
 * @param  {String}  [address='']
 * @param  {String}  [network='mainnet']
 * @return {Promise}
 */
export const infuraGetTransactionCount = async (
  address = '',
  network = 'mainnet',
) => {
  try {
    const response = await axios.get(
      `https://api.infura.io/v1/jsonrpc/${network}/eth_getTransactionCount?params=["${address}","latest"]`,
    );
    const result = convertHexToString(response.data.result);
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * @desc infura rpc request token balance
 * @param  {String}  [accountAddress='']
 * @param  {String}  [tokenAddress='']
 * @param  {String}  [network='mainnet']
 * @return {Promise}
 */
export const infuraCallTokenBalance = async (
  accountAddress = '',
  tokenAddress = '',
  network = 'mainnet',
) => {
  try {
    const balanceMethodHash = smartContractMethods.token_balance.hash;
    const dataString = getDataString(balanceMethodHash, [
      getNakedAddress(accountAddress),
    ]);
    const response = await axios.get(
      `https://api.infura.io/v1/jsonrpc/${network}/eth_call?params=[{"to":"${tokenAddress}","data":"${dataString}"},"latest"]`,
    );
    const result = convertHexToString(response.data.result);
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * @desc infura rpc request transaction by hash
 * @param  {String}  [address='']
 * @param  {String}  [network='mainnet']
 * @return {Promise}
 */
export const infuraGetTransactionByHash = async (
  hash = '',
  network = 'mainnet',
) => {
  try {
    const response = await axios.get(
      `https://api.infura.io/v1/jsonrpc/${network}/eth_getTransactionByHash?params=["${hash}"]`,
    );
    const result = response.data.result;
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * @desc infura rpc request block by hash
 * @param  {String}  [address='']
 * @param  {String}  [network='mainnet']
 * @return {Promise}
 */
export const infuraGetBlockByHash = async (hash = '', network = 'mainnet') => {
  try {
    const response = await axios.get(
      `https://api.infura.io/v1/jsonrpc/${network}/eth_getBlockByHash?params=["${hash}", false]`,
    );
    const result = response.data.result;
    return result;
  } catch (error) {
    throw error;
  }
};
