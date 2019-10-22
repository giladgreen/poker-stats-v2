const request = require('supertest');
const should = require('should');

const { server } = require('../../../app');

const { clearAllData, stubGroup } = require('../../helpers/groups');

const acceptHeader = 'Accept';
const contentTypeHeader = 'Content-Type';
describe('create player', function () {
  beforeEach(async function () {
    await clearAllData();
    this.group = await stubGroup();
    process.env.test = true;
  });
  afterEach(async function () {
    await clearAllData();
  });
  describe('POST api/v2/groups/{groupId}/players', function () {
    it('when illegal payload - should return BAD REQUEST error', async function () {
      const payload = {
        someIlegalData: true,
      };
      const { body } = await request(server)
        .post(`/api/v2/groups/${this.group.id}/players`)
        .set(acceptHeader, 'application/json')
        .send(payload)
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(400);
      body.should.have.property('title').which.is.a.String();
      should(body.title).eql('Request validation failed: Parameter (body) failed schema validation');
    });
    it('should return created player', async function () {
      const payload = {
        firstName: 'gilad',
        familyName: 'green',
      };
      const { body } = await request(server)
        .post(`/api/v2/groups/${this.group.id}/players`)
        .set(acceptHeader, 'application/json')
        .send(payload)
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(201);
      body.should.have.property('firstName').which.is.a.String().eql(payload.firstName);
      body.should.have.property('familyName').which.is.a.String().eql(payload.familyName);
      body.should.have.property('email').which.is.a.String().eql('-');
      body.should.have.property('phone').which.is.a.String().eql('-');
      body.should.have.property('imageUrl').which.is.a.String().eql('anonymous');
      body.should.have.property('id').which.is.a.String();
    });
  });
});
