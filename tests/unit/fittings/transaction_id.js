const should = require('should');
const getFitting = require('../../../api/fittings/transaction_id');

describe('fittings:transaction_id', function () {
  it('should set transaction id', (done) => {
    const request = {url:""};
    const response = {
      headers: {},
      setHeader: (key, value) => {
        response.headers[key] = value;
      },
    };
    getFitting()({ request, response }, function () {
      request.should.have.property('tid').which.is.a.String();
      response.headers.should.have.property('Transaction-ID').which.is.a.String();
      should(request.tid).be.eql(response.headers['Transaction-ID']);
      done();
    });
  });
  it('should throw error', (done) => {
    const thrownError = new Error('meesage');
    const request = {};
    const response = {
      headers: {},
      setHeader() {
        throw thrownError;
      },
    };
    getFitting()({ request, response }, (error) => {
      request.should.have.property('tid').which.is.a.String();

      should(error).be.eql(thrownError);
      done();
    });
  });
});
