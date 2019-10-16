const sinon = require('sinon');
const { badRequest } = require('boom');
const should = require('should');
const ErrorHandler = require('../../../api/swagger/errorHandler');
const logger = require('../../../api/services/logger');

describe('swagger: errorHandler', function () {
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
  beforeEach(async function () {
    this.errorHandler = new ErrorHandler(logger);
    this.sandbox = sinon.createSandbox();
  });
  afterEach(function () {
    this.sandbox.restore();
  });
  describe('middleware()', function () {
    const response = {
      status: () => ({
        send: () => {
        },
      }),
    };
    describe('when no errorRaw', function () {
      it('should return false and do nothing', function (done) {
        const result = this.errorHandler.middleware(null, request, response, function () {
          done();
        });
        should(result).be.eql(false);
      });
    });
    describe('when errorRaw is Boom error', function () {
      it('should return correct status code and data', function () {
        const errorRaw = badRequest('message');
        const expectedStatus = 400;
        const expectedBody = {
          title: 'message',
        };
        const result = this.errorHandler.middleware(errorRaw, request, response, function () {});
        should(result).be.eql({
          statusCode: expectedStatus,
          body: expectedBody,
        });
      });
      it('should return correct status code and data', function () {
        const errorRaw = badRequest('message', { something: true });
        const expectedStatus = 400;
        const expectedBody = {
          title: 'message',
          details: {
            something: true,
          },
        };
        const result = this.errorHandler.middleware(errorRaw, request, response, function () {});
        should(result).be.eql({
          statusCode: expectedStatus,
          body: expectedBody,
        });
      });
    });
    describe('when errorRaw is swagger error', function () {
      it('should return correct status code and data', function () {
        const errorRaw = new Error('message');
        errorRaw.code = 'string';
        errorRaw.failedValidation = true;
        errorRaw.results = { errors: { something: true } };
        const expectedStatus = 400;
        const expectedBody = {
          title: 'message',
          details: {
            something: true,
          },
        };
        const result = this.errorHandler.middleware(errorRaw, request, response, function () {});
        should(result).be.eql({
          statusCode: expectedStatus,
          body: expectedBody,
        });
      });
      it('should return correct status code and data', function () {
        const errorRaw = new Error('message');
        errorRaw.code = 'string';
        const expectedStatus = 400;
        const expectedBody = {
          title: 'message',
        };
        const result = this.errorHandler.middleware(errorRaw, request, response, function () {});
        should(result).be.eql({
          statusCode: expectedStatus,
          body: expectedBody,
        });
      });
    });
    describe('when errorRaw is generic error', function () {
      it('should return correct status code and data', function () {
        const errorRaw = new Error('message');
        const expectedStatus = 500;
        const expectedBody = { title: 'An internal server error occurred' };
        const result = this.errorHandler.middleware(errorRaw, request, response, function () {});
        should(result).be.eql({
          statusCode: expectedStatus,
          body: expectedBody,
        });
      });
    });
    describe('when errorRaw is unknown error', function () {
      it('should return correct status code and data', function () {
        const errorRaw = 'message';
        const expectedStatus = 500;
        const expectedBody = { title: 'An internal server error occurred' };
        const result = this.errorHandler.middleware(errorRaw, request, response, function () {});
        should(result).be.eql({
          statusCode: expectedStatus,
          body: expectedBody,
        });
      });
    });
  });
});
