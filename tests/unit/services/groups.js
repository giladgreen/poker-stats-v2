const sinon = require('sinon');
const { isBoom } = require('boom');
const should = require('should');
const {
  groups, players, gamesData, games,
} = require('../../../api/models');
const groupsService = require('../../../api/services/groups');


describe('services: groups', function () {
  const groupId = 'groupId';
  beforeEach(async function () {
    this.sandbox = sinon.createSandbox();
  });
  afterEach(function () {
    this.sandbox.restore();
  });
  describe('getGroups()', function () {
    describe('Group does not exist', function () {
      beforeEach(async function () {
        this.sandbox.stub(groups, 'findOne').resolves(null);
      });
      it('should throw correct error', async function () {
        try {
          await groupsService.getGroup(groupId);
        } catch (error) {
          should(isBoom(error)).be.eql(true);
          should(error.data).be.eql({ groupId });
          should(error.output.payload).be.eql({
            statusCode: 404,
            error: 'Not Found',
            message: 'group not found',
          });
        }
      });
    });
    describe('group does exist', function () {
      const group = {
        id: 'id',
        name: 'name',
      };
      beforeEach(async function () {
        this.groupFindOne = this.sandbox.stub(groups, 'findOne').resolves({
          toJSON: () => group,
        });
      });
      it('should return correct data', async function () {
        const resultGroup = await groupsService.getGroup(groupId);
        should(resultGroup).be.eql(group);
        should(groups.findOne.called).be.eql(true);
        const groupFindOneArgs = this.groupFindOne.getCall(0);
        should(groupFindOneArgs.args[0].where).be.eql({ id: groupId });
      });
    });
  });
  describe('getGroups()', function () {
    describe('no results', function () {
      beforeEach(async function () {
        this.sandbox.stub(groups, 'count').resolves(0);
        this.sandbox.stub(groups, 'findAll').resolves([]);
      });
      it('should return correct data back', async function () {
        const resultObject = await groupsService.getGroups();
        should(resultObject).be.eql({
          metadata: {
            totalResults: 0,
            count: 0,
            limit: 1000,
            offset: 0,
          },
          results: [],
        });
        should(groups.count.called).be.eql(true);
        should(groups.findAll.called).be.eql(true);
      });
    });
    describe('paginated results', function () {
      const totalResults = 10;
      const count = 3;
      const limit = 5;
      const offset = 8;
      const resultGroups = Array.from({ length: count }).map(() => ({
        id: 'id',
        name: 'name',
      }));

      beforeEach(async function () {
        this.sandbox.stub(groups, 'count').resolves(totalResults);
        this.groupsFindAll = this.sandbox.stub(groups, 'findAll').resolves(resultGroups.map(group => ({ toJSON: () => group })));
      });
      it('should return correct data back', async function () {
        const resultObject = await groupsService.getGroups(limit, offset);
        should(resultObject).be.eql({
          metadata: {
            totalResults,
            count,
            limit,
            offset,
          },
          results: resultGroups,
        });
        should(groups.count.called).be.eql(true);
        should(groups.findAll.called).be.eql(true);
        const groupsFindAllArgs = this.groupsFindAll.getCall(0);
        should(groupsFindAllArgs.args[0].limit).be.eql(limit);
        should(groupsFindAllArgs.args[0].offset).be.eql(offset);
      });
    });
  });
  describe('createGroups()', function () {
    const data = {
      name: 'name',
    };

    beforeEach(async function () {
      this.createGroup = this.sandbox.stub(groups, 'create').resolves({ id: 'id' });
      this.sandbox.stub(groups, 'findOne').resolves({
        toJSON: () => data,
      });
    });
    it('should return correct data back', async function () {
      const result = await groupsService.createGroup(data);
      should(result).be.eql(data);
      should(groups.create.called).be.eql(true);
      should(groups.findOne.called).be.eql(true);
      const createGroupArgs = this.createGroup.getCall(0);
      should(createGroupArgs.args[0]).be.eql(data);
    });
  });
  describe('updateGroups()', function () {
    describe('group does not exist', function () {
      beforeEach(async function () {
        this.sandbox.stub(groups, 'findOne').resolves(null);
      });
      it('should throw correct error', async function () {
        try {
          await groupsService.updateGroup(groupId, {});
        } catch (error) {
          should(isBoom(error)).be.eql(true);
          should(error.data).be.eql({ groupId });
          should(error.output.payload).be.eql({
            statusCode: 404,
            error: 'Not Found',
            message: 'group not found',
          });
        }
      });
    });
    describe('when group exist', function () {
      const data = {
        id: groupId,
        name: 'name',
      };

      beforeEach(async function () {
        this.sandbox.stub(groups, 'findOne').resolves({
          id: groupId,
          toJSON: () => data,
        });
        this.updateGroup = this.sandbox.stub(groups, 'update').resolves({});
      });
      it('should return correct data back', async function () {
        const result = await groupsService.updateGroup(groupId, data);
        should(result).be.eql(data);
        should(groups.update.called).be.eql(true);
        should(groups.findOne.called).be.eql(true);
        const updateGroupArgs = this.updateGroup.getCall(0);
        should(updateGroupArgs.args[0]).be.eql(data);
      });
    });
  });
  describe('deleteGroups()', function () {
    beforeEach(async function () {
      this.sandbox.stub(players, 'destroy').resolves(true);
      this.sandbox.stub(gamesData, 'destroy').resolves(true);
      this.sandbox.stub(games, 'destroy').resolves(true);
      this.destroyGroup = this.sandbox.stub(groups, 'destroy').resolves(true);
    });
    it('should return correct data back', async function () {
      const result = await groupsService.deleteGroup(groupId);
      should(result).be.eql(true);
      should(players.destroy.called).be.eql(true);
      should(gamesData.destroy.called).be.eql(true);
      should(games.destroy.called).be.eql(true);
      should(groups.destroy.called).be.eql(true);
      const destroyGroupArgs = this.destroyGroup.getCall(0);
      should(destroyGroupArgs.args[0].where).be.eql({ id: groupId });
    });
  });
});