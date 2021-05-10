

const __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const path_1 = __importDefault(require('path'));
const compression_1 = __importDefault(require('compression'));
const serve_favicon_1 = __importDefault(require('serve-favicon'));
const body_parser_1 = __importDefault(require('body-parser'));
const express_rate_limit_1 = __importDefault(require('express-rate-limit'));
const transaction_id_1 = __importDefault(require('./api/middlewares/transaction_id'));
const logger_1 = __importDefault(require('./api/middlewares/logger'));
const user_context_1 = __importDefault(require('./api/middlewares/user_context'));
const error_handler_1 = __importDefault(require('./api/middlewares/error_handler'));
const config_1 = require('./config');
const logger_2 = __importDefault(require('./api/services/logger'));
const games_1 = require('./api/controllers/games');
const groups_1 = require('./api/controllers/groups');
const images_1 = require('./api/controllers/images');
const invitation_1 = require('./api/controllers/invitation');
const notifications_1 = require('./api/controllers/notifications');
const players_1 = require('./api/controllers/players');
const keepalive_1 = require('./api/controllers/keepalive');
const terminate_1 = __importDefault(require('./api/helpers/terminate'));

const router = express_1.default.Router();
const app = express_1.default();
const limiter = express_rate_limit_1.default({
  windowMs: 10 * 60 * 1000,
  max: 5000, // limit each IP to 5000 requests per windowMs
});
const PUBLIC = path_1.default.join(__dirname, '../public');
console.log('#####,PUBLIC', PUBLIC);
const faviconPath = path_1.default.join(PUBLIC, 'favicon.png');
app.use(compression_1.default());
app.use(express_1.default.static(PUBLIC));
app.use(serve_favicon_1.default(faviconPath));
app.use(body_parser_1.default.urlencoded({
  extended: true,
}));
app.use(body_parser_1.default.json({ limit: '50mb', type: 'application/json' }));
app.disable('x-powered-by');
app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
app.use(limiter);
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Expose-Headers', '*');
  next();
});
// @ts-ignore
app.use(transaction_id_1.default);
// @ts-ignore
app.use(logger_1.default);
// @ts-ignore
app.use(user_context_1.default);
app.use('/api/v2', router);
logger_2.default.info('app started..');
logger_2.default.info('[lifecycle]: core service is booting up', {
  environment: config_1.NODE_ENV,
});
router.use('', games_1.gamesRoutes);
router.use('', groups_1.groupsRoutes);
router.use('', images_1.imagesRoutes);
router.use('', invitation_1.invitationRoutes);
router.use('', keepalive_1.keepAliveRoutes);
router.use('', notifications_1.notificationsRoutes);
router.use('', players_1.playersRoutes);
// @ts-ignore
app.use(error_handler_1.default);
app.listen(config_1.SERVER_PORT, () => {
  logger_2.default.info('### startListening ##');
  logger_2.default.info(`Node app is running on port:  ${config_1.SERVER_PORT}`);
});
exports.default = {
  server: app,
};
const exitHandler = terminate_1.default(app, {
  coredump: false, timeout: 500,
});
process.on('uncaughtException', exitHandler(1, 'Uncaught Exception'));
process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'));
process.on('SIGTERM', exitHandler(0, 'SIGTERM'));
process.on('SIGINT', exitHandler(0, 'SIGINT'));
// # sourceMappingURL=app.js.map
