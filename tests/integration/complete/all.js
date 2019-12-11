const request = require('supertest');
const should = require('should');
const sinon = require('sinon');
const { server } = require('../../../app');
const { clearAllData, mockGoogleTokenStrategy } = require('../../helpers/groups');
const models = require('../../../api/models');

const acceptHeader = 'Accept';
const provider = 'provider';
const GOOGLE = 'google';
const authTokenHeader = 'x-auth-token';
const contentTypeHeader = 'Content-Type';
const email = 'email';
const firstName = 'firstName';
const familyName = 'familyName';
const token = 'token';
const differentToken = 'differentToken';

async function listGroups(count) {
  const { body } = await request(server)
    .get('/api/v2/groups')
    .set(provider, GOOGLE)
    .set(authTokenHeader, token)
    .set(acceptHeader, 'application/json')
    .expect(contentTypeHeader, 'application/json; charset=utf-8')
    .expect(200);
  body.should.have.property('results').which.is.a.Array();
  body.should.have.property('metadata').which.is.a.Object();

  should(body.results.length).eql(count);
  should(body.metadata).eql({
    totalResults: count,
    count,
    limit: 1000,
    offset: 0,
  });
}

async function getGroup(groupId, expectedStatus = 200, Token = token) {
  await request(server)
    .get(`/api/v2/groups/${groupId}`)
    .set(provider, GOOGLE)
    .set(authTokenHeader, Token)
    .set(acceptHeader, 'application/json')
    .expect(contentTypeHeader, 'application/json; charset=utf-8')
    .expect(expectedStatus);
}

function validateMissingGroup(groupId) {
  request(server)
    .get(`/api/v2/groups/${groupId}`)
    .set(provider, GOOGLE)
    .set(authTokenHeader, token)
    .set(acceptHeader, 'application/json')
    .expect(contentTypeHeader, 'application/json; charset=utf-8')
    .expect(404);
}

async function deleteGroup(groupId) {
  const { body } = await request(server)
    .delete(`/api/v2/groups/${groupId}`)
    .set(provider, GOOGLE)
    .set(authTokenHeader, token)
    .set(acceptHeader, 'application/json')
    .expect(204);
  should(body).be.an.Object();
}

async function createGroup(name) {
  const payload = {
    name,
  };
  const { body } = await request(server)
    .post('/api/v2/groups')
    .set(acceptHeader, 'application/json')
    .set(provider, GOOGLE)
    .set(authTokenHeader, token)
    .send(payload)
    .expect(contentTypeHeader, 'application/json; charset=utf-8')
    .expect(201);
  body.should.have.property('name').which.is.a.String().eql(payload.name);
  body.should.have.property('id').which.is.a.String();
  return body.id;
}

async function updateGroup(groupId, name) {
  const payload = {
    name,
  };
  const { body } = await request(server)
    .patch(`/api/v2/groups/${groupId}`)
    .set(acceptHeader, 'application/json')
    .set(provider, GOOGLE)
    .set(authTokenHeader, token)
    .send(payload)
    .expect(contentTypeHeader, 'application/json; charset=utf-8')
    .expect(200);
  body.should.have.property('name').which.is.a.String().eql(payload.name);
  body.should.have.property('id').which.is.a.String().eql(groupId);
}

async function listPlayers(groupId, count) {
  const { body } = await request(server)
    .get(`/api/v2/groups/${groupId}/players`)
    .set(provider, GOOGLE)
    .set(authTokenHeader, token)
    .set(acceptHeader, 'application/json')
    .expect(contentTypeHeader, 'application/json; charset=utf-8')
    .expect(200);
  body.should.have.property('results').which.is.a.Array();
  body.should.have.property('metadata').which.is.a.Object();

  should(body.results.length).eql(count);
  should(body.metadata).eql({
    totalResults: count,
    count,
    limit: 1000,
    offset: 0,
  });
}

async function getPlayer(groupId, playerId, name) {
  const { body } = await request(server)
    .get(`/api/v2/groups/${groupId}/players/${playerId}`)
    .set(acceptHeader, 'application/json')
    .set(provider, GOOGLE)
    .set(authTokenHeader, token)
    .expect(contentTypeHeader, 'application/json; charset=utf-8')
    .expect(200);

  should(body).be.an.Object();
  body.should.have.property('name').which.is.a.String().eql(name);
}

function validateMissingPlayer(groupId, playerId) {
  request(server)
    .get(`/api/v2/groups/${groupId}/players/${playerId}`)
    .set(provider, GOOGLE)
    .set(authTokenHeader, token)
    .set(acceptHeader, 'application/json')
    .expect(contentTypeHeader, 'application/json; charset=utf-8')
    .expect(404);
}

