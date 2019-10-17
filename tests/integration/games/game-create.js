const request = require('supertest');
const should = require('should');

const { server } = require('../../../app');

const { clearAllData, stubGroup } = require('../../helpers/groups');
const { stubPlayer } = require('../../helpers/players');

const acceptHeader = 'Accept';
const contentTypeHeader = 'Content-Type';
describe('create game', function () {
  beforeEach(async function () {
    await clearAllData();
    this.group = await stubGroup();
    this.player = await stubPlayer(this.group.id);
  });
  afterEach(async function () {
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
        .send(payload)
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(201);
      body.should.have.property('date').which.is.a.String();
      body.should.have.property('description').which.is.a.String().eql(payload.description);
      body.should.have.property('groupId').which.is.a.String().eql(this.group.id);
      body.should.have.property('playersData').which.is.a.Array();
      should(body.playersData.length).eql(0);
    });
    it('when passing players data - should return created game', async function () {
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
        .send(payload)
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(201);
      body.should.have.property('date').which.is.a.String();
      body.should.have.property('description').which.is.a.String().eql(payload.description);
      body.should.have.property('groupId').which.is.a.String().eql(this.group.id);
      body.should.have.property('playersData').which.is.a.Array();
      should(body.playersData.length).eql(1);
      should(body.playersData[0].playerId).eql(payload.playersData[0].playerId);
      should(body.playersData[0].buyIn).eql(payload.playersData[0].buyIn);
      should(body.playersData[0].cashOut).eql(payload.playersData[0].cashOut);
    });
  });
});
