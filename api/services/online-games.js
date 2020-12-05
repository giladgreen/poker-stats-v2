const logger = require('./logger');
// const models = require('../models');

const MAX_TABLE_PLAYERS = 8;
const Games = new Map();
const sockets = new Map();

async function saveGame(game) {
  Games.set(game.id, game);
}
async function safeGetGameById(id) {
  const game = Games.get(id);
  if (!game) {
    return null;
  }
  return game;
}


async function getGameById(id) {
  const game = await safeGetGameById(id)(id);
  if (!game) {
    throw new Error('did not found game in server');
  }
  return game;
}

//
// const mockGame = {
//   id: 123,
//   startDate: new Date(),
//   smallBlind: 0.5,
//   bigBlind: 1,
//   time: 40,
//   currentTimerTime: 40,
//   currency: '₪',
//   board: [],
//   pot: 7.5,
//   hand: 17,
//   players: [{
//     name: 'Gilad',
//     balance: 300,
//     cards: ['6C', '6S'],
//     active: true,
//     me: true,
//     options: ['Fold', 'Call', 'Raise'],
//   }, {
//     name: 'Saar',
//     balance: 50,
//   }, {
//     name: 'Ran',
//     balance: 400,
//     dealer: true,
//
//   }, {
//     name: 'Bar',
//     balance: 180,
//     pot: 0.5,
//     status: 'small',
//     small: true,
//   }, {
//     name: 'Hagai',
//     balance: 25,
//     status: 'big',
//     pot: 1,
//     big: true,
//   }, {
//     name: 'Michael',
//     balance: 120,
//     status: 'call',
//     pot: 1,
//   }, {
//     name: 'Ori',
//     balance: 90,
//     status: 'raise',
//     pot: 5,
//   }],
// };
//
// async function createGame(gameCreatorData) {
//   const newGameData = {
//     startDate: null,
//     hand: 1,
//     smallBlind: gameCreatorData.smallBlind,
//     bigBlind: gameCreatorData.bigBlind,
//     time: gameCreatorData.time,
//     currency: gameCreatorData.currency,
//     board: [],
//     pot: 0,
//     currentTimerTime: gameCreatorData.time,
//     players: [{
//       id: gameCreatorData.id,
//       name: gameCreatorData.name,
//       balance: gameCreatorData.balance,
//     }],
//   };
//   const newGame = await models.onlineGames.create(newGameData);
//   return newGame.toJSON();
// }
//

async function onCreateGameEvent(socket, gameCreatorData) {
  try {
    // save to db:
    // const newGame = await createGame(gameCreatorData);
    // newGame = newGame.toJSON();
    const id = `${(new Date()).getTime()}`;
    const newGame = {
      id,
      hand: 1,
      startDate: null,
      smallBlind: gameCreatorData.smallBlind,
      bigBlind: gameCreatorData.bigBlind,
      time: gameCreatorData.time,
      currentTimerTime: gameCreatorData.time,
      currency: gameCreatorData.currency,
      board: [],
      pot: 0,
      players: [{
        id: gameCreatorData.id,
        name: gameCreatorData.name,
        balance: gameCreatorData.balance,
      }],
    };
    await saveGame(newGame);
    sockets.set(id, {
      creator: socket,
      players: [socket],
    });

    socket.emit('gameCreated', newGame);
  } catch (e) {
    socket.emit('onerror', { message: 'failed to create game' });
  }
}

async function onGetGameDataEvent(socket, gameId) {
  try {
    const game = await getGameById(gameId);
    const privateGame = {
      ...game,
      players: game.players.map(p => ({
        id: p.id, name: p.name, balance: p.balance, options: [],
      })),
    };
    socket.emit('gameUpdate', privateGame);
  } catch (e) {
    socket.emit('onerror', { message: 'failed to join game', reason: e.message });
  }
}
async function onJoinGameEvent(socket, info) {
  try {
    const { gameId, playersInfo: { id, name, balance } } = info;
    const game = await getGameById(gameId);
    if (game.players.length >= MAX_TABLE_PLAYERS) {
      throw new Error('table full');
    }

    const socketsObject = sockets.get(gameId);
    sockets.set(gameId, {
      creator: socketsObject.creator,
      players: [...socketsObject.players, socket],
    });

    const newGame = {
      ...game,
      players: [...game.players, { id, name, balance }],
    };
    await saveGame(newGame);
  } catch (e) {
    socket.emit('onerror', { message: 'failed to join game', reason: e.message });
  }
}

function updateGamePlayers(game) {
  const socketsObject = sockets.get(game.id);
  socketsObject.players.forEach((s) => {
    s.emit('gameUpdate', game);
  });
}

async function onGetGamesEvent(socket, gamesIds) {
  // console.log('onGetGamesEvent, emiting "gamesData"');
  const games = (await Promise.all(gamesIds.map(id => safeGetGameById(id)))).filter(game => game !== null).map(game => ({ ...game, players: null }));
  socket.emit('gamesData', games);
}

async function onPlayerActionEvent(socket, data) {
  const game = await getGameById(data.gameId);
  // DO something..
  // save game back:
  await saveGame(game);
  updateGamePlayers(game);
}
function disconnect(socket) {
  // TODO:send update to all that the players status is disconnected..
  //logger.info('socket disconnected ', socket.id);
}
function initNewConnection(socket) {
  socket.id = `${(new Date()).getTime()}`;
  //logger.info('socket connected ', socket.id);
  socket.emit('connected', { socketId: socket.id });

  socket.on('createGame', gameCreatorData => onCreateGameEvent(socket, gameCreatorData));
  socket.on('joinGame', info => onJoinGameEvent(socket, info));
  socket.on('getGameData', gameId => onGetGameDataEvent(socket, gameId));
  socket.on('playerAction', data => onPlayerActionEvent(socket, data));
  socket.on('getGames', gamesIds => onGetGamesEvent(socket, gamesIds));
}

module.exports = {
  initNewConnection,
  disconnect,
};
