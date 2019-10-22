const request = require('supertest');
const should = require('should');

const { server } = require('../../../app');

const { stubGroup, deleteStubGroup, clearAllData } = require('../../helpers/groups');

const acceptHeader = 'Accept';
describe('delete group', function () {
  beforeEach(async function () {
    await clearAllData();
    process.env.test = true;
  });
  describe('DELETE api/v2/groups/{groupId}', function () {
    beforeEach(async function () {
      this.group = await stubGroup();
    });
    afterEach(async function () {
      await deleteStubGroup(this.group);
    });
    it('should return correct status', async function () {
      const { body } = await request(server)
        .delete(`/api/v2/groups/${this.group.id}`)
        .set(acceptHeader, 'application/json')
        .expect(204);

      should(body).be.an.Object();
    });
  });
});