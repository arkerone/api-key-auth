/**
 * @class BaseError
 * @private
 * @extends Error
 */
class BaseError extends Error {
  /**
   * @param {Number} status The HTTP status code
   * @param {number} message The error message
   */
  constructor(status, message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.status = status;
  }
}

/**
 * @module errors
 */
module.exports = {
  /**
   * @class MissingRequiredHeadersError
   * @public
   * @extends BaseError
   */
  MissingRequiredHeadersError: class MissingRequiredHeadersError extends BaseError {
    /**
     * @param {Array} headers The header's names
     */
    constructor(...headers) {
      const message = `Missing required HTTP headers : ${headers.join(', ')}`;
      super(400, message);
    }
  },

  /**
   * @class MissingRequiredSignatureParamsError
   * @public
   * @extends BaseError
   */
  MissingRequiredSignatureParamsError: class MissingRequiredSignatureParamsError extends BaseError {
    /**
     * @param {Array} params The signature parameter's names
     */
    constructor(...params) {
      const message = `Missing required signature parameters : ${params.join(', ')}`;
      super(400, message);
    }
  },

  /**
   * @class UnauthorizedError
   * @public
   * @extends BaseError
   */
  UnauthorizedError: class UnauthorizedError extends BaseError {
    /**
     * @param {number} message The error message
     */
    constructor(message) {
      super(401, message);
    }
  },

  /**
   * @class BadAuthenticationSchemeError
   * @public
   * @extends BaseError
   */
  BadAuthenticationSchemeError: class BadAuthenticationSchemeError extends BaseError {
    constructor() {
      const message = 'Bad authentication scheme';
      super(401, message);
    }
  },

  /**
   * @class BadSignatureError
   * @public
   * @extends BaseError
   */
  BadSignatureError: class BadSignatureError extends BaseError {
    constructor() {
      const message = 'Bad signature';
      super(401, message);
    }
  },

  /**
   * @class UnsupportedAlgorithmError
   * @public
   * @extends BaseError
   */
  UnsupportedAlgorithmError: class UnsupportedAlgorithmError extends BaseError {
    constructor() {
      const message = 'Unsupported algorithm';
      super(401, message);
    }
  }
};
