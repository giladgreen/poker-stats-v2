const getFitting = require('../../../api/fittings/logger');

describe('fittings:transaction_id', function () {
  it('should set transaction id', (done) => {
    const request = {};
    const response = { on: (name, cb) => { cb(name); } };
    getFitting()({ request, response }, function () {
      done();
    });
  });
});
