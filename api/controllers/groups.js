const HttpStatus = require('http-status-codes');
const groupsRoutes = require('express').Router({ mergeParams: true });
const groupsService = require('../services/groups');


function getGroup(req, res, next) {
  const { userContext } = req;
  const { groupId } = req.params;
  groupsService.getGroup(userContext, groupId)
    .then((group) => {
      res.send(group);
    })
    .catch(next);
}

function getGroups(req, res, next) {
  const { userContext, query: { limit, offset } } = req;
  groupsService.getGroups(userContext, limit, offset)
    .then((result) => {
      res.send(result);
    })
    .catch(next);
}

function createGroup(req, res, next) {
  const { userContext } = req;
  const data = req.body;
  groupsService.createGroup(userContext, data)
    .then((group) => {
      res.status(HttpStatus.CREATED).send(group);
    })
    .catch(next);
}

function updateGroup(req, res, next) {
  const { userContext } = req;
  const { groupId } = req.params;
  const data = req.body;
  groupsService.updateGroup(userContext, groupId, data)
    .then((group) => {
      res.send(group);
    })
    .catch(next);
}

function deleteGroup(req, res, next) {
  const { groupId } = req.params;
  groupsService.deleteGroup(groupId)
    .then(() => {
      res.status(HttpStatus.NO_CONTENT).send({ deleted: true });
    })
    .catch(next);
}


groupsRoutes.get('/groups', getGroups);
groupsRoutes.post('/groups', createGroup);
groupsRoutes.get('/groups/:groupId', getGroup);
groupsRoutes.patch('/groups/:groupId', updateGroup);
groupsRoutes.delete('/groups/:groupId', deleteGroup);


module.exports = {
  createGroup,
  getGroup,
  getGroups,
  updateGroup,
  deleteGroup,
  groupsRoutes,
};
