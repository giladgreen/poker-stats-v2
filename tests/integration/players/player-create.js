const request = require('supertest');
const should = require('should');
const sinon = require('sinon');

const { server } = require('../../../app');

const { clearAllData, stubGroup, mockGoogleTokenStrategy } = require('../../helpers/groups');
const { stubPlayerUser } = require('../../helpers/players');

const acceptHeader = 'Accept';
const provider = 'provider';
const GOOGLE = 'google';
const authTokenHeader = 'x-auth-token';
const contentTypeHeader = 'Content-Type';
const token = 'token';
describe('create player', function () {
  beforeEach(async function () {
    await clearAllData();
    this.group = await stubGroup();
    this.sandbox = sinon.createSandbox();
    const userId = await stubPlayerUser(this.group.id);
    mockGoogleTokenStrategy(this.sandbox, { token, userId });
  });
  afterEach(async function () {
    await clearAllData();
    this.sandbox.restore();
  });
  describe('POST api/v2/groups/{groupId}/players', function () {
    it('when illegal payload - should return BAD REQUEST error', async function () {
      const payload = {
        someIlegalData: true,
      };
      const { body } = await request(server)
        .post(`/api/v2/groups/${this.group.id}/players`)
        .set(provider, GOOGLE)
        .set(authTokenHeader, token)
        .set(acceptHeader, 'application/json')
        .send(payload)
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(400);
      body.should.have.property('title').which.is.a.String();
      should(body.title).eql('Request validation failed: Parameter (body) failed schema validation');
    });
    it('should return created player', async function () {
      const payload = {
        name: 'gilad green',
        email: 'green.gilad@mail.com',
      };
      const { body } = await request(server)
        .post(`/api/v2/groups/${this.group.id}/players`)
        .set(provider, GOOGLE)
        .set(authTokenHeader, token)
        .set(acceptHeader, 'application/json')
        .send(payload)
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(201);
      body.should.have.property('name').which.is.a.String().eql(payload.name);
      body.should.have.property('email').which.is.a.String().eql(payload.email);
      body.should.have.property('id').which.is.a.String();
    });
  });
});
