const HttpStatus = require('http-status-codes');
const groupsService = require('../services/groups');

function getGroup(req, res, next) {
  const { userContext } = req;
  const { groupId } = req.getAllParams();
  groupsService.getGroup(userContext, groupId)
    .then((group) => {
      res.send(group);
    })
    .catch(next);
}

function getGroups(req, res, next) {
  const { userContext } = req;
  const { limit, offset } = req.getAllParams();
  groupsService.getGroups(userContext, limit, offset)
    .then((result) => {
      res.send(result);
    })
    .catch(next);
}

function createGroup(req, res, next) {
  const { userContext } = req;
  const data = req.getBody();
  groupsService.createGroup(userContext, data)
    .then((group) => {
      res.status(HttpStatus.CREATED).send(group);
    })
    .catch(next);
}

function updateGroup(req, res, next) {
  const { userContext } = req;
  const { groupId } = req.getAllParams();
  const data = req.getBody();
  groupsService.updateGroup(userContext, groupId, data)
    .then((group) => {
      res.send(group);
    })
    .catch(next);
}
function deleteGroup(req, res, next) {
  const { groupId } = req.getAllParams();
  groupsService.deleteGroup(groupId)
    .then(() => {
      res.status(HttpStatus.NO_CONTENT).send({ deleted: true });
    })
    .catch(next);
}

module.exports = {
  createGroup,
  getGroup,
  getGroups,
  updateGroup,
  deleteGroup,
};
