const request = require('supertest');
const uuid = require('uuid/v4');
const should = require('should');
const sinon = require('sinon');

const { server } = require('../../../app');

const { stubGroup, clearAllData, mockGoogleTokenStrategy } = require('../../helpers/groups');
const { stubPlayer, stubPlayerUser } = require('../../helpers/players');
const { deleteGroupGames, stubGame } = require('../../helpers/games');


const acceptHeader = 'Accept';
const provider = 'provider';
const GOOGLE = 'google';
const authTokenHeader = 'x-auth-token';
const contentTypeHeader = 'Content-Type';
const token = 'token';
describe('update game', function () {
  beforeEach(async function () {
    await clearAllData();
    this.group = await stubGroup();
    this.player = await stubPlayer(this.group.id);
    this.player2 = await stubPlayer(this.group.id);
    this.sandbox = sinon.createSandbox();
    const userId = await stubPlayerUser(this.group.id, this.player.id);
    mockGoogleTokenStrategy(this.sandbox, { token, userId });
  });
  afterEach(async function () {
    await clearAllData();
    this.sandbox.restore();
  });
  describe('PATCH api/v2/groups/{groupId}/games/{gameId}', function () {
    beforeEach(async function () {
      this.game = await stubGame(this.group.id);
    });
    afterEach(async function () {
      await deleteGroupGames(this.group.id);
    });
    it('should return 404 error in case of wrong game id', async function () {
      const gameId = uuid();
      const { body } = await request(server)
        .patch(`/api/v2/groups/${this.group.id}/games/${gameId}`)
        .set(provider, GOOGLE)
        .set(authTokenHeader, token)
        .set(acceptHeader, 'application/json')
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(404);
      body.should.have.property('title').which.is.a.String();
      should(body.title).eql('game not found');
    });
    it('when not passing in playersData - should return updated details', async function () {
      const payload = {
        date: new Date(),
        description: 'new description',
      };
      const { body } = await request(server)
        .patch(`/api/v2/groups/${this.group.id}/games/${this.game.id}`)
        .set(provider, GOOGLE)
        .set(authTokenHeader, token)
        .set(acceptHeader, 'application/json')
        .send(payload)
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(200);

      should(body).be.an.Object();
      body.should.have.property('date').which.is.a.String();
      body.should.have.property('description').which.is.a.String().eql(payload.description);
      body.should.have.property('groupId').which.is.a.String().eql(this.group.id);
      body.should.have.property('ready').which.is.a.Boolean().eql(false);
      body.should.have.property('playersData').which.is.a.Array();
      should(body.playersData.length).eql(0);
    });
    it('when passing in playersData - should return updated details', async function () {
      const payload = {
        date: new Date(),
        description: 'new description 2',
        playersData: [
          {
            playerId: this.player.id,
            buyIn: 500,
            cashOut: 0,
          },
          {
            playerId: this.player2.id,
            buyIn: 100,
            cashOut: 600,
          },
        ],
      };
      const { body } = await request(server)
        .patch(`/api/v2/groups/${this.group.id}/games/${this.game.id}`)
        .set(provider, GOOGLE)
        .set(authTokenHeader, token)
        .set(acceptHeader, 'application/json')
        .send(payload)
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(200);

      should(body).be.an.Object();
      body.should.have.property('date').which.is.a.String();
      body.should.have.property('description').which.is.a.String().eql(payload.description);
      body.should.have.property('groupId').which.is.a.String().eql(this.group.id);
      body.should.have.property('ready').which.is.a.Boolean().eql(true);
      body.should.have.property('playersData').which.is.a.Array();
      should(body.playersData.length).eql(2);
    });
  });
});
