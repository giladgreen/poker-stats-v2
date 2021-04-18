const { notFound, unauthorized } = require('boom');

const moment = require('moment');
const models = require('../models');
const { sendNotification } = require('./notifications');
const gameHelper = require('../helpers/game');
const logger = require('./logger');

const gameAttributes = ['id', 'description', 'date', 'ready', 'groupId', 'createdAt'];
const gameDataAttributes = ['playerId', 'buyIn', 'cashOut', 'index', 'updatedAt', 'extra'];

const GILAD_USER_ID='e7659c43-a0fe-449b-85cd-33d561d74995';

const defaultValues = {
  description: '',
  date: (new Date()).toISOString(),
};

async function getGame({ groupId, gameId }) {
  const gameData = await models.games.findOne({
    where: {
      groupId,
      id: gameId,
    },
    attributes: gameAttributes,
  });
  if (!gameData) {
    throw notFound('game not found', { groupId, gameId });
  }
  const game = gameData.toJSON();
  game.playersData = (await models.gamesData.findAll({
    where: {
      groupId,
      gameId,
    },
    attributes: gameDataAttributes,
    order: [['index', 'ASC'], ['createdAt', 'ASC']],
  })).map(data => data.toJSON());
  return game;
}
function isGameReady(game){
  const totalBuyIn = game.playersData.map(pd=>pd.buyIn).reduce((total, num)=>  total + num, 0);
  const totalCashOut =game.playersData.map(pd=>pd.cashOut).reduce((total, num)=>  total + num, 0);
  const diff = totalBuyIn - totalCashOut;
  return diff === 0 && game.playersData.length >1;
}

async function getGames(groupId, limit = 1000, offset = 0) {
  const allCount = await models.games.count({ where: { groupId } });
  const allGames = await models.games.findAll({
    limit,
    offset,
    order: [['createdAt', 'ASC']],
    include: [{
      model: models.gamesData,
      as: 'playersData',
      required: false,
      where: {
        groupId,
      },
    }],
    where: {
      groupId,
    },
    attributes: gameAttributes,
  });

  const results = allGames.map(game => game.toJSON()).map((game) => {
    game.description = game.description || '';
    game.ready = isGameReady(game);
    if (game.ready){
      game.mvpPlayerId = game.playersData.map(data => ({ playerId: data.playerId, bottomLine: data.cashOut - data.buyIn }))
          .reduce(function(a, b) {
            return a.bottomLine > b.bottomLine ? a : (a.bottomLine < b.bottomLine ? b : (a.buyIn < b.buyIn ? a : b));
          }).playerId;
    }
    return game;
  });

  return {
    metadata: {
      totalResults: allCount,
      count: allGames.length,
      limit,
      offset,
    },
    results,
  };
}

async function createGame(groupId, data) {
  const { playersData } = data;
  const ready = gameHelper.isGameReady(playersData);
  const date = moment(new Date(`${data.date}`.substr(0, 10))).add(12, 'hours').toDate();

  const newGameData = {
    ...defaultValues, ...data, ready, groupId, date,
  };
  delete newGameData.playersData;
  const newGame = await models.games.create(newGameData);
  if (playersData) {
    await Promise.all(playersData.map((playerData, index) => models.gamesData.create({
      ...playerData, index, gameId: newGame.id, groupId, extra: { cashOuts: [], buyIns: [{ time: new Date(), amount: playerData.buyIn }] },
    })));
  }

  return getGame({ groupId, gameId: newGame.id });
}
async function validateUserCanEditGame(groupId, gameId, isAdmin) {
  const existingGame = await models.gamesData.findOne({
    where: {
      groupId,
      gameId,
    },
  });
  if (existingGame) {
    const { ready } = existingGame;
    if (ready && !isAdmin) {
      throw unauthorized('user not admin of group');
    }
  }
}
async function updateGame(userContext, groupId, gameId, data) {
  await validateUserCanEditGame(groupId, gameId, userContext.isAdmin);
  await getGame({ groupId, gameId });
  const date = moment(new Date(`${data.date}`.substr(0, 10))).add(12, 'hours').toDate();

  const existingData = await models.gamesData.findAll({
    where: {
      groupId,
      gameId,
    },
  });
  await models.gamesData.destroy({
    where: {
      groupId,
      gameId,
    },
    paranoid: false,
  });

  const updateData = { ...data };
  const { playersData } = updateData;
  const ready = gameHelper.isGameReady(playersData);
  delete updateData.playersData;
  await models.games.update({ ...data, date, ready }, {
    where: {
      groupId,
      id: gameId,
    },
  });
  if (playersData) {
    await Promise.all(playersData.map((playerData, index) => {
      const currentPlayerData = existingData.find(d => d.playerId === playerData.playerId);
      const extra = {
        buyIns: [],
        cashOuts: [],
      };
      let buyInSum = 0;
      if (currentPlayerData && currentPlayerData.extra && currentPlayerData.extra.buyIns) {
        currentPlayerData.extra.buyIns.forEach((bi) => {
          extra.buyIns.push(bi);
          buyInSum += bi.amount;
        });
      }
      let cashOutSum = 0;
      if (currentPlayerData && currentPlayerData.extra && currentPlayerData.extra.cashOuts) {
        currentPlayerData.extra.cashOuts.forEach((co) => {
          extra.cashOuts.push(co);
          cashOutSum += co.amount;
        });
      }
      if (playerData.buyIn - buyInSum > 0) {
        extra.buyIns.push({ time: new Date(), amount: playerData.buyIn - buyInSum });
      }

      if (playerData.cashOut - cashOutSum > 0) {
        extra.cashOuts.push({ time: new Date(), amount: playerData.cashOut - cashOutSum });
      }

      return models.gamesData.create({
        ...playerData, index, gameId, groupId, extra,
      });
    }));
  }

  const game = await getGame({ groupId, gameId });
  if (ready){
    try {
      const mvpPlayerId = game.playersData.map(data => ({playerId: data.playerId, bottomLine: data.cashOut - data.buyIn}))
          .reduce(function (a, b) {
            return a.bottomLine > b.bottomLine ? a : (a.bottomLine < b.bottomLine ? b : (a.buyIn < b.buyIn ? a : b));
          }).playerId;
      let mvpPlayer;
      if (mvpPlayerId) {
        mvpPlayer = await models.players.findOne({
          where: {
            groupId,
            playerId: mvpPlayerId,
          },
        });
      }
      const text = mvpPlayer ? `MVP: ${mvpPlayer.name}` : 'Game is done';
      const link = mvpPlayer ? mvpPlayer.imageUrl : 'https://www.poker-stats.com/';

      sendNotification(GILAD_USER_ID, 'Game Updated', link, text);
    } catch (e) {
      logger.error('error sending update game notification',e.message, e.stack);
    }
  }

  return game;
}

async function deleteGame(userContext, groupId, gameId) {
  await validateUserCanEditGame(groupId, gameId, userContext.isAdmin);
  await models.gamesData.destroy({
    where: {
      groupId,
      gameId,
    },
    paranoid: false,
  });
  return models.games.destroy({
    where: {
      groupId,
      id: gameId,
    },
  });
}

module.exports = {
  createGame,
  getGame,
  getGames,
  updateGame,
  deleteGame,
};
