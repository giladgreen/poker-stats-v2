

var __assign = (this && this.__assign) || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (const p in s) { if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]; }
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
Object.defineProperty(exports, '__esModule', { value: true });
/**
 * Utils for swagger node
 */
const Utils = /** @class */ (function () {
  function Utils() {
  }
  /**
       * Get all parameters that were defined in Swagger file from the request
       * @param   {Object}                request
       * @returns {Map<String, String>}
       */
  Utils.getAllParams = function (request) {
    const base = __assign({}, request.query);
    return Object.keys(request.swagger.params).reduce((all, param) => {
      let _a;
      if (param === 'body') {
        return __assign(__assign({}, all), request.swagger.params[param].value);
      }
      return __assign(__assign({}, all), (_a = {}, _a[param] = request.swagger.params[param].value, _a));
    }, base);
  };
  /**
       * Get body parameters from the request that were defined in the swagger file
       * @param   {Object}                request
       * @returns {Map<String, String>}
       */
  Utils.getBody = function (request) {
    return request.swagger.params.body.value;
  };
  /**
       * Middleware for each request
       * @param req
       * @param res
       * @param next
       */
  Utils.middleware = function (req, res, next) {
    req.getAllParams = function () { return Utils.getAllParams(req); };
    req.getBody = function () { return Utils.getBody(req); };
    next();
  };
  return Utils;
}());
exports.default = Utils;
// # sourceMappingURL=utils.js.map
