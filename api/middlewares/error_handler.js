const ErrorHandler = require('../swagger/errorHandler');
const logger = require('../services/logger');

const errorHandler = new ErrorHandler(logger);

function errorHandlerMiddleware(error, req, res, next) {
  return errorHandler.middleware(error, req, res, next);
}

module.exports = errorHandlerMiddleware;
