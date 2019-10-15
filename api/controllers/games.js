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
    const { groupId } = req.getAllParams();
    gamesService.getGames(groupId)
      .then((games) => {
        res.send({ metadata: { count: games.length }, games });
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

module.exports = {
    getGame,
    getGames,
    createGame
};

