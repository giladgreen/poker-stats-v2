const Utils = require('../swagger/utils');

const utilsMiddlewares = (request, response, next) => Utils.middleware(request, response, next);

module.exports = utilsMiddlewares;
