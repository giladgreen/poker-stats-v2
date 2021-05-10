

const __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
const logger_1 = __importDefault(require('../services/logger'));

function loggerMiddlewares(request, response, next) {
  const startTime = new Date();
  const imageCall = request.url.indexOf('player-stack-image') >= 0 && request.method.toLowerCase() === 'post';
  if (!imageCall) {
    logger_1.default.debug('[fitting:logger]: incoming request', {
      method: request.method,
      url: request.url,
    });
  }
  response.on('finish', () => {
    if (!imageCall || response.statusCode > 200) {
      const endTime = new Date();
      // @ts-ignore
      logger_1.default.debug('[fitting:logger]: outgoing response', {
        nl: '', method: request.method, url: request.url, status: response.statusCode, duration: endTime - startTime,
      });
    }
  });
  next();
}
exports.default = loggerMiddlewares;
// # sourceMappingURL=logger.js.map
