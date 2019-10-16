const request = require('supertest');
const should = require('should');

const { server } = require('../../../app');

const { clearAllData, stubGroup } = require('../../helpers/groups');
const { deleteGroupPlayers, stubPlayer } = require('../../helpers/players');

const acceptHeader = 'Accept';
const contentTypeHeader = 'Content-Type';
describe('get players list', function () {
  beforeEach(async function () {
    await clearAllData();
    this.group = await stubGroup();
    this.player = await stubPlayer(this.group.id);
  });
  afterEach(async function () {
    await clearAllData();
  });
  describe('GET api/v2/groups/{groupId}/players', function () {
    beforeEach(async function () {
      this.players = await stubPlayer(this.group.id);
    });
    afterEach(async function () {
      await deleteGroupPlayers(this.group.id);
    });

    it('should be able to get players with default pagination', async function () {
      const { body } = await request(server)
        .get(`/api/v2/groups/${this.group.id}/players`)
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
        .get(`/api/v2/groups/${this.group.id}/players?limit=5&offset=8`)
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
