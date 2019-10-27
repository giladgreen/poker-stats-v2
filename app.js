const SwaggerExpress = require('swagger-express-mw');

const express = require('express');

const app = express();
const path = require('path');
const compression = require('compression');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const { NODE_ENV, SERVER_PORT } = require('./config.js');
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
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Expose-Headers', '*');
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
  environment: NODE_ENV,
});


/*
createMiddleware('PetStore.yaml', app, function(err, middleware) {
  app.use(middleware.metadata());
  app.use(middleware.CORS());

  // Show the CORS headers as HTML
  app.use(function(req, res, next) {
    res.send('<pre>' + util.inspect(res._headers) + '</pre>');
  });

  app.listen(8000, function() {
    console.log('Go to http://localhost:8000/pets');
  });
});
*/
SwaggerExpress.create(config, (err, swaggerExpress) => {
  if (err) { throw err; }


  swaggerExpress.register(app);


  const port = SERVER_PORT;
  logger.info('port', port);
  app.listen(port);
  logger.info('[lifecycle]: core service is now listening', {
    port,
  });
});

module.exports = {
  server: app,
};
