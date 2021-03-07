/* eslint-disable class-methods-use-this */

const { isBoom } = require('boom');

/**
 * Error handler class
 */
class ErrorHandler {
  /**
     * Constructor
     * @param   {Object}  logger
     */
  constructor(logger) {
    this.logger = logger;
  }

  /**
     * Middleware for each request
     * @param req
     * @param res
     * @param next
     */
  middleware(errorRaw, req, res, next) {
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
  }

  /**
     * Handle boom errors
     * @param   {Object}            error
     * @returns {Object|Boolean}
     */
  handleBoomError(error) {
    if (isBoom(error)) {
      // this.logger.error('[module:swagger-error-handler]: BoomError was produced', JSON.stringify(error));
      const { output: { statusCode, payload: { message } } } = error;
      const body = {
        title: message,
      };
      if (error.data) {
        body.details = error.data;
      }
      return {
        statusCode,
        body,
      };
    }
    return false;
  }

  /**
     * Handle swagger errors
     * @param   {Object}            error
     * @returns {Object|Boolean}
     */
  handleSwaggerError(error) {
    if (error instanceof Error && typeof error.code === 'string') {
      // this.logger.error('[module:swagger-error-handler]: native Swagger error was produced', JSON.stringify(error));
      const body = {
        title: error.message,
      };
      if (error.failedValidation && error.results) {
        body.details = error.results.errors;
      }
      return {
        statusCode: 400,
        body,
      };
    }
    return false;
  }

  /**
     * Handle generic errors (not boom and not swagger)
     * @param   {Object}            error
     * @returns {Object|Boolean}
     */
  handleGenericError(error) {
    if (error instanceof Error) {
      // this.logger.error('[module:swagger-error-handler]: some unexpected error happened', error);
      return {
        statusCode: 500,
        body: { title: 'An internal server error occurred' },
      };
    }

    return false;
  }

  /**
     * Handle generic errors
     * @param   {Object}            error
     * @returns {Object|Boolean}
     */
  handleUnknownError(error) {
    this.logger.error(`[module:swagger-error-handler]: some unexpected error happened, which is not an instance of Error class, ${error.message}`);
    return {
      statusCode: 500,
      body: { title: 'An internal server error occurred' },
    };
  }
}

module.exports = ErrorHandler;
