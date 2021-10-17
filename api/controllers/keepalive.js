const axios = require('axios');
const HttpStatus = require('http-status-codes');
const keepAliveRoutes = require('express').Router({ mergeParams: true });
const logger = require('../services/logger');

function keepAlive(req, res) {
  res.status(HttpStatus.OK).send({ status: 'still alive' });
}

keepAliveRoutes.get('/keep-alive', keepAlive);

module.exports = {
  keepAlive,
  keepAliveRoutes,
};

setInterval(() => {
  try {
    logger.debug('calling wolt site');
    axios.get('https://wolt-wrapper.herokuapp.com');
  } catch (e) {
    logger.debug(e);
  }
}, 1000 * 60 * 30);
