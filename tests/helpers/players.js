const models = require('../../api/models');

const mockedPlayerPayload = {
  firstName: 'firstName',
  familyName: 'familyName',
  email: 'email',
  phone: 'phone',
  imageUrl: 'imageUrl',
  birthday: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};


function stubPlayer(groupId) {
  return models.players.create({ ...mockedPlayerPayload, groupId });
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
};
