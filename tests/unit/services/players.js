const sinon = require('sinon');
const { isBoom } = require('boom');
const should = require('should');
const { players } = require('../../../api/models');
const playersService = require('../../../api/services/players');


describe('[unit] services:players', () => {
  const groupId = 'groupId';
  beforeEach(async () => {
    this.sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    this.sandbox.restore();
  });
  describe('getPlayer()', () => {
    describe('player does not exist', () => {
      beforeEach(async () => {
        this.playerFindOne = this.sandbox.stub(players, 'findOne').resolves(null);
      });
      it('should throw correct error', async () => {
        const playerId = 'playerId';
        try {
          await playersService.getPlayer({ groupId, playerId });
        } catch (error) {
          should(isBoom(error)).be.eql(true);
          should(error.data).be.eql({ groupId, playerId });
          should(error.output.payload).be.eql({
            statusCode: 404,
            error: 'Not Found',
            message: 'player not found',
          });
        }
      });
    });
    describe('player does exist', () => {
      const player = {
        id: 'id',
        groupId,
        firstName: 'firstName',
        familyName: 'familyName',
      };
      beforeEach(async () => {
        this.playerFindOne = this.sandbox.stub(players, 'findOne').resolves({
          toJSON: () => player,
        });
      });
      it('should throw correct error', async () => {
        const resultPlayer = await playersService.getPlayer({ groupId, playerId: player.id });
        should(resultPlayer).be.eql(player);
        should(players.findOne.called).be.eql(true);
        const playerFindOneArgs = this.playerFindOne.getCall(0);
        should(playerFindOneArgs.args[0].where).be.eql({ groupId, id: player.id });
      });
    });
  });
});
