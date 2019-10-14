const ErrorHandler = require('../swagger/errorHandler');
const logger = require('../services/logger');

function getFitting() {
  const errorHandler = new ErrorHandler(logger);
  return function errorHandlerer({ error, request, response }, next) {
    errorHandler.middleware(error, request, response, next);
  };
}

// eslint-disable-next-line no-unused-vars
module.exports = getFitting;
