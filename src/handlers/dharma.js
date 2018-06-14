import { web3Instance as web3 } from './web3';
import { Dharma } from '@dharmaprotocol/dharma.js';

web3.providers.HttpProvider.prototype.sendAsync =
  web3.providers.HttpProvider.prototype.send;

export const dharma = new Dharma(web3.currentProvider);
