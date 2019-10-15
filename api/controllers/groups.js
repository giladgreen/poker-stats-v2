const HttpStatus = require('http-status-codes');
const groupsService = require('../services/groups');

function getGroup(req, res, next) {
  const { groupId } = req.getAllParams();
  groupsService.getGroup(groupId)
      .then((group) => {
        res.send(group);
      })
      .catch(next);
}

function getGroups(req, res, next) {
  groupsService.getGroups()
      .then((groups) => {
        res.send({ metadata: { count: groups.length }, groups });
      })
      .catch(next);
}

function createGroup(req, res, next) {
  const data = req.getBody();
  groupsService.createGroup(data)
      .then((group) => {
          res.status(HttpStatus.CREATED).send(group);
      })
      .catch(next);
}

module.exports = {
    getGroup,
  getGroups,
  createGroup
};

