const request = require('supertest');
const should = require('should');
const sinon = require('sinon');

const { server } = require('../../../app');

const { clearAllData, stubGroup, mockGoogleTokenStrategy } = require('../../helpers/groups');
const { deleteGroupPlayers, stubPlayers, stubPlayerUser } = require('../../helpers/players');

const acceptHeader = 'Accept';
const provider = 'provider';
const GOOGLE = 'google';
const authTokenHeader = 'x-auth-token';
const contentTypeHeader = 'Content-Type';
const token = 'token';

describe('get players list', function () {
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
  describe('GET api/v2/groups/{groupId}/players', function () {
    beforeEach(async function () {
      this.players = await stubPlayers(10, this.group.id);
    });
    afterEach(async function () {
      await deleteGroupPlayers(this.group.id);
    });

    it('should be able to get players with default pagination', async function () {
      const { body } = await request(server)
        .get(`/api/v2/groups/${this.group.id}/players`)
        .set(provider, GOOGLE)
        .set(authTokenHeader, token)
        .set(acceptHeader, 'application/json')
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(200);
      body.should.have.property('results').which.is.a.Array();
      body.should.have.property('metadata').which.is.a.Object();

      should(body.results.length).eql(11);
      should(body.metadata).eql({
        totalResults: 11,
        count: 11,
        limit: 1000,
        offset: 0,
      });
    });
    it('should be able to get players with custom pagination', async function () {
      const { body } = await request(server)
        .get(`/api/v2/groups/${this.group.id}/players?limit=5&offset=8`)
        .set(provider, GOOGLE)
        .set(authTokenHeader, token)
        .set(acceptHeader, 'application/json')
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(200);
      body.should.have.property('results').which.is.a.Array();
      body.should.have.property('metadata').which.is.a.Object();

      should(body.results.length).eql(3);
      should(body.metadata).eql({
        totalResults: 11,
        count: 3,
        limit: 5,
        offset: 8,
      });
    });
  });
});
