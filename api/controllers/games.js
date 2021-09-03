const HttpStatus = require('http-status-codes');
const gamesRoutes = require('express').Router({ mergeParams: true });
const gamesService = require('../services/games');
const models = require('../models');
const logger = require('../services/logger');
const userContextMiddlewares = require('../middlewares/user_context');


function getGame(req, res, next) {
  const { userContext } = req;
  const { gameId, groupId } = req.params;
  gamesService.getGame({ userContext, groupId, gameId })
    .then((game) => {
      res.send(game);
    })
    .catch(next);
}

async function filterResults(res, userId, hideGames) {
  if (!hideGames) {
    return res;
  }
  const userPlayer = await models.usersPlayers.findOne({
    where: {
      userId,
    },
  });

  if (!userPlayer) {
    return res;
  }
  logger.info('filterResults userPlayer exist', { userId, hideGames, userPlayer: userPlayer.toJSON(), countBeforeFilter: res.results.length });

  const filteredResults = res.results.filter(game => !game.hideFromSome);
  logger.info('filterResults after filter', { countAfterFilter: filteredResults.length });

  return {
    metadata: res.metadata,
    results: filteredResults,
  };
}

function getGames(req, res, next) {
  const { groupId } = req.params;
  const { userContext: { id: userId, hideGames }, query: { limit, offset } } = req;

  gamesService.getGames(groupId, limit, offset)
    .then((result) => {
      filterResults(result, userId, hideGames).then(filteredResult => res.send(filteredResult)).catch(next);
    })
    .catch(next);
}

function createGame(req, res, next) {
  const { groupId } = req.params;
  const data = req.body;
  gamesService.createGame(groupId, data)
    .then((game) => {
      res.status(HttpStatus.CREATED).send(game);
    })
    .catch(next);
}

function updateGame(req, res, next) {
  const { groupId, gameId } = req.params;
  const data = req.body;

  const { userContext } = req;

  gamesService.updateGame(userContext, groupId, gameId, data)
    .then((game) => {
      res.send(game);
    })
    .catch(next);
}

function deleteGame(req, res, next) {
  const { groupId, gameId } = req.params;
  const { userContext } = req;

  gamesService.deleteGame(userContext, groupId, gameId)
    .then(() => {
      res.status(HttpStatus.NO_CONTENT).send({ deleted: true });
    })
    .catch(next);
}

gamesRoutes.get('/groups/:groupId/games', userContextMiddlewares, getGames);
gamesRoutes.post('/groups/:groupId/games', userContextMiddlewares, createGame);
gamesRoutes.get('/groups/:groupId/games/:gameId', userContextMiddlewares, getGame);
gamesRoutes.patch('/groups/:groupId/games/:gameId', userContextMiddlewares, updateGame);
gamesRoutes.delete('/groups/:groupId/games/:gameId', userContextMiddlewares, deleteGame);

module.exports = {
  createGame,
  getGame,
  getGames,
  updateGame,
  deleteGame,
  gamesRoutes,
};
