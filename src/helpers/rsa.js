import { Crypt, RSA } from 'hybrid-crypto-js';

const rsa = new RSA();
const crypt = new Crypt();

export const generateKeypair = () => new Promise((resolve) =>
  rsa.generateKeypair(keypair => resolve(keypair), 2048));

export const encryptMessage = (message, publicKey) => 
  crypt.encrypt(publicKey, message);

export const decryptMessage = (encryptedMessage, privateKey) => 
  crypt.decrypt(privateKey, encryptedMessage);



