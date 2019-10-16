const request = require('supertest');
const should = require('should');

const { server } = require('../../../app');

const { clearAllData } = require('../../helpers/groups');

const acceptHeader = 'Accept';
const contentTypeHeader = 'Content-Type';
describe('create group', function () {
  beforeEach(async function () {
    await clearAllData();
  });
  afterEach(async function () {
    await clearAllData();
  });
  describe('POST api/v2/groups', function () {
    it('when ilegal payload - should return BAD REQUEST error', async function () {
      const payload = {
        someIlegalData: true,
      };
      const { body } = await request(server)
        .post('/api/v2/groups')
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
        .set(acceptHeader, 'application/json')
        .send(payload)
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(201);
      body.should.have.property('name').which.is.a.String().eql(payload.name);
      body.should.have.property('id').which.is.a.String();
    });
  });
});
