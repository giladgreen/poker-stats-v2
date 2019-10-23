const request = require('supertest');
const should = require('should');

const { server } = require('../../../app');

const { clearAllData, stubGroup } = require('../../helpers/groups');
const { stubPlayer } = require('../../helpers/players');
const { stubGames, deleteGroupGames } = require('../../helpers/games');

const acceptHeader = 'Accept';
const provider = 'provider';
const GOOGLE = 'google';
const authTokenHeader = 'x-auth-token';
const contentTypeHeader = 'Content-Type';
const token = 'token';
describe('get games list', function () {
  beforeEach(async function () {
    await clearAllData();
    this.group = await stubGroup();
    this.player = await stubPlayer(this.group.id);
  });
  afterEach(async function () {
    await clearAllData();
  });
  describe('GET api/v2/groups/{groupId}/games', function () {
    beforeEach(async function () {
      this.games = await stubGames(10, this.group.id, this.player.id);
    });
    afterEach(async function () {
      await deleteGroupGames(this.group.id);
    });

    it('should be able to get games with default pagination', async function () {
      const { body } = await request(server)
        .get(`/api/v2/groups/${this.group.id}/games`)
        .set(provider, GOOGLE)
        .set(authTokenHeader, token)
        .set(acceptHeader, 'application/json')
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(200);
      body.should.have.property('results').which.is.a.Array();
      body.should.have.property('metadata').which.is.a.Object();

      should(body.results.length).eql(10);
      should(body.metadata).eql({
        totalResults: 10,
        count: 10,
        limit: 1000,
        offset: 0,
      });
    });
    it('should be able to get players with custom pagination', async function () {
      const { body } = await request(server)
        .get(`/api/v2/groups/${this.group.id}/games?limit=5&offset=8`)
        .set(provider, GOOGLE)
        .set(authTokenHeader, token)
        .set(acceptHeader, 'application/json')
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(200);
      body.should.have.property('results').which.is.a.Array();
      body.should.have.property('metadata').which.is.a.Object();

      should(body.results.length).eql(2);
      should(body.metadata).eql({
        totalResults: 10,
        count: 2,
        limit: 5,
        offset: 8,
      });
    });
  });
});
