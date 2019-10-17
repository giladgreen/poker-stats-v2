const request = require('supertest');
const should = require('should');

const { server } = require('../../../app');

const { stubGroup, clearAllData } = require('../../helpers/groups');
const { stubPlayer } = require('../../helpers/players');
const { deleteGroupGames, stubGame } = require('../../helpers/games');


const acceptHeader = 'Accept';
describe('delete player', function () {
  beforeEach(async function () {
    await clearAllData();
    this.group = await stubGroup();
    this.player = await stubPlayer(this.group.id);
  });
  afterEach(async function () {
    await clearAllData();
  });
  describe('DELETE api/v2/groups/{groupId}/games/{gameId}', function () {
    beforeEach(async function () {
      this.game = await stubGame(this.group.id, this.player.id);
    });
    afterEach(async function () {
      await deleteGroupGames(this.group.id);
    });
    it('should return correct status', async function () {
      const { body } = await request(server)
        .delete(`/api/v2/groups/${this.group.id}/games/${this.game.id}`)
        .set(acceptHeader, 'application/json')
        .expect(204);

      should(body).be.an.Object();
    });
  });
});
