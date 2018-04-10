/**
 * @author Axel SHAÏTA <shaita.axel@gmail.com>
 * MIT Licensed
 */

const {
  MissingRequiredHeadersError,
  MissingRequiredSignatureParamsError,
  BadAuthenticationSchemeError
} = require('./errors');

module.exports = {
  /**
   * @function
   * @public
   * @description Parse the request and extract the signature parameters
   * @param {Object} req The request
   * @return {Object} Signature parameters
   * @throws {MissingRequiredHeadersError}
   * @throws {MissingRequiredSignatureParamsError}
   * @throws {BadAuthenticationSchemeError}
   */
  parseRequest(req) {
    if (!req.headers || !req.headers.authorization) {
      throw new MissingRequiredHeadersError('authorization');
    }

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

    /* Check the signature params */
    const missingSignatureParams = [];
    if (signatureParams.headers) {
      signatureParams.headers = signatureParams.headers.toLowerCase().split(' ');
    } else {
      /* By default use the date header */
      signatureParams.headers = [];
      signatureParams.headers.push('date');
    }
    if (!signatureParams.keyid) {
      missingSignatureParams.push('keyId');
    }
    if (!signatureParams.algorithm) {
      missingSignatureParams.push('algorithm');
    }
    if (!signatureParams.signature) {
      missingSignatureParams.push('signature');
    }
    if (missingSignatureParams.length > 0) {
      throw new MissingRequiredSignatureParamsError(...missingSignatureParams);
    }

    /* Create the signature string */
    const missingRequiredHeaders = [];
    signatureParams.signingString = '';
    for (const header of signatureParams.headers) {
      if (header === '(request-target)') {
        signatureParams.signingString += `(request-target): ${req.method.toLowerCase()} ${req.path}\n`;
      } else if (req.headers[header]) {
        signatureParams.signingString += `${header}: ${req.headers[header]}`;
      } else {
        missingRequiredHeaders.push(header);
      }
    }
    if (missingRequiredHeaders.length > 0) {
      throw new MissingRequiredHeadersError(...missingRequiredHeaders);
    }

    return signatureParams;
  }
};
