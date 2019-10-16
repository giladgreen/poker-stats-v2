const getFitting = require('../../../api/fittings/error_handler');

describe('fittings:transaction_id', function () {
  it('should set transaction id', (done) => {
    const request = {};
    const response = { on: (name, cb) => { cb(name); } };
    getFitting()({ request, response }, function () {
      done();
    });
  });
});
