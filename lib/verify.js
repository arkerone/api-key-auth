/**
 * @author Axel SHAÏTA <shaita.axel@gmail.com>
 * MIT Licensed
 */

const algorithmFactory = require('./algorithm');

/**
 * @module verify
 */
module.exports = {
  /**
   * @function
   * @public
   * @description Verify the signature
   * @param {Object} signatureParams The signature's parameters
   * @param {string|Buffer|TypedArray|DataView} secret The secret key
   * @return {Boolean} True if the signature is ok, false otherwise
   */
  verifySignature(signatureParams, secret) {
    const hmac = algorithmFactory.create(signatureParams.algorithm, secret);
    hmac.update(signatureParams.signingString);

    /* Use double hmac to protect against timing attacks */
    let h1 = algorithmFactory.create(signatureParams.algorithm, secret);
    h1 = h1.update(hmac.digest()).digest();
    let h2 = algorithmFactory.create(signatureParams.algorithm, secret);
    h2 = h2.update(Buffer.from(signatureParams.signature, 'base64')).digest();

    return h1.equals(h2);
  }
};
