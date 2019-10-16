const should = require('should');
const swaggerUtils = require('../../../api/swagger/utils');

describe('swagger: Utils', function () {
  const request = {
    swagger: {
      params: {
        a: { value: 1 },
        b: { value: 2 },
        body: {
          value: {
            c: 3,
            d: 4,
          },
        },
      },
    },
  };
  describe('getAllParams()', function () {
    it('should return correct data', function () {
      const resultParams = swaggerUtils.getAllParams(request);
      should(resultParams).be.eql({
        a: 1,
        b: 2,
        c: 3,
        d: 4,
      });
    });
  });
  describe('getBody()', function () {
    it('should return correct data', function () {
      const resultParams = swaggerUtils.getBody(request);
      should(resultParams).be.eql({
        c: 3,
        d: 4,
      });
    });
  });
  describe('middleware()', function () {
    it('should return correct data', (done) => {
      const response = {};
      swaggerUtils.middleware(request, response, function () {
        request.should.have.property('getAllParams').which.is.a.Function();
        request.should.have.property('getBody').which.is.a.Function();
        const getAllParamsResult = request.getAllParams();
        should(getAllParamsResult).be.eql({
          a: 1,
          b: 2,
          c: 3,
          d: 4,
        });
        const getBodyResult = request.getBody();
        should(getBodyResult).be.eql({
          c: 3,
          d: 4,
        });
        done();
      });
    });
  });
});
