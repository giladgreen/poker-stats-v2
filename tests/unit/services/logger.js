const sinon = require('sinon');
const loggerService = require('../../../api/services/logger');

describe('services: logger', function () {
  beforeEach(async function () {
    this.sandbox = sinon.createSandbox();
  });
  afterEach(function () {
    this.sandbox.restore();
  });
  describe('debug', function () {
    it('should write text to console', async function () {
      loggerService.debug('text');
    });
  });

  describe('info', function () {
    it('should write text to console', async function () {
      loggerService.info('text');
    });
  });

  describe('warn', function () {
    it('should write text to console', async function () {
      loggerService.warn('text');
    });
  });

  describe('error', function () {
    it('should write text to console', async function () {
      loggerService.error('text');
    });
  });
});
