/**
 * Utils for swagger node
 */
class Utils {
  /**
     * Get all parameters that were defined in Swagger file from the request
     * @param   {Object}                request
     * @returns {Map<String, String>}
     */
  static getAllParams(request) {
    return Object.keys(request.swagger.params).reduce((all, param) => {
      if (param === 'body') {
        return {
          ...all,
          ...request.swagger.params[param].value,
        };
      }
      return {
        ...all,
        [param]: request.swagger.params[param].value,
      };
    }, {});
  }

  /**
     * Get body parameters from the request that were defined in the swagger file
     * @param   {Object}                request
     * @returns {Map<String, String>}
     */
  static getBody(request) {
    return request.swagger.params.body.value;
  }

  /**
     * Middleware for each request
     * @param req
     * @param res
     * @param next
     */
  static middleware(req, res, next) {
    req.getAllParams = () => Utils.getAllParams(req);
    req.getBody = () => Utils.getBody(req);
    next();
  }
}

module.exports = Utils;
