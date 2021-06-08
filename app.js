const express = require('express');
const path = require('path');
const compression = require('compression');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const transactionIdMiddlewares = require('./api/middlewares/transaction_id');
const loggerMiddlewares = require('./api/middlewares/logger');
const userContextMiddlewares = require('./api/middlewares/user_context');
const errorHandler = require('./api/middlewares/error_handler');
const { NODE_ENV, SERVER_PORT } = require('./config');
const logger = require('./api/services/logger');
const { gamesRoutes } = require('./api/controllers/games');
const { groupsRoutes } = require('./api/controllers/groups');
const { imagesRoutes } = require('./api/controllers/images');
const { invitationRoutes } = require('./api/controllers/invitation');
const { notificationsRoutes } = require('./api/controllers/notifications');
const { playersRoutes } = require('./api/controllers/players');
const { keepAliveRoutes } = require('./api/controllers/keepalive');
const terminate = require('./api/helpers/terminate');

const router = express.Router();
const app = express();

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5000, // limit each IP to 5000 requests per windowMs
});

const PUBLIC = path.join(__dirname, 'public');
const faviconPath = path.join(PUBLIC, 'favicon.png');
app.use((request, response, next) => {
  if (request.method.toUpperCase() === 'OPTIONS') {
    response.send({});
  } else {
    next();
  }
});
app.use(compression());
app.use(express.static(PUBLIC));
app.use(favicon(faviconPath));
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
app.disable('x-powered-by');
app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
app.use(limiter);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Expose-Headers', '*');
  next();
});
app.use(transactionIdMiddlewares);
app.use(loggerMiddlewares);
app.use(userContextMiddlewares);
app.use('/api/v2', router);

logger.info('app started..');


logger.info('[lifecycle]: core service is booting up', {
  environment: NODE_ENV,
});


router.use('', gamesRoutes);
router.use('', groupsRoutes);
router.use('', imagesRoutes);
router.use('', invitationRoutes);
router.use('', keepAliveRoutes);
router.use('', notificationsRoutes);
router.use('', playersRoutes);
app.use(errorHandler);

app.listen(SERVER_PORT, () => {
  logger.info('### startListening ##');
  logger.info(`Node app is running on port:  ${SERVER_PORT}`);
});


module.exports = {
  server: app,
};

const exitHandler = terminate(app, {
  coredump: false, timeout: 500,
});
process.on('uncaughtException', exitHandler(1, 'Uncaught Exception'));
process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'));
process.on('SIGTERM', exitHandler(0, 'SIGTERM'));
process.on('SIGINT', exitHandler(0, 'SIGINT'));
