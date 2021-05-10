

const __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
exports.deleteGroup = exports.updateGroup = exports.createGroup = exports.getGroups = exports.getGroup = exports.groupsRoutes = void 0;
const http_status_codes_1 = __importDefault(require('http-status-codes'));
const express_1 = __importDefault(require('express'));
const groups_1 = __importDefault(require('../services/groups'));

exports.groupsRoutes = express_1.default.Router();
function getGroup(req, res, next) {
  const userContext = req.userContext;
  const groupId = req.params.groupId;
  // @ts-ignore
  groups_1.default.getGroup(userContext, groupId)
    .then((group) => {
      res.send(group);
    })
  // @ts-ignore
    .catch(next);
}
exports.getGroup = getGroup;
function getGroups(req, res, next) {
  const userContext = req.userContext; const _a = req.query; const limit = _a.limit; const
    offset = _a.offset;
  // @ts-ignore
  groups_1.default.getGroups(userContext, limit, offset)
    .then((result) => {
      res.send(result);
    })
  // @ts-ignore
    .catch(next);
}
exports.getGroups = getGroups;
function createGroup(req, res, next) {
  const userContext = req.userContext;
  const data = req.body;
  groups_1.default.createGroup(userContext, data)
    .then((group) => {
      res.status(http_status_codes_1.default.CREATED).send(group);
    })
  // @ts-ignore
    .catch(next);
}
exports.createGroup = createGroup;
function updateGroup(req, res, next) {
  const userContext = req.userContext;
  const groupId = req.params.groupId;
  const data = req.body;
  // @ts-ignore
  groups_1.default.updateGroup(userContext, groupId, data)
    .then((group) => {
      res.send(group);
    })
  // @ts-ignore
    .catch(next);
}
exports.updateGroup = updateGroup;
function deleteGroup(req, res, next) {
  const groupId = req.params.groupId;
  // @ts-ignore
  groups_1.default.deleteGroup(groupId)
    .then(() => {
      res.status(http_status_codes_1.default.NO_CONTENT).send({ deleted: true });
    })
  // @ts-ignore
    .catch(next);
}
exports.deleteGroup = deleteGroup;
// @ts-ignore
exports.groupsRoutes.get('/groups', getGroups);
// @ts-ignore
exports.groupsRoutes.post('/groups', createGroup);
// @ts-ignore
exports.groupsRoutes.get('/groups/:groupId', getGroup);
// @ts-ignore
exports.groupsRoutes.patch('/groups/:groupId', updateGroup);
// @ts-ignore
exports.groupsRoutes.delete('/groups/:groupId', deleteGroup);
// # sourceMappingURL=groups.js.map
