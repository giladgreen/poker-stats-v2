const uuidV4 = require('uuid/v4');

function getFitting() {
  return function TransactionId({ request, response }, next) {
    try {
      request.tid = uuidV4();
      response.setHeader('Transaction-ID', request.tid);
      next();
    } catch (error) {
      next(error);
    }
  };
}


// eslint-disable-next-line no-unused-vars
module.exports = getFitting;
