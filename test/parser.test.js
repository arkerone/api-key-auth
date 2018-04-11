/* eslint-disable max-len */
const chai = require('chai');
const crypto = require('crypto');
const { availableAlgorithms } = require('../lib/algorithm');
const errors = require('../lib/errors');
const parser = require('../lib/parser');

describe('Parser', () => {
  describe('Failure tests', () => {
    it('should throw if HTTP header "Authorization" is not present', () => {
      const req = {};
      chai.expect(() => parser.parseRequest(req, {})).to.throw(errors.MissingRequiredHeadersError);
    });

    it('should throw if the auth scheme of the HTTP header "Authorization" is not valid', () => {
      const req = {
        headers: {
          authorization: 'bad_scheme params'
        }
      };
      chai.expect(() => parser.parseRequest(req, {})).to.throw(errors.BadAuthenticationSchemeError);
    });

    it('should throw if the signature parameters are not valid', () => {
      const req = {
        headers: {
          authorization: 'Signature bad_params'
        }
      };
      chai.expect(() => parser.parseRequest(req, {})).to.throw(errors.MissingRequiredSignatureParamsError);
    });

    it('should throw if the algorithm is not supported', () => {
      const req = {
        headers: {
          authorization:
            'Signature keyid="123456789",algorithm="unknown_algorithm",headers="host date",signature="Slpm4XpaxXaYPx75x5mnDUxmIEA="'
        }
      };
      chai
        .expect(() =>
          parser.parseRequest(req, {
            algorithms: availableAlgorithms
          }))
        .to.throw(errors.UnsupportedAlgorithmError);
    });

    it('should throw if the HTTP header date is malformed', () => {
      const req = {
        headers: {
          authorization: 'Signature keyid="123456789",algorithm="hmac-sha1",signature="Slpm4XpaxXaYPx75x5mnDUxmIEA="',
          date: 'malformed_date'
        }
      };
      chai
        .expect(() =>
          parser.parseRequest(req, {
            algorithms: availableAlgorithms
          }))
        .to.throw(errors.BadHeaderFormatError);
    });

    it('should throw if the request is expired', () => {
      const req = {
        headers: {
          authorization: 'Signature keyid="123456789",algorithm="hmac-sha1",signature="Slpm4XpaxXaYPx75x5mnDUxmIEA="',
          date: 'Tue, 10 Apr 2018 10:30:32 GMT'
        }
      };
      chai
        .expect(() =>
          parser.parseRequest(req, {
            algorithms: availableAlgorithms
          }))
        .to.throw(errors.ExpiredRequestError);
    });

    it('should throw if required headers for signature are missing', () => {
      const req = {
        headers: {
          authorization:
            'Signature keyid="123456789",algorithm="hmac-sha1",headers="host date",signature="Slpm4XpaxXaYPx75x5mnDUxmIEA="'
        }
      };
      chai
        .expect(() =>
          parser.parseRequest(req, {
            algorithms: availableAlgorithms
          }))
        .to.throw(errors.MissingRequiredHeadersError);
    });
  });

  describe('work tests', () => {
    it('should return the parsing request', () => {
      const req = {
        headers: {
          authorization:
            'Signature keyId="123456789",algorithm="hmac-sha1",headers="(request-target) host date",signature="ay+nsBHNuPjNcCSPYDkJRD3Lm1g="',
          date: 'Tue, 10 Apr 2018 10:30:32 GMT',
          host: 'http://localhost'
        },
        method: 'GET',
        path: '/protected'
      };
      const expectedResult = {
        keyid: '123456789',
        algorithm: 'hmac-sha1',
        headers: ['(request-target)', 'host', 'date'],
        signature: 'ay+nsBHNuPjNcCSPYDkJRD3Lm1g=',
        signingString: '(request-target): get /protected\nhost: http://localhost\ndate: Tue, 10 Apr 2018 10:30:32 GMT'
      };
      const parsedRequest = parser.parseRequest(req, {
        algorithms: availableAlgorithms,
        requestLifetime: null
      });
      chai.expect(parsedRequest).to.deep.equal(expectedResult);
    });

    it('should return the parsing request (with request expiration checking)', () => {
      const currentDate = new Date().toString();
      const signingString = `(request-target): get /protected\nhost: http://localhost\ndate: ${currentDate}`;
      const signature = crypto
        .createHmac('sha1', 'secret')
        .update(signingString)
        .digest('base64');
      const req = {
        headers: {
          authorization: `Signature keyId="123456789",algorithm="hmac-sha1",headers="(request-target) host date",signature="${signature}"`,
          date: currentDate,
          host: 'http://localhost'
        },
        method: 'GET',
        path: '/protected'
      };
      const expectedResult = {
        keyid: '123456789',
        algorithm: 'hmac-sha1',
        headers: ['(request-target)', 'host', 'date'],
        signature,
        signingString
      };
      const parsedRequest = parser.parseRequest(req, {
        algorithms: availableAlgorithms,
        requestLifetime: 300
      });
      chai.expect(parsedRequest).to.deep.equal(expectedResult);
    });
  });
});
