const chai = require('chai');
const crypto = require('crypto');
const algorithm = require('../lib/algorithm');
const errors = require('../lib/errors');

describe('Algorithm', () => {
  describe('Failure tests', () => {
    it('should throw if the algorithms type is unsupported', () => {
      chai.expect(() => algorithm.create()).to.throw(errors.UnsupportedAlgorithmError);
    });
  });

  describe('work tests', () => {
    before(() => {
      this.checkHmac = function checkHmac(type, data, secret) {
        const hmac = algorithm.create(`hmac-${type}`, secret);
        chai.expect(hmac).to.be.an.instanceof(crypto.Hmac);
        const h1 = crypto
          .createHmac(type, secret)
          .update(data)
          .digest('hex');
        const h2 = hmac.update(data).digest('hex');
        chai.expect(h1).to.equal(h2);
      };
    });
    it('should return a HMAC-SHA1 algorithm', () => {
      this.checkHmac('sha1', 'test', 'secret');
    });

    it('should return a HMAC-SHA256 algorithm', () => {
      this.checkHmac('sha256', 'test', 'secret');
    });

    it('should return a HMAC-SHA512 algorithm', () => {
      this.checkHmac('sha512', 'test', 'secret');
    });
  });
});
