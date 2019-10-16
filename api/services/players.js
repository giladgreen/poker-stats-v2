const { notFound } = require('boom');
const models = require('../models');

const attributes = ['id', 'firstName', 'familyName', 'phone', 'email', 'imageUrl', 'birthday', 'groupId', 'createdAt'];
const defaultValues = {
  phone: '-',
  email: '-',
  imageUrl: 'anonymous',
  birthday: (new Date()).toISOString(),
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
  const allPlayers = await models.players.findAll({
    limit,
    offset,
    order: [['createdAt', 'ASC']],
    where: {
      groupId,
    },
    attributes,
  });
  return allPlayers.map(player => player.toJSON());
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

function deletePlayer(groupId, playerId) {
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
