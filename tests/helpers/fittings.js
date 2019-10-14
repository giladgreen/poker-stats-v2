const should = require('should');

function expectResponse({ statusCode: expectedStatusCode, body }, done) {
  return {
    status(statusCode) {
      should(statusCode).eql(expectedStatusCode);
      return {
        send(data) {
          should(data).be.an.Object();
          if (body) {
            should(data).deepEqual(body);
          }
          done();
        },
      };
    },
  };
}

module.exports = {
  expectResponse,
};
