const getFitting = require('../../../api/fittings/utils');

describe('fittings:transaction_id', function () {
  const request = {
    swagger: {
      params: {
        a: { value: 1 },
        b: { value: 2 },
        body: {
          value: {
            c: 3,
            d: 4,
          },
        },
      },
    },
  };
  it('should set transaction id', (done) => {
    const response = { on() {} };
    getFitting()({ request, response }, function () {
      done();
    });
  });
});
