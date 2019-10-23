const request = require('supertest');
const should = require('should');
const sinon = require('sinon');

const { server } = require('../../../app');

const { clearAllData, mockGoogleTokenStrategy } = require('../../helpers/groups');

const acceptHeader = 'Accept';
const provider = 'provider';
const GOOGLE = 'google';
const authTokenHeader = 'x-auth-token';
const contentTypeHeader = 'Content-Type';
const token = 'token';
describe('create group', function () {
  beforeEach(async function () {
    await clearAllData();
    this.sandbox = sinon.createSandbox();
    const userId = 'userId';
    mockGoogleTokenStrategy(this.sandbox, { token, userId });
  });
  afterEach(async function () {
    await clearAllData();
    this.sandbox.restore();
  });
  describe('POST api/v2/groups', function () {
    it('when illegal payload - should return BAD REQUEST error', async function () {
      const payload = {
        someIlegalData: true,
      };
      const { body } = await request(server)
        .post('/api/v2/groups')
        .set(provider, GOOGLE)
        .set(authTokenHeader, token)
        .set(acceptHeader, 'application/json')
        .send(payload)
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(400);
      body.should.have.property('title').which.is.a.String();
      should(body.title).eql('Request validation failed: Parameter (body) failed schema validation');
    });
    it('should return created group', async function () {
      const payload = {
        name: 'test',
      };
      const { body } = await request(server)
        .post('/api/v2/groups')
        .set(provider, GOOGLE)
        .set(authTokenHeader, token)
        .set(acceptHeader, 'application/json')
        .send(payload)
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(201);
      body.should.have.property('name').which.is.a.String().eql(payload.name);
      body.should.have.property('id').which.is.a.String();
    });
  });
});
