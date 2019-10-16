const HttpStatus = require('http-status-codes');
const gamesService = require('../services/games');

function getGame(req, res, next) {
  const { groupId, gameId } = req.getAllParams();
  gamesService.getGame({ groupId, gameId })
    .then((game) => {
      res.send(game);
    })
    .catch(next);
}
function getGames(req, res, next) {
  const { groupId, limit, offset } = req.getAllParams();
  gamesService.getGames(groupId, limit, offset)
    .then((result) => {
      res.send(result);
    })
    .catch(next);
}

function createGame(req, res, next) {
  const { groupId } = req.getAllParams();
  const data = req.getBody();
  gamesService.createGame(groupId, data)
    .then((game) => {
      res.status(HttpStatus.CREATED).send(game);
    })
    .catch(next);
}

function updateGame(req, res, next) {
  const { groupId, gameId } = req.getAllParams();
  const data = req.getBody();
  gamesService.updateGame(groupId, gameId, data)
    .then((game) => {
      res.send(game);
    })
    .catch(next);
}
function deleteGame(req, res, next) {
  const { groupId, gameId } = req.getAllParams();
  gamesService.deleteGame(groupId, gameId)
    .then(() => {
      res.status(HttpStatus.NO_CONTENT).send({ deleted: true });
    })
    .catch(next);
}

module.exports = {
  createGame,
  getGame,
  getGames,
  updateGame,
  deleteGame,
};
