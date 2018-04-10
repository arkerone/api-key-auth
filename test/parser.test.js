/* eslint-disable max-len */
const chai = require('chai');
const errors = require('../lib/errors');
const parser = require('../lib/parser');

describe('Failure tests', () => {
  it('should throw if HTTP header "Authorization" is not present', () => {
    const req = {};
    chai.expect(() => parser.parseRequest(req)).to.throw(errors.MissingRequiredHeadersError);
  });

  it('should throw if the auth scheme of the HTTP header "Authorization" is not valid', () => {
    const req = {
      headers: {
        authorization: 'bad_scheme params'
      }
    };
    chai.expect(() => parser.parseRequest(req)).to.throw(errors.BadAuthenticationSchemeError);
  });

  it('should throw if the signature parameters are not valid', () => {
    const req = {
      headers: {
        authorization: 'Signature bad_params'
      }
    };
    chai.expect(() => parser.parseRequest(req)).to.throw(errors.MissingRequiredSignatureParamsError);
  });

  it('should throw if required headers for signature are missing', () => {
    const req = {
      headers: {
        authorization:
          'Signature keyid="123456789",algorithm="hmac-sha1",headers="host date",signature="Slpm4XpaxXaYPx75x5mnDUxmIEA="'
      }
    };
    chai.expect(() => parser.parseRequest(req)).to.throw(errors.MissingRequiredHeadersError);
  });
});

describe('work tests', () => {
  it('should return the parsing request', () => {
    const req = {
      headers: {
        authorization:
          'Signature keyid="123456789",algorithm="hmac-sha1",headers="(request-target) host date",signature="Slpm4XpaxXaYPx75x5mnDUxmIEA="',
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
      signature: 'Slpm4XpaxXaYPx75x5mnDUxmIEA=',
      signingString: '(request-target): get /protected\nhost: http://localhostdate: Tue, 10 Apr 2018 10:30:32 GMT'
    };
    const parsedRequest = parser.parseRequest(req);
    chai.expect(parsedRequest).to.deep.equal(expectedResult);
  });
});
