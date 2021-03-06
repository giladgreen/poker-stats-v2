const HttpStatus = require('http-status-codes');
const gamesService = require('../services/games');

function getGame(req, res, next) {
  const { userContext } = req;
  const { groupId, gameId } = req.getAllParams();
  gamesService.getGame({ userContext, groupId, gameId })
    .then((game) => {
      res.send(game);
    })
    .catch(next);
}

async function filterResults(res, userId, hideGames) {
  if (!hideGames){
    return res;
  }
  const userPlayer = await models.usersPlayers.findOne({
    where: {
      userId,
    },
  });

  if (!userPlayer){
    return res;
  }

  const filteredResults = res.results.filter(game => game.playersData.some(playData => playData.playerId === userPlayer.playerId));
  return {
    metadata: res.metadata,
    results: filteredResults,
  };
}
function getGames(req, res, next) {
  const { groupId, limit, offset } = req.getAllParams();
  const { userContext: { id: userId, hideGames } } = req;

  gamesService.getGames(groupId, limit, offset)
    .then((result) => {
      filterResults(result, userId, hideGames).then(filteredResult => res.send(filteredResult)).catch(next);
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
  const { userContext } = req;

  gamesService.updateGame(userContext, groupId, gameId, data)
    .then((game) => {
      res.send(game);
    })
    .catch(next);
}
function deleteGame(req, res, next) {
  const { groupId, gameId } = req.getAllParams();
  const { userContext } = req;

  gamesService.deleteGame(userContext, groupId, gameId)
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
