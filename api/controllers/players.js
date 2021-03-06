const HttpStatus = require('http-status-codes');
const playersService = require('../services/players');

function getPlayer(req, res, next) {
  const { groupId, playerId } = req.getAllParams();
  playersService.getPlayer({ groupId, playerId })
    .then((player) => {
      res.send(player);
    })
    .catch(next);
}
function getPlayers(req, res, next) {
  const { groupId, limit, offset } = req.getAllParams();
  const { userContext } = req;
  const userId = userContext.id;
  playersService.getPlayers(groupId, userId, limit, offset)
    .then((result) => {
      res.send(result);
    })
    .catch(next);
}

function createPlayer(req, res, next) {
  const { groupId } = req.getAllParams();
  const data = req.getBody();
  playersService.createPlayer(groupId, data)
    .then((player) => {
      res.status(HttpStatus.CREATED).send(player);
    })
    .catch(next);
}

function updatePlayer(req, res, next) {
  const { groupId, playerId } = req.getAllParams();
  const data = req.getBody();
  playersService.updatePlayer(groupId, playerId, data)
    .then((player) => {
      res.send(player);
    })
    .catch(next);
}
function deletePlayer(req, res, next) {
  const { groupId, playerId } = req.getAllParams();
  const { userContext } = req;
  const userId = userContext.id;
  playersService.deletePlayer(groupId, userId, playerId)
    .then(() => {
      res.status(HttpStatus.NO_CONTENT).send({ deleted: true });
    })
    .catch(next);
}

module.exports = {
  createPlayer,
  getPlayer,
  getPlayers,
  updatePlayer,
  deletePlayer,
};
