import CryptoJS from 'crypto-js';

/**
 * Generate a random encryption key
 * @returns {string} A random hex key
 */
export const generateKey = () => {
  return CryptoJS.lib.WordArray.random(256/8).toString();
};

/**
 * Encrypt a message with a key
 * @param {string} message - The message to encrypt
 * @param {string} key - The encryption key
 * @returns {string} The encrypted message
 */
export const encryptMessage = (message, key) => {
  return CryptoJS.AES.encrypt(message, key).toString();
};

/**
 * Decrypt a message with a key
 * @param {string} encryptedMessage - The encrypted message
 * @param {string} key - The decryption key
 * @returns {string} The decrypted message
 */
export const decryptMessage = (encryptedMessage, key) => {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};
