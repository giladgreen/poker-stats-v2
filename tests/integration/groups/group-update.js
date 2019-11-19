const request = require('supertest');
const uuid = require('uuid/v4');
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
const contentTypeHeader = 'Content-Type';
const token = 'token';
describe('update group', function () {
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
  describe('PATCH api/v2/groups/{groupId}', function () {
    it('should return 401 error in case of wrong groupId', async function () {
      const groupId = uuid();
      const { body } = await request(server)
        .patch(`/api/v2/groups/${groupId}`)
        .set(provider, GOOGLE)
        .set(authTokenHeader, token)
        .set(acceptHeader, 'application/json')
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(401);
      body.should.have.property('title').which.is.a.String();
      should(body.title).eql('user not belong to group');
    });
    it('should return updated details', async function () {
      const payload = {
        name: 'new name',
      };
      const { body } = await request(server)
        .patch(`/api/v2/groups/${this.group.id}`)
        .set(provider, GOOGLE)
        .set(authTokenHeader, token)
        .set(acceptHeader, 'application/json')
        .send(payload)
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(200);

      should(body).be.an.Object();
      body.should.have.property('name').which.is.a.String().eql(payload.name);
    });
  });
});
