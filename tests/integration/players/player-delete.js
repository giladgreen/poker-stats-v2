const request = require('supertest');
const should = require('should');

const { server } = require('../../../app');

const { stubGroup, clearAllData } = require('../../helpers/groups');
const { deleteGroupPlayers, stubPlayer } = require('../../helpers/players');


const acceptHeader = 'Accept';
describe('delete player', function () {
  beforeEach(async function () {
    await clearAllData();
    this.group = await stubGroup();
  });
  afterEach(async function () {
    await clearAllData();
  });
  describe('DELETE api/v2/groups/{groupId}/players/{playerId}', function () {
    beforeEach(async function () {
      this.player = await stubPlayer(this.group.id);
    });
    afterEach(async function () {
      await deleteGroupPlayers(this.group.id);
    });
    it('should return correct status', async function () {
      const { body } = await request(server)
        .delete(`/api/v2/groups/${this.group.id}/players/${this.player.id}`)
        .set(acceptHeader, 'application/json')
        .expect(204);

      should(body).be.an.Object();
    });
  });
});
