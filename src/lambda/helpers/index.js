import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import {
  convertStringToNumber,
  convertAmountToDisplay,
  convertAmountToBigNumber,
  convertAssetAmountToBigNumber,
  getDataString,
  getNakedAddress,
  fromWei,
  hexToNumberString
} from '../../utilities';

export const web3Lambda = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/`));

export const getAccountBalance = async address => {
  const wei = await web3Lambda.eth.getBalance(address);
  const ether = fromWei(wei);
  const balance = Number(ether) !== 0 ? BigNumber(`${ether}`).toString() : 0;
  return balance;
};

export const getTransactionCount = address =>
  web3Lambda.eth.getTransactionCount(address, 'pending');

export const parseAccountBalances = async (data = null, address = '', network = '') => {
  if (!data || !data.docs) return null;

  const getTokenBalanceOf = (accountAddress, tokenAddress) =>
    new Promise((resolve, reject) => {
      const balanceHexMethod = web3Lambda.utils.sha3('balanceOf(address)').substring(0, 10);
      const dataString = getDataString(balanceHexMethod, [getNakedAddress(accountAddress)]);
      web3Lambda.eth
        .call({ to: tokenAddress, data: dataString })
        .then(balanceHexResult => {
          const balance = hexToNumberString(balanceHexResult);
          resolve(balance);
        })
        .catch(error => reject(error));
    });

  const ethereumBalance = await getAccountBalance(address);
  const countTxs = await getTransactionCount(address);
  const ethereum = {
    name: 'Ethereum',
    symbol: 'ETH',
    address: null,
    decimals: 18,
    balance: {
      amount: convertAmountToBigNumber(ethereumBalance),
      display: convertAmountToDisplay(convertAmountToBigNumber(ethereumBalance), null, {
        symbol: 'ETH',
        decimals: 18
      })
    },
    native: null
  };

  let assets = [ethereum];

  let tokens = await Promise.all(
    data.docs.map(async token => {
      const asset = {
        name: token.contract.name || 'Unknown Token',
        symbol: token.contract.symbol || '———',
        address: token.contract.address || null,
        decimals: convertStringToNumber(token.contract.decimals)
      };
      const rawBalance = await getTokenBalanceOf(address, asset.address);
      const assetBalance = convertAssetAmountToBigNumber(rawBalance, asset.decimals);
      return {
        ...asset,
        balance: {
          amount: assetBalance,
          display: convertAmountToDisplay(assetBalance, null, {
            symbol: asset.symbol,
            decimals: asset.decimals
          })
        },
        native: null
      };
    })
  );

  tokens = tokens.filter(token => !!Number(token.balance.amount));

  assets = [...assets, ...tokens];

  return {
    address: address,
    type: '',
    txCount: countTxs,
    assets: assets,
    total: '———'
  };
};
