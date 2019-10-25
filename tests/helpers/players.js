const models = require('../../api/models');

const mockedPlayerPayload = {
  name: 'firstName familyName',
  email: 'email',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockedUserPayload = {
  firstName: 'firstName',
  familyName: 'familyName',
  email: 'email',
  imageUrl: 'imageUrl',
  createdAt: new Date(),
  updatedAt: new Date(),
  token: 'token',
  tokenExpiration: new Date(),
};

const mockedUserPlayerPayload = {
  createdAt: new Date(),
  updatedAt: new Date(),
};


function stubPlayer(groupId) {
  return models.players.create({ ...mockedPlayerPayload, groupId });
}

async function stubPlayerUser(groupId, playerId) {
  if (!playerId) {
    const player = models.players.create({ ...mockedPlayerPayload, groupId });
    playerId = player.id;
  }

  const user = await models.users.create({ ...mockedUserPayload });
  await models.usersPlayers.create({
    ...mockedUserPlayerPayload, userId: user.id, playerId, groupId, isAdmin: true,
  });
  return user.id;
}

function stubPlayers(count, groupId) {
  const promisses = Array.from({ length: count }).map((item, i) => models.players.create({ ...mockedPlayerPayload, firstName: `player #${i}`, groupId }));

  return Promise.all(promisses);
}

function deleteGroupPlayers(groupId) {
  return models.players.destroy({
    where: {
      groupId,
    },
  });
}

module.exports = {
  stubPlayer,
  stubPlayers,
  deleteGroupPlayers,
  stubPlayerUser,
};
