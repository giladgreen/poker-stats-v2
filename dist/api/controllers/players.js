

const __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
exports.deletePlayer = exports.updatePlayer = exports.createPlayer = exports.getPlayers = exports.getPlayer = exports.playersRoutes = void 0;
const http_status_codes_1 = __importDefault(require('http-status-codes'));
const express_1 = __importDefault(require('express'));
const players_1 = __importDefault(require('../services/players'));

exports.playersRoutes = express_1.default.Router();
function getPlayer(req, res, next) {
  const _a = req.params; const groupId = _a.groupId; const
    playerId = _a.playerId;
  // @ts-ignore
  players_1.default.getPlayer({ groupId, playerId })
    .then((player) => {
      res.send(player);
    })
  // @ts-ignore
    .catch(next);
}
exports.getPlayer = getPlayer;
function getPlayers(req, res, next) {
  const _a = req.params; const groupId = _a.groupId; const limit = _a.limit; const
    offset = _a.offset;
  const userContext = req.userContext;
  const userId = userContext.id;
  // @ts-ignore
  players_1.default.getPlayers(groupId, userId, limit, offset)
    .then((result) => {
      res.send(result);
    })
  // @ts-ignore
    .catch(next);
}
exports.getPlayers = getPlayers;
function createPlayer(req, res, next) {
  const groupId = req.params.groupId;
  const data = req.body;
  // @ts-ignore
  players_1.default.createPlayer(groupId, data)
    .then((player) => {
      res.status(http_status_codes_1.default.CREATED).send(player);
    })
  // @ts-ignore
    .catch(next);
}
exports.createPlayer = createPlayer;
function updatePlayer(req, res, next) {
  const _a = req.params; const groupId = _a.groupId; const
    playerId = _a.playerId;
  const data = req.body;
  // @ts-ignore
  players_1.default.updatePlayer(groupId, playerId, data)
    .then((player) => {
      res.send(player);
    })
  // @ts-ignore
    .catch(next);
}
exports.updatePlayer = updatePlayer;
function deletePlayer(req, res, next) {
  const _a = req.params; const groupId = _a.groupId; const
    playerId = _a.playerId;
  const userContext = req.userContext;
  const userId = userContext.id;
  // @ts-ignore
  players_1.default.deletePlayer(groupId, userId, playerId)
    .then(() => {
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
// # sourceMappingURL=players.js.map
