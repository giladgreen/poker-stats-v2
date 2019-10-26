const uuid = require('uuid');

function getFitting() {
  return function TransactionId({ request, response }, next) {
    try {
      request.tid = uuid();
      response.setHeader('Transaction-ID', request.tid);
      next();
    } catch (error) {
      next(error);
    }
  };
}


// eslint-disable-next-line no-unused-vars
module.exports = getFitting;
