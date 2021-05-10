

Object.defineProperty(exports, '__esModule', { value: true });
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
const boom_1 = require('boom');
/**
 * Error handler class
 */
const ErrorHandler = /** @class */ (function () {
  /**
       * Constructor
       * @param   {Object}  logger
       */
  function ErrorHandler(logger) {
    this.logger = logger;
  }
  /**
       * Middleware for each request
       * @param req
       * @param res
       * @param next
       */
  ErrorHandler.prototype.middleware = function (errorRaw, _req, res, next) {
    console.log('error middleware, ', errorRaw);
    if (!errorRaw) {
      next();
      return false;
    }
    const error = this.handleBoomError(errorRaw)
            || this.handleSwaggerError(errorRaw)
            || this.handleGenericError(errorRaw)
            || this.handleUnknownError(errorRaw);
    res.status(error.statusCode).send(error.body);
    return error;
  };
  /**
       * Handle boom errors
       * @param   {Object}            error
       * @returns {Object|Boolean}
       */
  ErrorHandler.prototype.handleBoomError = function (error) {
    if (boom_1.isBoom(error)) {
      // this.logger.error('[module:swagger-error-handler]: BoomError was produced', JSON.stringify(error));
      const _a = error.output; const statusCode = _a.statusCode; const
        message = _a.payload.message;
      const body = {
        title: message,
      };
      if (error.data) {
        // @ts-ignore
        body.details = error.data;
      }
      return {
        statusCode,
        body,
      };
    }
    return false;
  };
  /**
       * Handle swagger errors
       * @param   {Object}            error
       * @returns {Object|Boolean}
       */
  ErrorHandler.prototype.handleSwaggerError = function (error) {
    // @ts-ignore
    if (error instanceof Error && typeof error.code === 'string') {
      // this.logger.error('[module:swagger-error-handler]: native Swagger error was produced', JSON.stringify(error));
      const body = {
        title: error.message,
      };
      // @ts-ignore
      if (error.failedValidation && error.results) {
        // @ts-ignore
        body.details = error.results.errors;
      }
      return {
        statusCode: 400,
        body,
      };
    }
    return false;
  };
  /**
       * Handle generic errors (not boom and not swagger)
       * @param   {Object}            error
       * @returns {Object|Boolean}
       */
  ErrorHandler.prototype.handleGenericError = function (error) {
    if (error instanceof Error) {
      // this.logger.error('[module:swagger-error-handler]: some unexpected error happened', error);
      return {
        statusCode: 500,
        body: { title: 'An internal server error occurred' },
      };
    }
    return false;
  };
  /**
       * Handle generic errors
       * @param   {Object}            error
       * @returns {Object|Boolean}
       */
  ErrorHandler.prototype.handleUnknownError = function (error) {
    this.logger.error(`[module:swagger-error-handler]: some unexpected error happened, which is not an instance of Error class, ${error.message}`);
    return {
      statusCode: 500,
      body: { title: 'An internal server error occurred' },
    };
  };
  return ErrorHandler;
}());
exports.default = ErrorHandler;
// # sourceMappingURL=errorHandler.js.map
