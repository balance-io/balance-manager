import forge from 'node-forge';

forge.options.usePureJavascript = true;

const pki = forge.pki;

const trimeHeaders = key => {
  if (key.indexOf('PRIVATE KEY') !== -1) {
    return key
      .replace('-----BEGIN RSA PRIVATE KEY-----', '')
      .replace('-----END RSA PRIVATE KEY-----', '')
      .replace(/[\r\n\s\t]/g, '');
  } else {
    return key
      .replace('-----BEGIN PUBLIC KEY-----', '')
      .replace('-----END PUBLIC KEY-----', '')
      .replace(/[\r\n\s\t]/g, '');
  }
};

export const generateKeyPair = () =>
  new Promise((resolve, reject) =>
    pki.rsa.generateKeyPair({ bits: 1024 }, (err, raw) => {
      if (err) {
        reject(err);
      }
      const publicKey = pki.publicKeyToPem(raw.publicKey);
      const privateKey = pki.privateKeyToPem(raw.privateKey);

      const keypair = {
        trimmedHeaders: {
          publicKey: trimeHeaders(publicKey),
          privateKey: trimeHeaders(privateKey)
        },
        publicKey,
        privateKey
      };

      resolve(keypair);
    })
  );

export const encryptMessage = (message, publicKey) =>
  pki.publicKeyFromPem(publicKey).encrypt(message);

export const decryptMessage = (encryptedMessage, privateKey) =>
  pki.privateKeyFromPem(privateKey).decrypt(encryptedMessage);
