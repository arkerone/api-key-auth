/**
 * @author Axel SHAÏTA <shaita.axel@gmail.com>
 * MIT Licensed
 */

const crypto = require('crypto');
const { UnsupportedAlgorithmError } = require('./errors');

/**
 * @module algorithm
 */
module.exports = {
  /**
   * @description A list of available algorithms
   * @public
   * @type Array
   */
  availableAlgorithms: ['hmac-sha256', 'hmac-sha1', 'hmac-sha512'],

  /**
   * @function
   * @public
   * @description Create the HMAC algorithm
   * @param {Object} name - The algorithm's name
   * @param {string|Buffer|TypedArray|DataView} secret - The secret key
   * @return {Hmac} The Hmac object
   * @throws {UnsupportedAlgorithmError}
   */
  create(name, secret) {
    let algorithm = null;
    switch (name) {
      case 'hmac-sha1':
        algorithm = crypto.createHmac('sha1', secret);
        break;
      case 'hmac-sha256':
        algorithm = crypto.createHmac('sha256', secret);
        break;
      case 'hmac-sha512':
        algorithm = crypto.createHmac('sha512', secret);
        break;
      default:
        throw new UnsupportedAlgorithmError();
    }

    return algorithm;
  }
};
