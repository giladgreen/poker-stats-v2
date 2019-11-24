const { notFound, badRequest } = require('boom');
const models = require('../models');

const attributes = ['id', 'name', 'email', 'groupId', 'createdAt', 'imageUrl'];
const defaultValues = {
  email: '',
  imageUrl: 'anonymous',
};

async function getPlayer({ groupId, playerId }) {
  const player = await models.players.findOne({
    where: {
      groupId,
      id: playerId,
    },
    attributes,
  });
  if (!player) {
    throw notFound('player not found', { groupId, playerId });
  }
  return player.toJSON();
}

async function getPlayers(groupId, limit = 1000, offset = 0) {
  const allCount = await models.players.count();
  const allPlayers = await models.players.findAll({
    limit,
    offset,
    order: [['createdAt', 'ASC']],
    where: {
      groupId,
    },
    attributes,
  });

  const usersPlayers = await models.usersPlayers.findAll({
    where: {
      groupId,
    },
  });
  const results = await Promise.all(allPlayers.map(async (p) => {
    const player = p.toJSON();
    const userPlayer = usersPlayers.find(us => us.playerId === player.id);
    if (userPlayer) {
      // eslint-disable-next-line  no-await-in-loop
      const user = await models.users.findOne({
        where: {
          id: userPlayer.userId,
        },
      });
      if (user) {
        player.email = user.email || player.email;
        player.imageUrl = player.imageUrl || user.imageUrl;
        player.firstName = user.firstName;
        player.familyName = user.familyName;
        player.name = `${user.firstName} ${user.familyName}`;
      }
    }

    return player;
  }));
  return {
    metadata: {
      totalResults: allCount,
      count: allPlayers.length,
      limit,
      offset,
    },
    results,
  };
}

function getPlayerByName(groupId, name) {
  return models.players.findOne({
    where: {
      name,
      groupId,
    },
  });
}

async function createPlayer(groupId, data) {
  let existingPlayer = await getPlayerByName(groupId, data.name);
  while (existingPlayer) {
    data.name = `${data.name}*`;
    // eslint-disable-next-line  no-await-in-loop
    existingPlayer = await getPlayerByName(groupId, data.name);
  }

  const newPlayerData = { ...defaultValues, ...data, groupId };
  const newPlayer = await models.players.create(newPlayerData);
  return getPlayer({ groupId, playerId: newPlayer.id });
}

async function updatePlayer(groupId, playerId, data) {
  await getPlayer({ groupId, playerId });

  await models.players.update(data, {
    where: {
      groupId,
      id: playerId,
    },
  });
  return getPlayer({ groupId, playerId });
}

async function deletePlayer(groupId, userId, playerId) {
  // make sure not to delete yourself:
  const userPlayer = await models.usersPlayers.findOne({
    where: {
      groupId,
      userId,
      playerId,
    },
  });
  if (userPlayer) {
    throw badRequest('you can not delete yourself.', { groupId, userId, playerId });
  }

  // make sure player is not in any existing game:
  const gamesCount = await models.gamesData.count({
    where: {
      groupId,
      playerId,
    },
  });
  if (gamesCount > 0) {
    throw badRequest('you can not delete player, remove it from existing games first.', { groupId, playerId, gamesCount });
  }

  await models.usersPlayers.destroy({
    where: {
      groupId,
      playerId,
    },
  });
  return models.players.destroy({
    where: {
      groupId,
      id: playerId,
    },
  });
}

module.exports = {
  getPlayer,
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
};
