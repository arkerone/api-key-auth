/* eslint-disable max-len */

const chai = require('chai');
const errors = require('../lib/errors');
const apiKeyAuth = require('../lib');

describe('ApiKeyAuth', () => {
  describe('Failure tests', () => {
    it('should throw if the "getSecret" method is missing', () => {
      chai.expect(() => apiKeyAuth()).to.throw();
    });

    it('should throw if the "getSecret" method does not return the secret key', () => {
      const req = {
        headers: {
          authorization: 'Signature keyid="123456789",algorithm="hmac-sha1",signature="Slpm4XpaxXaYPx75x5mnDUxmIEA="',
          date: 'Tue, 10 Apr 2018 10:30:32 GMT'
        }
      };
      const middleware = apiKeyAuth({
        getSecret: (keyId, done) => {
          done(null, null, null);
        },
        requestLifetime: null
      });
      chai
        .expect(() => middleware(req))
        .to.throw('The method "getSecret" must return the secret key through the callback function');
    });
  });

  describe('work tests', () => {
    it('should skip on CORS preflight if authorization header is present ', () => {
      const res = {};
      const req = {
        method: 'OPTIONS',
        headers: {
          'access-control-request-headers': 'test1, test2,  authorization'
        }
      };
      const middleware = apiKeyAuth({
        getSecret: () => {}
      });
      middleware(req, res, (err) => {
        chai.expect(!err).to.be.true;
      });
    });

    it('should failed the CORS preflight if authorization header is missing', () => {
      const res = {};
      const req = {
        method: 'OPTIONS',
        headers: {
          'access-control-request-headers': 'test1, test2'
        }
      };
      const middleware = apiKeyAuth({
        getSecret: () => {}
      });
      middleware(req, res, (err) => {
        chai.expect(err).to.be.an.instanceof(errors.MissingRequiredHeadersError);
      });
    });

    it('should return a parsing error', () => {
      const res = {};
      const req = {};
      const middleware = apiKeyAuth({
        getSecret: () => {}
      });
      middleware(req, res, (err) => {
        chai.expect(!!err).to.be.true;
      });
    });

    it('should return a UnauthorizedError', () => {
      const res = {};
      const req = {
        headers: {
          authorization: 'Signature keyid="123456789",algorithm="hmac-sha1",signature="Slpm4XpaxXaYPx75x5mnDUxmIEA="',
          date: 'Wed, 21 Oct 2015 07:28:00 GMT'
        }
      };
      const middleware = apiKeyAuth({
        getSecret: (keyId, done) => {
          done(new Error('Unauthorized'), null, null);
        },
        requestLifetime: null
      });
      middleware(req, res, (err) => {
        chai.expect(err).to.be.an.instanceof(errors.UnauthorizedError);
        chai.expect(err.message).to.equal('Unauthorized');
      });
    });

    it('should return a BadSignatureError', () => {
      const res = {};
      const req = {
        headers: {
          authorization:
            'Signature keyid="123456789",algorithm="hmac-sha1",headers="(request-target) host date",signature="d3Jvbmdfc2lnbmF0dXJl"',
          date: 'Tue, 10 Apr 2018 10:30:32 GMT',
          host: 'http://localhost'
        },
        method: 'GET',
        path: '/protected'
      };
      const middleware = apiKeyAuth({
        getSecret: (keyId, done) => {
          done(null, 'secret', null);
        },
        requestLifetime: null
      });
      middleware(req, res, (err) => {
        chai.expect(err).to.be.an.instanceof(errors.BadSignatureError);
      });
    });

    it('should authorize the request', () => {
      const res = {};
      const req = {
        headers: {
          authorization: 'Signature keyid="123456789",algorithm="hmac-sha1",signature="Slpm4XpaxXaYPx75x5mnDUxmIEA="',
          date: 'Tue, 10 Apr 2018 10:30:32 GMT',
          host: 'http://localhost'
        },
        method: 'GET',
        path: '/protected'
      };
      const middleware = apiKeyAuth({
        getSecret: (keyId, done) => {
          done(null, 'secret', {
            name: 'App1'
          });
        },
        requestLifetime: null
      });
      middleware(req, res, (err) => {
        chai.expect(!err).to.be.true;
        chai.expect(req.credentials.name).to.equal('App1');
      });
    });

    it('should change the request property name', () => {
      const res = {};
      const req = {
        headers: {
          authorization: 'Signature keyid="123456789",algorithm="hmac-sha1",signature="Slpm4XpaxXaYPx75x5mnDUxmIEA="',
          date: 'Tue, 10 Apr 2018 10:30:32 GMT',
          host: 'http://localhost'
        },
        method: 'GET',
        path: '/protected'
      };
      const middleware = apiKeyAuth({
        getSecret: (keyId, done) => {
          done(null, 'secret', {
            name: 'App1'
          });
        },
        requestLifetime: null,
        requestProperty: 'client'
      });
      middleware(req, res, (err) => {
        chai.expect(!err).to.be.true;
        chai.expect(req.client.name).to.equal('App1');
      });
    });
  });
});
