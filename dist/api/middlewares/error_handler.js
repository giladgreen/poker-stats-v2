

const __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
const errorHandler_1 = __importDefault(require('../swagger/errorHandler'));
const logger_1 = __importDefault(require('../services/logger'));

const errorHandler = new errorHandler_1.default(logger_1.default);
function errorHandlerMiddleware(error, req, res, next) {
  return errorHandler.middleware(error, req, res, next);
}
exports.default = errorHandlerMiddleware;
// # sourceMappingURL=error_handler.js.map
