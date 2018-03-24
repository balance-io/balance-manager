import { web3Instance, getTokenBalanceOf, getAccountBalance } from './web3';
import { convertAssetAmountToBigNumber, convertStringToNumber } from './utilities';
import ropstenTokens from '../libraries/ropsten-tokens.json';
import rinkebyTokens from '../libraries/rinkeby-tokens.json';
import kovanTokens from '../libraries/kovan-tokens.json';

/**
 * @desc get account tokens
 * @param  {String} accountAddress
 * @return {Array}
 */
export const getAccountTokens = async (accountAddress, network) => {
  let tokenList = [];
  switch (network) {
    case 'ropsten':
      tokenList = ropstenTokens;
      break;
    case 'rinkeby':
      tokenList = rinkebyTokens;
      break;
    case 'kovan':
      tokenList = kovanTokens;
      break;
    default:
      break;
  }
  let accountTokens = await Promise.all(
    tokenList.map(async token => {
      if (tokenList) {
        let balance = await getTokenBalanceOf(accountAddress, token.address);
        if (convertStringToNumber(balance) === 0) {
          return null;
        }
        balance = convertAssetAmountToBigNumber(balance, token.decimals);
        return {
          tokenInfo: {
            name: token.name,
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals
          },
          balance: balance
        };
      }
      return null;
    })
  );
  accountTokens = accountTokens.filter(token => !!token).length
    ? accountTokens.filter(token => !!token)
    : null;
  return accountTokens;
};

//

/**
 * @desc get ethereum address info / tokens
 * @param  {String}   [address='']
 * @param  {String}   [network='ropsten']
 * @return {Promise}
 */
export const testnetGetAddressInfo = async (address = '', network = 'ropsten') => {
  const countTxs = await web3Instance.eth.getTransactionCount(address);
  const balance = await getAccountBalance(address);
  const tokens = await getAccountTokens(address, network);
  const response = {
    address,
    countTxs,
    ETH: {
      balance: Number(balance)
    }
  };
  if (tokens) response.tokens = tokens;
  return response;
};
