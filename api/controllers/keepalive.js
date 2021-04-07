const HttpStatus = require('http-status-codes');

function keepAlive(req, res, next) {
    res.status(HttpStatus.OK).send({ status: 'still alive' });
}

module.exports = {
    keepAlive,
};
