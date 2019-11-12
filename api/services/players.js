const { notFound } = require('boom');
const models = require('../models');

const attributes = ['id', 'name', 'email', 'groupId', 'createdAt'];
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
      const user = await models.users.findOne({
        where: {
          id: userPlayer.userId,
        },
      });
      if (user) {
        player.email = user.email || player.email;
        player.imageUrl = user.imageUrl || player.imageUrl;
        player.firstName = user.firstName;
        player.familyName = user.familyName;
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

async function createPlayer(groupId, data) {
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

async function deletePlayer(groupId, playerId) {
  await models.players.destroy({
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
