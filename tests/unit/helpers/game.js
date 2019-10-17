const should = require('should');
const gameHelper = require('../../../api/helpers/game');

describe('helpers: game', function () {
  describe('when no playersData', function () {
    it('should return false', async function () {
      const ready = gameHelper.isGameReady();
      should(ready).eql(false);
    });
  });
  describe('when empty playersData', function () {
    it('should return false', async function () {
      const ready = gameHelper.isGameReady([]);
      should(ready).eql(false);
    });
  });
  describe('when playersData size smaller then 2', function () {
    it('should return false', async function () {
      const ready = gameHelper.isGameReady([{}]);
      should(ready).eql(false);
    });
  });
  describe('when playersData has a player with 0 buyIn', function () {
    it('should return false', async function () {
      const playersData = [{
        playerId: '1',
        cashOut: 50,
        buyIn: 0,
      }, {
        playerId: '2',
        cashOut: 50,
        buyIn: 50,
      }];
      const ready = gameHelper.isGameReady(playersData);
      should(ready).eql(false);
    });
  });
  describe('when playersData has a player with negative buyIn', function () {
    it('should return false', async function () {
      const playersData = [{
        playerId: '1',
        cashOut: 50,
        buyIn: -10,
      }, {
        playerId: '2',
        cashOut: 50,
        buyIn: 50,
      }];
      const ready = gameHelper.isGameReady(playersData);
      should(ready).eql(false);
    });
  });
  describe('when playersData has a player with negative cashOut', function () {
    it('should return false', async function () {
      const playersData = [{
        playerId: '1',
        cashOut: -50,
        buyIn: 10,
      }, {
        playerId: '2',
        cashOut: 50,
        buyIn: 50,
      }];
      const ready = gameHelper.isGameReady(playersData);
      should(ready).eql(false);
    });
  });
  describe('when playersData does not sum to 0', function () {
    it('should return false', async function () {
      const playersData = [{
        playerId: '1',
        cashOut: 50,
        buyIn: 50,
      }, {
        playerId: '2',
        cashOut: 50,
        buyIn: 100,
      }];
      const ready = gameHelper.isGameReady(playersData);
      should(ready).eql(false);
    });
  });
  describe('when playersData does sum to 0', function () {
    it('should return true', async function () {
      const playersData = [{
        playerId: '1',
        cashOut: 150,
        buyIn: 50,
      }, {
        playerId: '2',
        cashOut: 250,
        buyIn: 350,
      }];
      const ready = gameHelper.isGameReady(playersData);
      should(ready).eql(true);
    });
  });
});
