const BigNumber = require('bignumber.js');
const { web3Instance, getTokenBalanceOf, getAccountBalance } = require('./web3');
const ropstenTokens = require('../libraries/ropsten-tokens.json');
const rinkebyTokens = require('../libraries/rinkeby-tokens.json');
const kovanTokens = require('../libraries/kovan-tokens.json');

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
        if (balance === '0') {
          return null;
        }
        balance = BigNumber(balance)
          .toFormat(token.decimal, 0)
          .replace(/0+$/, '')
          .replace(/\.+$/, '');
        balance = BigNumber(Number(balance.replace(/[^0-9.]/gi, '')))
          .times(new BigNumber(10).pow(token.decimal))
          .toNumber();
        return {
          tokenInfo: {
            name: token.name,
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimal
          },
          balance: Number(balance)
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
