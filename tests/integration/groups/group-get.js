const request = require('supertest');
const uuid = require('uuid/v4');
const should = require('should');

const { server } = require('../../../app');

const { stubGroup, deleteStubGroup, clearAllData } = require('../../helpers/groups');

const acceptHeader = 'Accept';
const contentTypeHeader = 'Content-Type';
describe('get single group', function () {
  beforeEach(async function () {
    await clearAllData();
    process.env.test = true;
  });
  describe('GET api/v2/groups/{groupId}', function () {
    beforeEach(async function () {
      this.group = await stubGroup();
    });
    afterEach(async function () {
      await deleteStubGroup(this.group);
    });
    it('should return 404 error in case of wrong groupId', async function () {
      const groupId = uuid();
      const { body } = await request(server)
        .get(`/api/v2/groups/${groupId}`)
        .set(acceptHeader, 'application/json')
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(404);
      body.should.have.property('title').which.is.a.String();
      should(body.title).eql('group not found');
    });
    it('should return group details', async function () {
      const { body } = await request(server)
        .get(`/api/v2/groups/${this.group.id}`)
        .set(acceptHeader, 'application/json')
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(200);

      should(body).be.an.Object();
      body.should.have.property('name').which.is.a.String().eql('test');
    });
  });
});
