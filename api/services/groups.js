const { notFound } = require('boom');
const models = require('../models');

const attributes = ['id', 'name', 'createdAt'];

async function getGroup(userContext, groupId) {
  const group = await models.groups.findOne({
    where: {
      id: groupId,
    },
    attributes,
  });
  if (!group) {
    throw notFound('group not found', { groupId });
  }
  const result = group.toJSON();
  result.isAdmin = userContext.isAdmin;
  return result;
}

async function getGroups(userContext, limit = 1000, offset = 0) {
  const allCount = await models.groups.count();
  const allGroups = await models.groups.findAll({
    limit,
    offset,
    order: [['createdAt', 'ASC']],
    attributes,
  });

  const results = allGroups.map((g) => {
    const group = g.toJSON();
    const userGroupData = userContext.groups[group.id];
    const result = { ...group, userInGroup: !!userGroupData };
    if (result.userInGroup) {
      result.isAdmin = userGroupData.isAdmin;
    }
    return result;
  });

  return {
    metadata: {
      totalResults: allCount,
      count: allGroups.length,
      limit,
      offset,
    },
    results,
  };
}

async function createGroup(userContext, data) {
  const newGroup = await models.groups.create(data);
  const playerData = {
    name: `${userContext.firstName} ${userContext.familyName}`,
    email: userContext.email,
    groupId: newGroup.id,
  };
  const newPlayer = await models.players.create(playerData);
  const userPlayerData = {
    userId: userContext.id,
    playerId: newPlayer.id,
    groupId: playerData.groupId,
    isAdmin: true,
  };
  await models.usersPlayers.create(userPlayerData);
  userContext.isAdmin = true;
  userContext.groups[playerData.groupId] = { isAdmin: true };
  return getGroup(userContext, newGroup.id);
}

async function updateGroup(userContext, groupId, data) {
  await models.groups.update(data, {
    where: {
      id: groupId,
    },
  });
  return getGroup(userContext, groupId);
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

  await models.usersPlayers.destroy({
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
