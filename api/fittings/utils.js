const Utils = require('../swagger/utils');

function getFitting() {
  return function utils({ request, response }, next) {
    Utils.middleware(request, response, next);
  };
}

// eslint-disable-next-line no-unused-vars
module.exports = getFitting;
