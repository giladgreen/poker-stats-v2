const sinon = require('sinon');
const { isBoom } = require('boom');
const should = require('should');
const { players } = require('../../../api/models');
const playersService = require('../../../api/services/players');


describe('services: players', function () {
  const groupId = 'groupId';
  const playerId = 'playerId';
  beforeEach(async function () {
    this.sandbox = sinon.createSandbox();
  });
  afterEach(function () {
    this.sandbox.restore();
  });
  describe('getPlayer()', function () {
    describe('player does not exist', function () {
      beforeEach(async function () {
        this.sandbox.stub(players, 'findOne').resolves(null);
      });
      it('should throw correct error', async function () {
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
    describe('player does exist', function () {
      const player = {
        id: 'id',
        groupId,
        firstName: 'firstName',
        familyName: 'familyName',
      };
      beforeEach(async function () {
        this.playerFindOne = this.sandbox.stub(players, 'findOne').resolves({
          toJSON: () => player,
        });
      });
      it('should return correct data', async function () {
        const resultPlayer = await playersService.getPlayer({ groupId, playerId: player.id });
        should(resultPlayer).be.eql(player);
        should(players.findOne.called).be.eql(true);
        const playerFindOneArgs = this.playerFindOne.getCall(0);
        should(playerFindOneArgs.args[0].where).be.eql({ groupId, id: player.id });
      });
    });
  });
  describe('getPlayers()', function () {
    describe('no results', function () {
      beforeEach(async function () {
        this.sandbox.stub(players, 'count').resolves(0);
        this.playerFindAll = this.sandbox.stub(players, 'findAll').resolves([]);
      });
      it('should return correct data back', async function () {
        const resultObject = await playersService.getPlayers(groupId);
        should(resultObject).be.eql({
          metadata: {
            totalResults: 0,
            count: 0,
            limit: 1000,
            offset: 0,
          },
          results: [],
        });
        should(players.count.called).be.eql(true);
        should(players.findAll.called).be.eql(true);
        const playerFindAllArgs = this.playerFindAll.getCall(0);
        should(playerFindAllArgs.args[0].where).be.eql({ groupId });
      });
    });
    describe('paginated results', function () {
      const totalResults = 10;
      const count = 3;
      const limit = 5;
      const offset = 8;
      const resultPlayers = Array.from({ length: count }).map(() => ({
        id: 'id',
        groupId,
        firstName: 'firstName',
        familyName: 'familyName',
      }));

      beforeEach(async function () {
        this.sandbox.stub(players, 'count').resolves(totalResults);
        this.playerFindAll = this.sandbox.stub(players, 'findAll').resolves(resultPlayers.map(player => ({ toJSON: () => player })));
      });
      it('should return correct data back', async function () {
        const resultObject = await playersService.getPlayers(groupId, limit, offset);
        should(resultObject).be.eql({
          metadata: {
            totalResults,
            count,
            limit,
            offset,
          },
          results: resultPlayers,
        });
        should(players.count.called).be.eql(true);
        should(players.findAll.called).be.eql(true);
        const playerFindAllArgs = this.playerFindAll.getCall(0);
        should(playerFindAllArgs.args[0].where).be.eql({ groupId });
        should(playerFindAllArgs.args[0].limit).be.eql(limit);
        should(playerFindAllArgs.args[0].offset).be.eql(offset);
      });
    });
  });
  describe('createPlayer()', function () {
    const data = {
      firstName: 'firstName',
      familyName: 'familyName',
    };

    beforeEach(async function () {
      this.createPlayer = this.sandbox.stub(players, 'create').resolves({ id: 'id' });
      this.playerFindOne = this.sandbox.stub(players, 'findOne').resolves({
        toJSON: () => data,
      });
    });
    it('should return correct data back', async function () {
      const result = await playersService.createPlayer(groupId, data);
      should(result).be.eql(data);
      should(players.create.called).be.eql(true);
      should(players.findOne.called).be.eql(true);
      const createPlayerArgs = this.createPlayer.getCall(0);
      should(createPlayerArgs.args[0]).be.eql({
        ...data,
        email: '-',
        imageUrl: 'anonymous',
        groupId,
      });
    });
  });
  describe('updatePlayer()', function () {
    describe('player does not exist', function () {
      beforeEach(async function () {
        this.sandbox.stub(players, 'findOne').resolves(null);
      });
      it('should throw correct error', async function () {
        try {
          await playersService.updatePlayer(groupId, playerId, {});
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
    describe('when player exist', function () {
      const data = {
        id: playerId,
        firstName: 'firstName',
        familyName: 'familyName',
      };

      beforeEach(async function () {
        this.playerFindOne = this.sandbox.stub(players, 'findOne').resolves({
          id: playerId,
          toJSON: () => data,
        });
        this.updatePlayer = this.sandbox.stub(players, 'update').resolves({});
      });
      it('should return correct data back', async function () {
        const result = await playersService.updatePlayer(groupId, playerId, data);
        should(result).be.eql(data);
        should(players.update.called).be.eql(true);
        should(players.findOne.called).be.eql(true);
        const updatePlayerArgs = this.updatePlayer.getCall(0);
        should(updatePlayerArgs.args[0]).be.eql(data);
      });
    });
  });
  describe('deletePlayer()', function () {
    beforeEach(async function () {
      this.destroyPlayer = this.sandbox.stub(players, 'destroy').resolves(true);
    });
    it('should return correct data back', async function () {
      const result = await playersService.deletePlayer(groupId, playerId);
      should(result).be.eql(true);
      should(players.destroy.called).be.eql(true);
      const destroyPlayerArgs = this.destroyPlayer.getCall(0);
      should(destroyPlayerArgs.args[0].where).be.eql({ groupId, id: playerId });
    });
  });
});
