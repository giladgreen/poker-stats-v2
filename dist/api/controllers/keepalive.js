

const __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
exports.keepAlive = exports.keepAliveRoutes = void 0;
const http_status_codes_1 = __importDefault(require('http-status-codes'));
const express_1 = __importDefault(require('express'));

exports.keepAliveRoutes = express_1.default.Router();
function keepAlive(_req, res) {
  res.status(http_status_codes_1.default.OK).send({ status: 'still alive' });
}
exports.keepAlive = keepAlive;
// @ts-ignore
exports.keepAliveRoutes.get('/keep-alive', keepAlive);
// # sourceMappingURL=keepalive.js.map
