const HttpStatus = require('http-status-codes');

function keepAlive(req, res, next) {
    res.status(HttpStatus.OK).send({ alive: true });
}

module.exports = {
    keepAlive,
};
