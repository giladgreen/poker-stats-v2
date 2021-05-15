"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlayer = exports.updatePlayer = exports.createPlayer = exports.getPlayers = exports.getPlayer = exports.playersRoutes = void 0;
var http_status_codes_1 = __importDefault(require("http-status-codes"));
var express_1 = __importDefault(require("express"));
var players_1 = __importDefault(require("../services/players"));
exports.playersRoutes = express_1.default.Router();
function getPlayer(req, res, next) {
    var _a = req.params, groupId = _a.groupId, playerId = _a.playerId;
    // @ts-ignore
    players_1.default.getPlayer({ groupId: groupId, playerId: playerId })
        .then(function (player) {
        res.send(player);
    })
        // @ts-ignore
        .catch(next);
}
exports.getPlayer = getPlayer;
function getPlayers(req, res, next) {
    var _a = req.params, groupId = _a.groupId, limit = _a.limit, offset = _a.offset;
    var userContext = req.userContext;
    var userId = userContext.id;
    // @ts-ignore
    players_1.default.getPlayers(groupId, userId, limit, offset)
        .then(function (result) {
        res.send(result);
    })
        // @ts-ignore
        .catch(next);
}
exports.getPlayers = getPlayers;
function createPlayer(req, res, next) {
    var groupId = req.params.groupId;
    var data = req.body;
    // @ts-ignore
    players_1.default.createPlayer(groupId, data)
        .then(function (player) {
        res.status(http_status_codes_1.default.CREATED).send(player);
    })
        // @ts-ignore
        .catch(next);
}
exports.createPlayer = createPlayer;
function updatePlayer(req, res, next) {
    var _a = req.params, groupId = _a.groupId, playerId = _a.playerId;
    var data = req.body;
    // @ts-ignore
    players_1.default.updatePlayer(groupId, playerId, data)
        .then(function (player) {
        res.send(player);
    })
        // @ts-ignore
        .catch(next);
}
exports.updatePlayer = updatePlayer;
function deletePlayer(req, res, next) {
    var _a = req.params, groupId = _a.groupId, playerId = _a.playerId;
    var userContext = req.userContext;
    var userId = userContext.id;
    // @ts-ignore
    players_1.default.deletePlayer(groupId, userId, playerId)
        .then(function () {
        res.status(http_status_codes_1.default.NO_CONTENT).send({ deleted: true });
    })
        // @ts-ignore
        .catch(next);
}
exports.deletePlayer = deletePlayer;
// @ts-ignore
exports.playersRoutes.post('/groups/:groupId/players', createPlayer);
// @ts-ignore
exports.playersRoutes.get('/groups/:groupId/players', getPlayers);
// @ts-ignore
exports.playersRoutes.get('/groups/:groupId/players/:playerId', getPlayer);
// @ts-ignore
exports.playersRoutes.patch('/groups/:groupId/players/:playerId', updatePlayer);
// @ts-ignore
exports.playersRoutes.delete('/groups/:groupId/players/:playerId', deletePlayer);
//# sourceMappingURL=players.js.map