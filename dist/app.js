"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var compression_1 = __importDefault(require("compression"));
var serve_favicon_1 = __importDefault(require("serve-favicon"));
var body_parser_1 = __importDefault(require("body-parser"));
var express_rate_limit_1 = __importDefault(require("express-rate-limit"));
var transaction_id_1 = __importDefault(require("./api/middlewares/transaction_id"));
var logger_1 = __importDefault(require("./api/middlewares/logger"));
var user_context_1 = __importDefault(require("./api/middlewares/user_context"));
var error_handler_1 = __importDefault(require("./api/middlewares/error_handler"));
var config_1 = require("./config");
var logger_2 = __importDefault(require("./api/services/logger"));
var games_1 = require("./api/controllers/games");
var groups_1 = require("./api/controllers/groups");
var images_1 = require("./api/controllers/images");
var invitation_1 = require("./api/controllers/invitation");
var notifications_1 = require("./api/controllers/notifications");
var players_1 = require("./api/controllers/players");
var keepalive_1 = require("./api/controllers/keepalive");
var terminate_1 = __importDefault(require("./api/helpers/terminate"));
var router = express_1.default.Router();
var app = express_1.default();
var limiter = express_rate_limit_1.default({
    windowMs: 10 * 60 * 1000,
    max: 5000, // limit each IP to 5000 requests per windowMs
});
var PUBLIC = path_1.default.join(__dirname, '../public');
console.log('#####,PUBLIC', PUBLIC);
var faviconPath = path_1.default.join(PUBLIC, 'favicon.png');
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
app.use(function (_req, res, next) {
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
app.listen(config_1.SERVER_PORT, function () {
    logger_2.default.info('### startListening ##');
    logger_2.default.info("Node app is running on port:  " + config_1.SERVER_PORT);
});
exports.default = {
    server: app,
};
var exitHandler = terminate_1.default(app, {
    coredump: false, timeout: 500,
});
process.on('uncaughtException', exitHandler(1, 'Uncaught Exception'));
process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'));
process.on('SIGTERM', exitHandler(0, 'SIGTERM'));
process.on('SIGINT', exitHandler(0, 'SIGINT'));
//# sourceMappingURL=app.js.map