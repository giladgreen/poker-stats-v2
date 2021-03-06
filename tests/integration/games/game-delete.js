const request = require('supertest');
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
const token = 'token';
describe('delete player', function () {
  beforeEach(async function () {
    await clearAllData();
    this.group = await stubGroup();
    this.player = await stubPlayer(this.group.id);

    this.sandbox = sinon.createSandbox();
    const userId = await stubPlayerUser(this.group.id, this.player.id);
    mockGoogleTokenStrategy(this.sandbox, { token, userId });
  });
  afterEach(async function () {
    await clearAllData();
    this.sandbox.restore();
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
        .set(provider, GOOGLE)
        .set(authTokenHeader, token)
        .set(acceptHeader, 'application/json')
        .expect(204);

      should(body).be.an.Object();
    });
  });
});
