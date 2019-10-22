const request = require('supertest');
const uuid = require('uuid/v4');
const should = require('should');

const { server } = require('../../../app');

const { stubGroup, clearAllData } = require('../../helpers/groups');
const { stubPlayer, deleteGroupPlayers } = require('../../helpers/players');


const acceptHeader = 'Accept';
const contentTypeHeader = 'Content-Type';
describe('update player', function () {
  beforeEach(async function () {
    await clearAllData();
    this.group = await stubGroup();
    process.env.test = true;
  });
  afterEach(async function () {
    await clearAllData();
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
        .set(acceptHeader, 'application/json')
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(404);
      body.should.have.property('title').which.is.a.String();
      should(body.title).eql('player not found');
    });
    it('should return updated details', async function () {
      const payload = {
        familyName: 'new name',
      };
      const { body } = await request(server)
        .patch(`/api/v2/groups/${this.group.id}/players/${this.player.id}`)
        .set(acceptHeader, 'application/json')
        .send(payload)
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(200);

      should(body).be.an.Object();
      body.should.have.property('familyName').which.is.a.String().eql(payload.familyName);
    });
  });
});
