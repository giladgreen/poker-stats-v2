const sinon = require('sinon');
const { isBoom } = require('boom');
const should = require('should');
const { games, gamesData } = require('../../../api/models');
const gamesService = require('../../../api/services/games');

describe('services: games', () => {
  const groupId = 'groupId';
  const gameId = 'gameId';
  const playersData = [
    {
      playerId: 'playerId',
      buyIn: 50,
      cashOut: 100,
    },
  ];
  beforeEach(async function () {
    this.sandbox = sinon.createSandbox();
  });
  afterEach(function () {
    this.sandbox.restore();
  });
  describe('getGame()', () => {
    describe('game does not exist', () => {
      beforeEach(async function () {
        this.sandbox.stub(games, 'findOne').resolves(null);
      });
      it('should throw correct error', async () => {
        try {
          await gamesService.getGame({ groupId, gameId });
        } catch (error) {
          should(isBoom(error)).be.eql(true);
          should(error.data).be.eql({ groupId, gameId });
          should(error.output.payload).be.eql({
            statusCode: 404,
            error: 'Not Found',
            message: 'game not found',
          });
        }
      });
    });
    describe('game does exist', () => {
      const game = {
        id: 'id',
        groupId,
        description: 'bla bla bla',
      };
      beforeEach(async function () {
        this.gamesFindOne = this.sandbox.stub(games, 'findOne').resolves({
          toJSON: () => game,
        });
      });
      it('should return correct data', async function () {
        const resultGame = await gamesService.getGame({ groupId, gameId: game.id });
        should(resultGame).be.eql(game);
        should(games.findOne.called).be.eql(true);
        const gamesFindOneArgs = this.gamesFindOne.getCall(0);
        should(gamesFindOneArgs.args[0].where).be.eql({ groupId, id: game.id });
      });
    });
  });
  describe('getGames()', () => {
    describe('no results', () => {
      beforeEach(async function () {
        this.sandbox.stub(games, 'count').resolves(0);
        this.gamesFindAll = this.sandbox.stub(games, 'findAll').resolves([]);
      });
      it('should return correct data back', async function () {
        const resultObject = await gamesService.getGames(groupId);
        should(resultObject).be.eql({
          metadata: {
            totalResults: 0,
            count: 0,
            limit: 1000,
            offset: 0,
          },
          results: [],
        });
        should(games.count.called).be.eql(true);
        should(games.findAll.called).be.eql(true);
        const gamesFindAllArgs = this.gamesFindAll.getCall(0);
        should(gamesFindAllArgs.args[0].where).be.eql({ groupId });
      });
    });
    describe('paginated results', () => {
      const totalResults = 10;
      const count = 3;
      const limit = 5;
      const offset = 8;
      const resultGames = Array.from({ length: count }).map(() => ({
        id: 'id',
        groupId,
        description: 'bla bla bla',
      }));

      beforeEach(async function () {
        this.sandbox.stub(games, 'count').resolves(totalResults);
        this.gamesFindAll = this.sandbox.stub(games, 'findAll').resolves(resultGames.map(game => ({ toJSON: () => game })));
      });
      it('should return correct data back', async function () {
        const resultObject = await gamesService.getGames(groupId, limit, offset);
        should(resultObject).be.eql({
          metadata: {
            totalResults,
            count,
            limit,
            offset,
          },
          results: resultGames,
        });
        should(games.count.called).be.eql(true);
        should(games.findAll.called).be.eql(true);
        const gamesFindAllArgs = this.gamesFindAll.getCall(0);
        should(gamesFindAllArgs.args[0].where).be.eql({ groupId });
        should(gamesFindAllArgs.args[0].limit).be.eql(limit);
        should(gamesFindAllArgs.args[0].offset).be.eql(offset);
      });
    });
  });
  describe('createGame()', () => {
    const date = (new Date()).toISOString();
    const data = {
      description: 'bla bla bla',
      date,
    };
    describe('without players data', () => {
      beforeEach(async function () {
        this.createGame = this.sandbox.stub(games, 'create').resolves({ id: 'id' });
        this.gamesFindOne = this.sandbox.stub(games, 'findOne').resolves({
          toJSON: () => ({ ...data }),
        });
      });
      it('should return correct data back', async function () {
        const result = await gamesService.createGame(groupId, { ...data });
        should(result).be.eql({ ...data, playersData: [] });
        should(games.create.called).be.eql(true);
        should(games.findOne.called).be.eql(true);
        const createGameArgs = this.createGame.getCall(0);
        should(createGameArgs.args[0]).be.eql({
          ...data,
          groupId,
        });
      });
    });
    describe('with players data', () => {
      beforeEach(async function () {
        this.createGame = this.sandbox.stub(games, 'create').resolves({ id: 'id' });
        this.sandbox.stub(gamesData, 'create').resolves({ id: 'id' });
        this.sandbox.stub(gamesData, 'findAll').resolves([{ toJSON: () => (playersData[0]) }]);
        this.gamesFindOne = this.sandbox.stub(games, 'findOne').resolves({
          toJSON: () => ({ ...data, playersData }),
        });
      });
      it('should return correct data back', async function () {
        const result = await gamesService.createGame(groupId, { ...data, playersData });
        should(result).be.eql({ ...data, playersData });
        should(games.create.called).be.eql(true);
        should(gamesData.create.called).be.eql(true);
        should(gamesData.findAll.called).be.eql(true);
        should(games.findOne.called).be.eql(true);
        const createGameArgs = this.createGame.getCall(0);
        should(createGameArgs.args[0]).be.eql({
          ...data,
          groupId,
        });
      });
    });
  });
  describe('updateGame()', () => {
    describe('game does not exist', () => {
      beforeEach(async function () {
        this.sandbox.stub(games, 'findOne').resolves(null);
      });
      it('should throw correct error', async () => {
        try {
          await gamesService.updateGame(groupId, gameId, {});
        } catch (error) {
          should(isBoom(error)).be.eql(true);
          should(error.data).be.eql({ groupId, gameId });
          should(error.output.payload).be.eql({
            statusCode: 404,
            error: 'Not Found',
            message: 'game not found',
          });
        }
      });
    });
    describe('when game exist', () => {
      const date = (new Date()).toISOString();
      const data = {
        description: 'bla bla bla',
        date,
      };
      describe('update does not contain players data', () => {
        beforeEach(async function () {
          this.gamesFindOne = this.sandbox.stub(games, 'findOne').resolves({
            id: gameId,
            toJSON: () => data,
          });
          this.updateGame = this.sandbox.stub(games, 'update').resolves({});
        });
        it('should return correct data back', async function () {
          const result = await gamesService.updateGame(groupId, gameId, data);
          should(result).be.eql(data);
          should(games.update.called).be.eql(true);
          should(games.findOne.called).be.eql(true);
          const updateGameArgs = this.updateGame.getCall(0);
          should(updateGameArgs.args[0]).be.eql(data);
        });
      });
      describe('update contain players data', () => {
        beforeEach(async function () {
          this.sandbox.stub(gamesData, 'destroy').resolves({});
          this.sandbox.stub(gamesData, 'create').resolves({ id: 'id' });
          this.sandbox.stub(gamesData, 'findAll').resolves([{ toJSON: () => (playersData[0]) }]);
          this.gamesFindOne = this.sandbox.stub(games, 'findOne').resolves({
            id: gameId,
            toJSON: () => data,
          });
          this.updateGame = this.sandbox.stub(games, 'update').resolves({});
        });
        it('should return correct data back', async function () {
          const result = await gamesService.updateGame(groupId, gameId, { ...data, playersData });
          should(result).be.eql({ ...data, playersData });
          should(gamesData.destroy.called).be.eql(true);
          should(gamesData.create.called).be.eql(true);
          should(gamesData.findAll.called).be.eql(true);
          should(games.update.called).be.eql(true);
          should(games.findOne.called).be.eql(true);
          const updateGameArgs = this.updateGame.getCall(0);
          should(updateGameArgs.args[0]).be.eql(data);
        });
      });
    });
  });
  describe('deleteGame()', () => {
    beforeEach(async function () {
      this.sandbox.stub(gamesData, 'destroy').resolves(true);
      this.destroyGame = this.sandbox.stub(games, 'destroy').resolves(true);
    });
    it('should return correct data back', async function () {
      const result = await gamesService.deleteGame(groupId, gameId);
      should(result).be.eql(true);
      should(gamesData.destroy.called).be.eql(true);
      should(games.destroy.called).be.eql(true);
      const destroyGameArgs = this.destroyGame.getCall(0);
      should(destroyGameArgs.args[0].where).be.eql({ groupId, id: gameId });
    });
  });
});
