const models = require('../../api/models');

const mockedGroupPayload = {
  name: 'test',
  createdAt: new Date(),
  updatedAt: new Date(),
};

async function clearAllData() {
  await models.players.destroy({ where: {} });


  await models.gamesData.destroy({ where: {} });

  await models.games.destroy({ where: {} });

  return models.groups.destroy({ where: {} });
}
function stubGroup() {
  return models.groups.create(mockedGroupPayload);
}

function stubGroups(count) {
  const promisses = Array.from({ length: count }).map((item, i) => models.groups.create({ ...mockedGroupPayload, name: `group #${i}` }));

  return Promise.all(promisses);
}

function deleteStubGroup(group) {
  return models.groups.destroy({
    where: {
      id: group.id,
    },
  });
}

module.exports = {
  clearAllData,
  stubGroup,
  stubGroups,
  deleteStubGroup,
};
