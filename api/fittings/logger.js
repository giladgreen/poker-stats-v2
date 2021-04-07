const log = require('../services/logger');

function getFitting() {
  return function logger({ request, response }, next) { // this is a global middleware
    const startTime = new Date();
    const imageCall = request.url.indexOf('player-stack-image') >= 0 && request.method.toLowerCase() === 'post';
    if (!imageCall) {
      log.debug('[fitting:logger]: incoming request', {
        method: request.method,
        url: request.url,
      });
    }

    response.on('finish', () => {
      if (!imageCall || response.statusCode > 200) {
        const endTime = new Date();
        log.debug('[fitting:logger]: outgoing response', {
          nl:'', method: request.method, url: request.url, status: response.statusCode, duration: endTime - startTime,
        });
      }
    });
    next();
  };
}

// eslint-disable-next-line no-unused-vars
module.exports = getFitting;
