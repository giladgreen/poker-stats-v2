const request = require('supertest');
const uuid = require('uuid/v4');
const should = require('should');

const { server } = require('../../../app');

const { clearAllData, stubGroup } = require('../../helpers/groups');
const { stubPlayer } = require('../../helpers/players');
const { deleteGroupGames, stubGame } = require('../../helpers/games');

const acceptHeader = 'Accept';
const contentTypeHeader = 'Content-Type';
describe('get single game', function () {
  beforeEach(async function () {
    await clearAllData();
    this.group = await stubGroup();
    this.player = await stubPlayer(this.group.id);
    process.env.test = true;
  });
  afterEach(async function () {
    await clearAllData();
  });
  describe('GET api/v2/groups/{groupId}/games/{gameId}', function () {
    beforeEach(async function () {
      this.game = await stubGame(this.group.id, this.player.id);
    });
    afterEach(async function () {
      await deleteGroupGames(this.group.id);
    });
    it('should return 404 error in case of wrong game id', async function () {
      const gameId = uuid();
      const { body } = await request(server)
        .get(`/api/v2/groups/${this.group.id}/games/${gameId}`)
        .set(acceptHeader, 'application/json')
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(404);
      body.should.have.property('title').which.is.a.String();
      should(body.title).eql('game not found');
    });
    it('should return game details', async function () {
      const { body } = await request(server)
        .get(`/api/v2/groups/${this.group.id}/games/${this.game.id}`)
        .set(acceptHeader, 'application/json')
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(200);

      should(body).be.an.Object();
      body.should.have.property('date').which.is.a.String();
      body.should.have.property('description').which.is.a.String().eql('description');
      body.should.have.property('groupId').which.is.a.String().eql(this.group.id);
      body.should.have.property('playersData').which.is.a.Array();
      should(body.playersData.length).eql(1);
    });
  });
});
