const { notFound, unauthorized } = require('boom');

const moment = require('moment');
const models = require('../models');
const gameHelper = require('../helpers/game');

const gameAttributes = ['id', 'description', 'date', 'ready', 'groupId', 'createdAt'];
const gameDataAttributes = ['playerId', 'buyIn', 'cashOut', 'index', 'updatedAt', 'extra'];

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

async function getGames(groupId, limit = 1000, offset = 0) {
  const allCount = await models.games.count();
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
      ...playerData, index, gameId: newGame.id, groupId, extra: { cashOuts:[], buyIns: [{ index: 0, time: new Date(), amount: playerData.buyIn }] },
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
  return getGame({ groupId, gameId });
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
