

const __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
const utils_1 = __importDefault(require('../swagger/utils'));
// @ts-ignore
const utilsMiddlewares = function (request, response, next) { return utils_1.default.middleware(request, response, next); };
exports.default = utilsMiddlewares;
// # sourceMappingURL=utils.js.map