async function deletePlayer(groupId, playerId) {
  const { body } = await request(server)
    .delete(`/api/v2/groups/${groupId}/players/${playerId}`)
    .set(provider, GOOGLE)
    .set(authTokenHeader, token)
    .set(acceptHeader, 'application/json')
    .expect(204);

  should(body).be.an.Object();
}
async function updatePlayer(groupId, playerId, name) {
  const payload = {
    name,
  };
  const { body } = await request(server)
    .patch(`/api/v2/groups/${groupId}/players/${playerId}`)
    .set(acceptHeader, 'application/json')
    .set(provider, GOOGLE)
    .set(authTokenHeader, token)
    .send(payload)
    .expect(contentTypeHeader, 'application/json; charset=utf-8')
    .expect(200);

  should(body).be.an.Object();
  body.should.have.property('name').which.is.a.String().eql(name);
}
async function createPlayer(groupId, name) {
  const payload = {
    name,
    email,
  };
  const { body } = await request(server)
    .post(`/api/v2/groups/${groupId}/players`)
    .set(acceptHeader, 'application/json')
    .set(provider, GOOGLE)
    .set(authTokenHeader, token)
    .send(payload)
    .expect(contentTypeHeader, 'application/json; charset=utf-8')
    .expect(201);
  body.should.have.property('name').which.is.a.String().eql(payload.name);
  body.should.have.property('email').which.is.a.String().eql(email);
  body.should.have.property('id').which.is.a.String();
  return body.id;
}

async function listGames(groupId, count) {
  const { body } = await request(server)
    .get(`/api/v2/groups/${groupId}/games`)
    .set(acceptHeader, 'application/json')
    .set(provider, GOOGLE)
    .set(authTokenHeader, token)
    .expect(contentTypeHeader, 'application/json; charset=utf-8')
    .expect(200);
  body.should.have.property('results').which.is.a.Array();
  body.should.have.property('metadata').which.is.a.Object();

  should(body.results.length).eql(count);
  should(body.metadata).eql({
    totalResults: count,
    count,
    limit: 1000,
    offset: 0,
  });
}

async function getGame(groupId, gameId, description) {
  const { body } = await request(server)
    .get(`/api/v2/groups/${groupId}/games/${gameId}`)
    .set(acceptHeader, 'application/json')
    .set(provider, GOOGLE)
    .set(authTokenHeader, token)
    .expect(contentTypeHeader, 'application/json; charset=utf-8')
    .expect(200);

  should(body).be.an.Object();
  body.should.have.property('date').which.is.a.String();
  body.should.have.property('description').which.is.a.String().eql(description);
  body.should.have.property('groupId').which.is.a.String().eql(groupId);
  body.should.have.property('playersData').which.is.a.Array();
  should(body.playersData.length).eql(2);
}

function validateMissingGame(groupId, gameId) {
  request(server)
    .get(`/api/v2/groups/${groupId}/games/${gameId}`)
    .set(acceptHeader, 'application/json')
    .set(provider, GOOGLE)
    .set(authTokenHeader, token)
    .expect(contentTypeHeader, 'application/json; charset=utf-8')
    .expect(404);
}

async function deleteGame(groupId, gameId) {
  const { body } = await request(server)
    .delete(`/api/v2/groups/${groupId}/games/${gameId}`)
    .set(provider, GOOGLE)
    .set(authTokenHeader, token)
    .set(acceptHeader, 'application/json')
    .expect(204);

  should(body).be.an.Object();
}
async function updateGame(groupId, gameId, description, players) {
  const payload = {
    date: new Date(),
    description,
    playersData: players.map(id => ({ playerId: id, buyIn: 60, cashOut: 60 })),
  };
  const { body } = await request(server)
    .patch(`/api/v2/groups/${groupId}/games/${gameId}`)
    .set(acceptHeader, 'application/json')
    .set(provider, GOOGLE)
    .set(authTokenHeader, token)
    .send(payload)
    .expect(contentTypeHeader, 'application/json; charset=utf-8')
    .expect(200);

  should(body).be.an.Object();
  body.should.have.property('date').which.is.a.String();
  body.should.have.property('description').which.is.a.String().eql(payload.description);
  body.should.have.property('groupId').which.is.a.String().eql(groupId);
  body.should.have.property('id').which.is.a.String().eql(gameId);
  body.should.have.property('ready').which.is.a.Boolean().eql(true);
  body.should.have.property('playersData').which.is.a.Array();
  should(body.playersData.length).eql(players.length);
}
async function createGame(groupId, description, players) {
  const payload = {
    date: new Date(),
    description,
    playersData: players.map(id => ({ playerId: id, buyIn: 50, cashOut: 50 })),
  };
  const { body } = await request(server)
    .post(`/api/v2/groups/${groupId}/games/`)
    .set(acceptHeader, 'application/json')
    .set(provider, GOOGLE)
    .set(authTokenHeader, token)
    .send(payload)
    .expect(contentTypeHeader, 'application/json; charset=utf-8')
    .expect(201);

  should(body).be.an.Object();
  body.should.have.property('date').which.is.a.String();
  body.should.have.property('description').which.is.a.String().eql(payload.description);
  body.should.have.property('groupId').which.is.a.String().eql(groupId);
  body.should.have.property('ready').which.is.a.Boolean().eql(true);
  body.should.have.property('playersData').which.is.a.Array();
  should(body.playersData.length).eql(players.length);

  return body.id;
}

