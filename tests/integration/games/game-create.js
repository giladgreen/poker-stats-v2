const request = require('supertest');
const should = require('should');
const sinon = require('sinon');

const { server } = require('../../../app');

const { clearAllData, stubGroup, mockGoogleTokenStrategy } = require('../../helpers/groups');
const { stubPlayer, stubPlayerUser } = require('../../helpers/players');

const acceptHeader = 'Accept';
const provider = 'provider';
const GOOGLE = 'google';
const authTokenHeader = 'x-auth-token';
const contentTypeHeader = 'Content-Type';
const token = 'token';

describe('create game', function () {
  beforeEach(async function () {
    this.sandbox = sinon.createSandbox();
    await clearAllData();
    this.group = await stubGroup();
    this.player = await stubPlayer(this.group.id);
    this.player2 = await stubPlayer(this.group.id);
    const userId = await stubPlayerUser(this.group.id, this.player.id);
    mockGoogleTokenStrategy(this.sandbox, { token, userId });
  });
  afterEach(async function () {
    this.sandbox.restore();
    await clearAllData();
  });
  describe('POST api/v2/groups/{groupId}/games', function () {
    it('when not passing any players data - should return created game', async function () {
      const payload = {
        date: new Date(),
        description: 'description',
      };
      const { body } = await request(server)
        .post(`/api/v2/groups/${this.group.id}/games`)
        .set(acceptHeader, 'application/json')
        .set(provider, GOOGLE)
        .set(authTokenHeader, token)
        .send(payload)
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(201);
      body.should.have.property('date').which.is.a.String();
      body.should.have.property('description').which.is.a.String().eql(payload.description);
      body.should.have.property('groupId').which.is.a.String().eql(this.group.id);
      body.should.have.property('playersData').which.is.a.Array();
      body.should.have.property('ready').which.is.a.Boolean().eql(false);
      should(body.playersData.length).eql(0);
    });
    it('when passing players data (un-ready game) - should return created game', async function () {
      const payload = {
        date: new Date(),
        description: 'description',
        playersData: [
          {
            playerId: this.player.id,
            buyIn: 50,
            cashOut: 200,
          },
        ],
      };
      const { body } = await request(server)
        .post(`/api/v2/groups/${this.group.id}/games`)
        .set(acceptHeader, 'application/json')
        .set(provider, GOOGLE)
        .set(authTokenHeader, token)
        .send(payload)
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(201);
      body.should.have.property('date').which.is.a.String();
      body.should.have.property('description').which.is.a.String().eql(payload.description);
      body.should.have.property('groupId').which.is.a.String().eql(this.group.id);
      body.should.have.property('ready').which.is.a.Boolean().eql(false);
      body.should.have.property('playersData').which.is.a.Array();
      should(body.playersData.length).eql(1);
      should(body.playersData[0].playerId).eql(payload.playersData[0].playerId);
      should(body.playersData[0].buyIn).eql(payload.playersData[0].buyIn);
      should(body.playersData[0].cashOut).eql(payload.playersData[0].cashOut);
    });
    it('when passing players data (ready game) - should return created game', async function () {
      const payload = {
        date: new Date(),
        description: 'description',
        playersData: [
          {
            playerId: this.player.id,
            buyIn: 50,
            cashOut: 200,
          },
          {
            playerId: this.player2.id,
            buyIn: 150,
            cashOut: 0,
          },
        ],
      };
      const { body } = await request(server)
        .post(`/api/v2/groups/${this.group.id}/games`)
        .set(provider, GOOGLE)
        .set(authTokenHeader, token)
        .set(acceptHeader, 'application/json')
        .send(payload)
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(201);
      body.should.have.property('date').which.is.a.String();
      body.should.have.property('description').which.is.a.String().eql(payload.description);
      body.should.have.property('groupId').which.is.a.String().eql(this.group.id);
      body.should.have.property('ready').which.is.a.Boolean().eql(true);
      body.should.have.property('playersData').which.is.a.Array();
      should(body.playersData.length).eql(2);
    });
  });
});
