"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGroup = exports.updateGroup = exports.createGroup = exports.getGroups = exports.getGroup = exports.groupsRoutes = void 0;
var http_status_codes_1 = __importDefault(require("http-status-codes"));
var express_1 = __importDefault(require("express"));
var groups_1 = __importDefault(require("../services/groups"));
exports.groupsRoutes = express_1.default.Router();
function getGroup(req, res, next) {
    var userContext = req.userContext;
    var groupId = req.params.groupId;
    // @ts-ignore
    groups_1.default.getGroup(userContext, groupId)
        .then(function (group) {
        res.send(group);
    })
        // @ts-ignore
        .catch(next);
}
exports.getGroup = getGroup;
function getGroups(req, res, next) {
    var userContext = req.userContext, _a = req.query, limit = _a.limit, offset = _a.offset;
    // @ts-ignore
    groups_1.default.getGroups(userContext, limit, offset)
        .then(function (result) {
        res.send(result);
    })
        // @ts-ignore
        .catch(next);
}
exports.getGroups = getGroups;
function createGroup(req, res, next) {
    var userContext = req.userContext;
    var data = req.body;
    groups_1.default.createGroup(userContext, data)
        .then(function (group) {
        res.status(http_status_codes_1.default.CREATED).send(group);
    })
        // @ts-ignore
        .catch(next);
}
exports.createGroup = createGroup;
function updateGroup(req, res, next) {
    var userContext = req.userContext;
    var groupId = req.params.groupId;
    var data = req.body;
    // @ts-ignore
    groups_1.default.updateGroup(userContext, groupId, data)
        .then(function (group) {
        res.send(group);
    })
        // @ts-ignore
        .catch(next);
}
exports.updateGroup = updateGroup;
function deleteGroup(req, res, next) {
    var groupId = req.params.groupId;
    // @ts-ignore
    groups_1.default.deleteGroup(groupId)
        .then(function () {
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
//# sourceMappingURL=groups.js.map