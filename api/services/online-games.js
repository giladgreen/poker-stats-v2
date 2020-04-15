const models = require('../models');

async function createGame(gameCreatorData) {
  const newGameData = {
    startDate: null,
    smallBlind: gameCreatorData.smallBlind,
    bigBlind: gameCreatorData.bigBlind,
    time: gameCreatorData.time,
    currency: gameCreatorData.currency,
    board: [],
    pot: 0,
    timer: gameCreatorData.time,
    players: [{
      id: gameCreatorData.id,
      name: gameCreatorData.name,
      balance: gameCreatorData.balance,
    }],
  };
  const newGame = await models.onlineGames.create(newGameData);
  return newGame.toJSON();
}
async function onCreateGameEvent(socket, gameCreatorData) {
  try {
    const newGame = await createGame(gameCreatorData);
    socket.emit('gameCreated', newGame);
  } catch (e) {
    socket.emit('error', { message: 'failed to create game', metadata: e });
  }
}

async function onJoinGameEvent(socket, info) {
  try {
    const { gameId } = info;
    const game = await models.onlineGames.findOne({ where: { id: gameId } });
    if (!game) {
      throw new Error('did not found game in DB');
    }
  } catch (e) {
    socket.emit('error', { message: 'failed to join game', metadata: e });
  }
}

function initNewConnection(socket) {
  socket.id = `${(new Date()).getTime()}`;
  socket.on('createGame', gameCreatorData => onCreateGameEvent(socket, gameCreatorData));
  socket.on('joinGame', info => onJoinGameEvent(socket, info));
}

module.exports = {
  initNewConnection,
};
