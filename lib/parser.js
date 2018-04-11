/**
 * @author Axel SHAÏTA <shaita.axel@gmail.com>
 * MIT Licensed
 */

const {
  BadAuthenticationSchemeError,
  BadHeaderFormatError,
  ExpiredRequestError,
  MissingRequiredHeadersError,
  MissingRequiredSignatureParamsError,
  UnsupportedAlgorithmError
} = require('./errors');

module.exports = {
  /**
   * @function
   * @public
   * @description Parse the request and extract the signature parameters
   * @param {Object} req The request
   * @param {Object} options An object with options.
   * @param {Array} options.algorithms A list of available algorithms
   * @param {Number|null} [options.requestLifetime=300] The lifetime of a request in second (set to null to disable it)
   * @return {Object} Signature parameters
   * @throws {MissingRequiredHeadersError}
   * @throws {MissingRequiredSignatureParamsError}
   * @throws {BadAuthenticationSchemeError}
   */
  parseRequest(req, options) {
    if (!req.headers || !req.headers.authorization) {
      throw new MissingRequiredHeadersError('authorization');
    }

    const { algorithms, requestLifetime = 300 } = options;

    /* Check the authorization scheme */
    let { authorization } = req.headers;
    const scheme = 'signature';
    const prefix = authorization.substring(0, scheme.length).toLowerCase();
    if (prefix !== scheme) {
      throw new BadAuthenticationSchemeError();
    }

    /* Get the signature parameters */
    authorization = authorization.substring(scheme.length).trim();
    const parts = authorization.split(',');
    const signatureParams = {};
    for (const part of parts) {
      const index = part.indexOf('="');
      const key = part.substring(0, index).toLowerCase();
      const value = part.substring(index + 2, part.length - 1);
      signatureParams[key] = value;
    }

    /* Check if the signature param exists */
    const requiredParams = ['keyid', 'algorithm', 'signature'];
    const missingSignatureParams = [];
    for (const param of requiredParams) {
      if (!signatureParams[param.toLowerCase()]) {
        missingSignatureParams.push(param);
      }
    }
    if (missingSignatureParams.length > 0) {
      throw new MissingRequiredSignatureParamsError(...missingSignatureParams);
    }

    /* If "headers" param not exists use the date HTTP header by default */
    signatureParams.headers = signatureParams.headers ? signatureParams.headers.toLowerCase().split(' ') : ['date'];

    /* Check algoritm */
    if (algorithms.indexOf(signatureParams.algorithm) === -1) {
      throw new UnsupportedAlgorithmError(...algorithms);
    }

    /* Check if the request if expired */
    if (signatureParams.headers.indexOf('date') !== -1 && req.headers.date && requestLifetime) {
      /* Check if the request is not expired */
      const currentDate = new Date().getTime();
      const requestDate = Date.parse(req.headers.date);
      if (Number.isNaN(requestDate)) {
        throw new BadHeaderFormatError('date', '<day-name>, <day> <month> <year> <hour>:<minute>:<second> GMT');
      }

      if (Math.abs(currentDate - requestDate) >= requestLifetime * 1000) {
        throw new ExpiredRequestError();
      }
    }

    /* Create the signature string */
    const missingRequiredHeaders = [];
    signatureParams.signingString = '';
    signatureParams.headers.forEach((header, index, arr) => {
      if (header === '(request-target)') {
        signatureParams.signingString += `(request-target): ${req.method.toLowerCase()} ${req.path}`;
      } else if (req.headers[header]) {
        signatureParams.signingString += `${header}: ${req.headers[header]}`;
      } else {
        missingRequiredHeaders.push(header);
      }
      if (index < arr.length - 1) {
        signatureParams.signingString += '\n';
      }
    });

    if (missingRequiredHeaders.length > 0) {
      throw new MissingRequiredHeadersError(...missingRequiredHeaders);
    }

    return signatureParams;
  }
};
