const request = require('supertest');
const should = require('should');
const sinon = require('sinon');

const { server } = require('../../../app');

const {
  stubGroup, deleteStubGroup, clearAllData, mockGoogleTokenStrategy,
} = require('../../helpers/groups');
const { stubPlayerUser } = require('../../helpers/players');

const acceptHeader = 'Accept';
const provider = 'provider';
const GOOGLE = 'google';
const authTokenHeader = 'x-auth-token';
const token = 'token';
describe('delete group', function () {
  beforeEach(async function () {
    await clearAllData();
    this.sandbox = sinon.createSandbox();
    this.group = await stubGroup();
    const userId = await stubPlayerUser(this.group.id);
    mockGoogleTokenStrategy(this.sandbox, { token, userId });
  });
  afterEach(async function () {
    await deleteStubGroup(this.group);
    this.sandbox.restore();
  });
  describe('DELETE api/v2/groups/{groupId}', function () {
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
