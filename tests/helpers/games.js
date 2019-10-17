const models = require('../../api/models');

const mockedGamePayload = {
  date: new Date(),
  description: 'description',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockedGameDataPayload = {
  buyIn: 50,
  cashOut: 100,
  createdAt: new Date(),
  updatedAt: new Date(),
};


async function stubGame(groupId, playerId) {
  const game = await models.games.create({ ...mockedGamePayload, groupId });
  if (playerId) {
    await models.gamesData.create({
      ...mockedGameDataPayload, groupId, playerId, gameId: game.id,
    });
  }
  return game;
}

async function stubGames(count, groupId, playerId) {
  const games = await Promise.all(Array.from({ length: count }).map(() => models.games.create({ ...mockedGamePayload, groupId })));
  await Promise.all(games.map(game => models.gamesData.create({
    ...mockedGameDataPayload, groupId, playerId, gameId: game.id,
  })));
  return games;
}

function deleteGroupGames(groupId) {
  return models.games.destroy({
    where: {
      groupId,
    },
  });
}

module.exports = {
  stubGame,
  stubGames,
  deleteGroupGames,
};
