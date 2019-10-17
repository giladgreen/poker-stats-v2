const models = require('../../api/models');

const mockedGroupPayload = {
  name: 'test',
  createdAt: new Date(),
  updatedAt: new Date(),
};

async function clearAllData() {
  await models.sequelize.query('DELETE from games_data');
  await models.sequelize.query('DELETE from games');
  await models.sequelize.query('DELETE from players');
  return models.sequelize.query('DELETE from groups');
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
