const { notFound } = require('boom');
const models = require('../models');
const gameHelper = require('../helpers/game');

const gameAttributes = ['id', 'description', 'date', 'ready', 'groupId', 'createdAt'];
const gameDataAttributes = ['playerId', 'buyIn', 'cashOut', 'updatedAt'];

const defaultValues = {
  description: '-',
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

  return {
    metadata: {
      totalResults: allCount,
      count: allGames.length,
      limit,
      offset,
    },
    results: allGames.map(game => game.toJSON()),
  };
}

async function createGame(groupId, data) {
  const { playersData } = data;
  const ready = gameHelper.isGameReady(playersData);
  const newGameData = {
    ...defaultValues, ...data, ready, groupId,
  };
  delete newGameData.playersData;
  const newGame = await models.games.create(newGameData);
  if (playersData) {
    await Promise.all(playersData.map(playerData => models.gamesData.create({ ...playerData, gameId: newGame.id, groupId })));
  }

  return getGame({ groupId, gameId: newGame.id });
}

async function updateGame(groupId, gameId, data) {
  await getGame({ groupId, gameId });
  const updateData = { ...data };
  const { playersData } = updateData;
  const ready = gameHelper.isGameReady(playersData);
  delete updateData.playersData;
  await models.games.update({ ...data, ready }, {
    where: {
      groupId,
      id: gameId,
    },
  });
  if (playersData) {
    await models.gamesData.destroy({
      where: {
        groupId,
        gameId,
      },
      paranoid: false,
    });

    await Promise.all(playersData.map(playerData => models.gamesData.create({ ...playerData, gameId, groupId })));
  }

  return getGame({ groupId, gameId });
}

async function deleteGame(groupId, gameId) {
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
