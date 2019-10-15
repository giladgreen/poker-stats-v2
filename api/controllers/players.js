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
    const { groupId } = req.getAllParams();
    playersService.getPlayers(groupId)
      .then((players) => {
        res.send({ metadata: { count: players.length }, players });
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

module.exports = {
    getPlayer,
    getPlayers,
    createPlayer
};

