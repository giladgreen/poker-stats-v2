const { notFound } = require('boom');
const models = require('../models');

const attributes = ['id', 'name', 'createdAt'];

async function getGroup(groupId) {
  const group = await models.groups.findOne({
    include: [{
      model: models.players,
      as: 'players',
      required: false,
      where: {
        groupId,
      },
    }, {
      model: models.games,
      as: 'games',
      required: false,
      where: {
        groupId,
      },
    }],
    where: {
      id: groupId,
    },
    attributes,
  });
  if (!group) {
    throw notFound('group not found', { groupId });
  }
  return group.toJSON();
}

async function getGroups(limit = 1000, offset = 0) {
  const allGroups = await models.groups.findAll({
    limit,
    offset,
    order: [['createdAt', 'ASC']],
    attributes,
  });
  return allGroups.map(group => group.toJSON());
}

async function createGroup(data) {
  const newGroup = await models.groups.create(data);
  return getGroup(newGroup.id);
}

async function updateGroup(groupId, data) {
  await getGroup(groupId);

  await models.groups.update(data, {
    where: {
      id: groupId,
    },
  });
  return getGroup(groupId);
}

async function deleteGroup(groupId) {
  await models.players.destroy({
    where: {
      groupId,
    },
  });


  await models.gamesData.destroy({
    where: {
      groupId,
    },
  });

  await models.games.destroy({
    where: {
      groupId,
    },
  });

  return models.groups.destroy({
    where: {
      id: groupId,
    },
  });
}

module.exports = {
  createGroup,
  getGroup,
  getGroups,
  updateGroup,
  deleteGroup,
};
