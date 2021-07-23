const HttpStatus = require('http-status-codes');
const playersRoutes = require('express').Router({ mergeParams: true });

const playersService = require('../services/players');

function getPlayer(req, res, next) {
  const { groupId, playerId } = req.params;
  playersService.getPlayer({ groupId, playerId })
    .then((player) => {
      res.send(player);
    })
    .catch(next);
}
function getPlayers(req, res, next) {
  const { groupId, limit, offset } = req.params;
  const { userContext } = req;
  const userId = userContext.id;
  playersService.getPlayers(groupId, userId, limit, offset)
    .then((result) => {
      res.send(result);
    })
    .catch(next);
}

function createPlayer(req, res, next) {
  const { groupId } = req.params;
  const data = req.body;
  playersService.createPlayer(groupId, data)
    .then((player) => {
      res.status(HttpStatus.CREATED).send(player);
    })
    .catch(next);
}

function updatePlayer(req, res, next) {
  const { groupId, playerId } = req.params;
  const data = req.body;
  playersService.updatePlayer(groupId, playerId, data)
    .then((player) => {
      res.send(player);
    })
    .catch(next);
}
function deletePlayer(req, res, next) {
  const { groupId, playerId } = req.params;
  const { userContext } = req;
  const userId = userContext.id;
  playersService.deletePlayer(groupId, userId, playerId)
    .then(() => {
      res.status(HttpStatus.NO_CONTENT).send({ deleted: true });
    })
    .catch(next);
}

playersRoutes.post('/groups/:groupId/players', createPlayer);
playersRoutes.get('/groups/:groupId/players', getPlayers);
playersRoutes.get('/groups/:groupId/players/:playerId', getPlayer);
playersRoutes.patch('/groups/:groupId/players/:playerId', updatePlayer);
playersRoutes.delete('/groups/:groupId/players/:playerId', deletePlayer);

module.exports = {
  createPlayer,
  getPlayer,
  getPlayers,
  updatePlayer,
  deletePlayer,
  playersRoutes,
};
