const HttpStatus = require('http-status-codes');
const keepAliveRoutes = require('express').Router({ mergeParams: true });

function keepAlive(req, res) {
  res.status(HttpStatus.OK).send({ status: 'still alive' });
}

keepAliveRoutes.get('/keep-alive', keepAlive);

module.exports = {
  keepAlive,
  keepAliveRoutes,
};
