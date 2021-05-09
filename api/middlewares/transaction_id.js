const uuid = require('uuid');

function transactionIdMiddlewares(request, response, next) {
  try {
    request.tid = uuid();
    response.setHeader('Transaction-ID', request.tid);
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = transactionIdMiddlewares;
