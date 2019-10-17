const SwaggerExpress = require('swagger-express-mw');
const express = require('express');

const app = express();
const path = require('path');
const compression = require('compression');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const logger = require('./api/services/logger');

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5000, // limit each IP to 5000 requests per windowMs
});

const PUBLIC = path.join(__dirname, 'public');
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

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, *');
  next();
});

logger.info('app started..');
/**
 * Swagger initialization on top of express
 */
const config = {
  appRoot: __dirname,
};

logger.info('[lifecycle]: core service is booting up', {
  environment: process.env.NODE_ENV,
});
SwaggerExpress.create(config, (err, swaggerExpress) => {
  if (err) { throw err; }

  swaggerExpress.register(app);

  const port = process.env.PORT || 5000;
  logger.info('port', port);
  app.listen(port);
  logger.info('[lifecycle]: core service is now listening', {
    port,
  });
});

module.exports = {
  server: app,
};
