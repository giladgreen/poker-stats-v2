const SwaggerExpress = require('swagger-express-mw');
const app = require('express')();
const logger = require('./api/services/logger');

console.log('app started..')
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
  console.log('port', port)
  app.listen(port);
  logger.info('[lifecycle]: core service is now listening', {
    port,
  });
});

module.exports = {
  server: app,
};
