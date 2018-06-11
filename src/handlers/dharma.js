import { web3Instance as web3 } from './web3';
import { Dharma } from '@dharmaprotocol/dharma.js';

export const dharma = new Dharma(web3.contentProvider);
