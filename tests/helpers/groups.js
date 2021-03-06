const models = require('../../api/models');
const googleTokenStrategy = require('../../api/helpers/google-auth');

const { STORAGE } = require('../../config');

const GOOGLE = 'google';

function mockGoogleTokenStrategy(sandbox, {
  userId = 'userId', email = 'email', firstName = 'firstName', familyName = 'familyName', imageUrl = 'imageUrl', token = 'token',
}) {
  sandbox.stub(googleTokenStrategy, 'authenticate').resolves({
    id: userId,
    provider: GOOGLE,
    email,
    firstName,
    familyName,
    imageUrl,
    token,
  });
}

const mockedGroupPayload = {
  name: 'test',
  createdAt: new Date(),
  updatedAt: new Date(),
};

async function clearAllData() {
  if (STORAGE === 'DB') {
    await models.sequelize.query('DELETE from games_data');
    await models.sequelize.query('DELETE from games');
    await models.sequelize.query('DELETE from players');
    await models.sequelize.query('DELETE from users_players');
    await models.sequelize.query('DELETE from users');
    await models.sequelize.query('DELETE from groups');
    return models.sequelize.query('DELETE from invitations_requests');
  }
  models.gamesData.clear();
  models.games.clear();
  models.players.clear();
  models.usersPlayers.clear();
  models.users.clear();
  models.groups.clear();
  models.invitationsRequests.clear();
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
  mockGoogleTokenStrategy,
};
