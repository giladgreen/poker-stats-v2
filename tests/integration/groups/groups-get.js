const request = require('supertest');
const should = require('should');
const { server } = require('../../../app');
const { stubGroups, deleteStubGroup, clearAllData } = require('../../helpers/groups');

const acceptHeader = 'Accept';
const contentTypeHeader = 'Content-Type';

describe('get groups list', function () {
  beforeEach(async function () {
    await clearAllData();
    this.groups = await stubGroups(10);
    process.env.test = true;
  });
  afterEach(async function () {
    await Promise.all(this.groups.map(group => deleteStubGroup(group)));
  });
  describe('GET api/v2/groups', function () {
    it('should be able to get groups with default pagination', async function () {
      const { body } = await request(server)
        .get('/api/v2/groups')
        .set(acceptHeader, 'application/json')
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(200);
      body.should.have.property('results').which.is.a.Array();
      body.should.have.property('metadata').which.is.a.Object();

      should(body.results.length).eql(10);
      should(body.metadata).eql({
        totalResults: 10,
        count: 10,
        limit: 1000,
        offset: 0,
      });
    });
    it('should be able to get groups with custom pagination', async function () {
      const { body } = await request(server)
        .get('/api/v2/groups?limit=5&offset=8')
        .set(acceptHeader, 'application/json')
        .expect(contentTypeHeader, 'application/json; charset=utf-8')
        .expect(200);
      body.should.have.property('results').which.is.a.Array();
      body.should.have.property('metadata').which.is.a.Object();

      should(body.results.length).eql(2);
      should(body.metadata).eql({
        totalResults: 10,
        count: 2,
        limit: 5,
        offset: 8,
      });
    });
  });
});
