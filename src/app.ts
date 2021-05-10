import express from 'express';
import path from 'path';
import compression from 'compression';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';

import transactionIdMiddlewares from './api/middlewares/transaction_id';
import loggerMiddlewares from './api/middlewares/logger';
import userContextMiddlewares from './api/middlewares/user_context';
import errorHandler from './api/middlewares/error_handler';
import { NODE_ENV, SERVER_PORT } from './config';
import logger from './api/services/logger';
import { gamesRoutes } from './api/controllers/games';
import { groupsRoutes } from './api/controllers/groups';
import { imagesRoutes } from './api/controllers/images';
import { invitationRoutes } from './api/controllers/invitation';
import { notificationsRoutes } from './api/controllers/notifications';
import { playersRoutes } from './api/controllers/players';
import { keepAliveRoutes } from './api/controllers/keepalive';
import terminate from './api/helpers/terminate';

const router = express.Router();
const app = express();

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5000, // limit each IP to 5000 requests per windowMs
});


const PUBLIC = path.join(__dirname, '../public');
console.log('#####,PUBLIC',PUBLIC)

const faviconPath = path.join(PUBLIC, 'favicon.png');
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

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Expose-Headers', '*');
  next();
});
// @ts-ignore
app.use(transactionIdMiddlewares);
// @ts-ignore
app.use(loggerMiddlewares);
// @ts-ignore
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
// @ts-ignore
app.use(errorHandler);

app.listen(SERVER_PORT, () => {
  logger.info('### startListening ##');
  logger.info(`Node app is running on port:  ${SERVER_PORT}`);
});


export default {
  server: app,
};

const exitHandler = terminate(app, {
  coredump: false, timeout: 500,
});
process.on('uncaughtException', exitHandler(1, 'Uncaught Exception'));
process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'));
process.on('SIGTERM', exitHandler(0, 'SIGTERM'));
process.on('SIGINT', exitHandler(0, 'SIGINT'));
