const request = require('supertest');
const uuid = require('uuid/v4');
const should = require('should');
const sinon = require('sinon');

const { server } = require('../../../app');

const { stubGroup, clearAllData, mockGoogleTokenStrategy } = require('../../helpers/groups');
const { stubPlayer, deleteGroupPlayers, stubPlayerUser } = require('../../helpers/players');

const acceptHeader = 'Accept';
const provider = 'provider';
const GOOGLE = 'google';
const authTokenHeader = 'x-auth-token';
const contentTypeHeader = 'Content-Type';
const token = 'token';
describe('update player', function () {
  beforeEach(async function () {
    await clearAllData();
    this.group = await stubGroup();
    this.sandbox = sinon.createSandbox();
    const userId = await stubPlayerUser(this.group.id);
    mockGoogleTokenStrategy(this.sandbox, { token, userId });
  });
  afterEach(async function () {
    await clearAllData();
    this.sandbox.restore();
  });
  describe('PATCH api/v2/groups/{groupId}/players/{playerId}', function () {
    beforeEach(async function () {
      this.player = await stubPlayer(this.group.id);
    });
    afterEach(async function () {
      await deleteGroupPlayers(this.group.id);
    });
    it('should return 404 error in case of wrong player id', async function () {
      const playerId = uuid();
      const { body } = await request(server)
        .patch(`/api/v2/groups/${this.group.id}/players/${playerId}`)
        .set(provider, GOOGLE)
        .set(authTokenHeader, token)
        .set(acceptHeader, 'application/json')
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(404);
      body.should.have.property('title').which.is.a.String();
      should(body.title).eql('player not found');
    });
    it('should return updated details', async function () {
      const payload = {
        name: 'new name',
      };
      const { body } = await request(server)
        .patch(`/api/v2/groups/${this.group.id}/players/${this.player.id}`)
        .set(provider, GOOGLE)
        .set(authTokenHeader, token)
        .set(acceptHeader, 'application/json')
        .send(payload)
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(200);

      should(body).be.an.Object();
      body.should.have.property('name').which.is.a.String().eql(payload.name);
    });
  });
});