async function createUser(FirstName, FamilyName, Email) {
  const { id } = await models.users.create({
    firstName: FirstName,
    familyName: FamilyName,
    email: Email,
    imageUrl: 'imageUrl',
    token: 'token',
    tokenExpiration: new Date(),
  });
  return id;
}

async function sendInvitationRequest(groupId) {
  const payload = {
    requestedGroupId: groupId,
  };
  const { body } = await request(server)
    .post('/api/v2/invitations-requests')
    .set(acceptHeader, 'application/json')
    .set(provider, GOOGLE)
    .set(authTokenHeader, differentToken)
    .send(payload)
    .expect(contentTypeHeader, 'application/json; charset=utf-8')
    .expect(201);

  should(body).be.an.Object();
  body.should.have.property('status').which.is.a.String().eql('invitation requested');
  body.should.have.property('invitationRequestId').which.is.a.String();
  return body.invitationRequestId;
}

async function sendInvitationRequestApproval(invitationRequestId, invitationRequestPlayerId) {
  const { body } = await request(server)
    .get(`/api/v2/invitations-requests/${invitationRequestId}?invitationRequestPlayerId=${invitationRequestPlayerId}&approved=true`)
    .set(acceptHeader, 'application/json')
    .expect(contentTypeHeader, 'application/json; charset=utf-8')
    .expect(200);

  should(body).be.an.Object();
  body.should.have.property('status').which.is.a.String().eql('invitation approved');
}


describe('full integration test,', function () {
  this.timeout(8000);
  beforeEach(async function () {
    this.sandbox = sinon.createSandbox();
    mockGoogleTokenStrategy(this.sandbox, {
      email, firstName, familyName, token,
    });
  });
  afterEach(function () {
    this.sandbox.restore();
  });
  describe('complete flow', function () {
    it('should create/get/update/delete all as expected', async function () {
      await clearAllData();

      await listGroups(0);

      const groupId = await createGroup('name');

      await getGroup(groupId);
      await updateGroup(groupId, 'new name');
      await getGroup(groupId);

      const group2Id = await createGroup('group to delete');
      await listGroups(2);
      await deleteGroup(group2Id);
      await listGroups(1);
      await validateMissingGroup(groupId);

      await listPlayers(groupId, 1);

      const playerId = await createPlayer(groupId, 'first family');
      await getPlayer(groupId, playerId, 'first family');

      await updatePlayer(groupId, playerId, 'new first name family');
      await getPlayer(groupId, playerId, 'new first name family');
      const player2Id = await createPlayer(groupId, 'player to delete family');

      await listPlayers(groupId, 3);
      await deletePlayer(groupId, player2Id);

      await listPlayers(groupId, 2);
      await validateMissingPlayer(groupId, player2Id);
      const player3Id = await createPlayer(groupId, 'second family');

      await listGames(groupId, 0);
      const gameId = await createGame(groupId, 'description', [playerId, player3Id]);
      await getGame(groupId, gameId, 'description', [playerId, player3Id]);
      await updateGame(groupId, gameId, 'new description', [playerId, player3Id]);
      await getGame(groupId, gameId, 'new description', [playerId, player3Id]);
      const game2Id = await createGame(groupId, 'description 2', [player3Id, playerId]);
      await listGames(groupId, 2);

      await deleteGame(groupId, game2Id);
      await listGames(groupId, 1);
      await validateMissingGame(groupId, game2Id);

      const userId = await createUser('new', 'User', 'new.user@gmail.com');
      this.sandbox.restore();
      mockGoogleTokenStrategy(this.sandbox, {
        userId, email: 'new.user@gmail.com', firstName: 'new', familyName: 'User', token: differentToken,
      });
      await getGroup(groupId, 401, differentToken);

      const invitationRequestId = await sendInvitationRequest(groupId);
      const invitationRequestPlayerId = player3Id;

      await sendInvitationRequestApproval(invitationRequestId, invitationRequestPlayerId);
      await getGroup(groupId, 200);
    });
  });
});
