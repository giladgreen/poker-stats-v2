const request = require('supertest');
const should = require('should');

const { server } = require('../../../app');

const { stubGroup, deleteStubGroup, clearAllData } = require('../../helpers/groups');

const acceptHeader = 'Accept';
const provider = 'provider';
const GOOGLE = 'google';
const authTokenHeader = 'x-auth-token';
const token = 'token';
describe('delete group', function () {
  beforeEach(async function () {
    await clearAllData();
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
        .set(provider, GOOGLE)
        .set(authTokenHeader, token)
        .set(acceptHeader, 'application/json')
        .expect(204);

      should(body).be.an.Object();
    });
  });
});
