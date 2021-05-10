

var __assign = (this && this.__assign) || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (const p in s) { if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]; }
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
const __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(((resolve) => { resolve(value); })); }
  return new (P || (P = Promise))(((resolve, reject) => {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  }));
};
const __generator = (this && this.__generator) || function (thisArg, body) {
  let _ = {
    label: 0, sent() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [],
  }; let f; let y; let t; let
    g;
  return g = { next: verb(0), throw: verb(1), return: verb(2) }, typeof Symbol === 'function' && (g[Symbol.iterator] = function () { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
    if (f) throw new TypeError('Generator is already executing.');
    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y.return : op[0] ? y.throw || ((t = y.return) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0: case 1: t = op; break;
          case 4: _.label++; return { value: op[1], done: false };
          case 5: _.label++; y = op[1]; op = [0]; continue;
          case 7: op = _.ops.pop(); _.trys.pop(); continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
            if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
            if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
            if (t[2]) _.ops.pop();
            _.trys.pop(); continue;
        }
        op = body.call(thisArg, _);
      } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
    }
    if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
};
const __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
const boom_1 = require('boom');
const models_1 = __importDefault(require('../models'));

const attributes = ['id', 'name', 'email', 'groupId', 'createdAt', 'imageUrl', 'videoUrl'];
const defaultValues = {
  email: '',
};
function getPlayer(_a) {
  const groupId = _a.groupId; const
    playerId = _a.playerId;
  return __awaiter(this, void 0, void 0, function () {
    let player;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0: return [4 /* yield */, models_1.default.players.findOne({
          where: {
            groupId,
            id: playerId,
          },
          attributes,
        })];
        case 1:
          player = _b.sent();
          if (!player) {
            throw boom_1.notFound('player not found', { groupId, playerId });
          }
          return [2 /* return */, player.toJSON()];
      }
    });
  });
}
function getPlayers(groupId, userId, limit, offset) {
  if (limit === void 0) { limit = 1000; }
  if (offset === void 0) { offset = 0; }
  return __awaiter(this, void 0, void 0, function () {
    let allCount; let allPlayers; let usersPlayers; let
      results;
    const _this = this;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0: return [4 /* yield */, models_1.default.players.count()];
        case 1:
          allCount = _a.sent();
          return [4 /* yield */, models_1.default.players.findAll({
            limit,
            offset,
            order: [['createdAt', 'ASC']],
            where: {
              groupId,
            },
            attributes,
          })];
        case 2:
          allPlayers = _a.sent();
          return [4 /* yield */, models_1.default.usersPlayers.findAll({
            where: {
              groupId,
            },
          })];
        case 3:
          usersPlayers = _a.sent();
          return [4 /* yield */, Promise.all(allPlayers.map(p => __awaiter(_this, void 0, void 0, function () {
            let player; let userPlayer; let
              user;
            return __generator(this, (_a) => {
              switch (_a.label) {
                case 0:
                  player = p.toJSON();
                  userPlayer = usersPlayers.find(us => us.playerId === player.id);
                  if (!userPlayer) return [3 /* break */, 2];
                  return [4 /* yield */, models_1.default.users.findOne({
                    where: {
                      id: userPlayer.userId,
                    },
                  })];
                case 1:
                  user = _a.sent();
                  if (user) {
                    player.email = user.email || player.email;
                    player.imageUrl = player.imageUrl || user.imageUrl;
                    player.videoUrl = player.videoUrl || user.videoUrl;
                    player.firstName = user.firstName;
                    player.familyName = user.familyName;
                    player.name = player.name || `${user.firstName} ${user.familyName}`;
                    player.userConnected = true;
                    player.isMe = user.id === userId;
                  }
                  _a.label = 2;
                case 2: return [2 /* return */, player];
              }
            });
          })))];
        case 4:
          results = _a.sent();
          return [2 /* return */, {
            metadata: {
              totalResults: allCount,
              count: allPlayers.length,
              limit,
              offset,
            },
            results,
          }];
      }
    });
  });
}
function getPlayerByName(groupId, name) {
  // @ts-ignore
  return models_1.default.players.findOne({
    where: {
      name,
      groupId,
    },
  });
}
function createPlayer(groupId, data) {
  return __awaiter(this, void 0, void 0, function () {
    let existingPlayer; let newPlayerData; let
      newPlayer;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0: return [4 /* yield */, getPlayerByName(groupId, data.name)];
        case 1:
          existingPlayer = _a.sent();
          _a.label = 2;
        case 2:
          if (!existingPlayer) return [3 /* break */, 4];
          data.name = `${data.name}*`;
          return [4 /* yield */, getPlayerByName(groupId, data.name)];
        case 3:
          // eslint-disable-next-line  no-await-in-loop
          existingPlayer = _a.sent();
          return [3 /* break */, 2];
        case 4:
          newPlayerData = __assign(__assign(__assign({}, defaultValues), data), { groupId });
          return [4 /* yield */, models_1.default.players.create(newPlayerData)];
        case 5:
          newPlayer = _a.sent();
          return [2 /* return */, getPlayer({ groupId, playerId: newPlayer.id })];
      }
    });
  });
}
function updatePlayer(groupId, playerId, data) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0: return [4 /* yield */, getPlayer({ groupId, playerId })];
        case 1:
          _a.sent();
          // @ts-ignore
          return [4 /* yield */, models_1.default.players.update(data, {
            where: {
              groupId,
              id: playerId,
            },
          })];
        case 2:
          // @ts-ignore
          _a.sent();
          return [2 /* return */, getPlayer({ groupId, playerId })];
      }
    });
  });
}
function deletePlayer(groupId, userId, playerId) {
  return __awaiter(this, void 0, void 0, function () {
    let userPlayer; let
      gamesCount;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0: return [4 /* yield */, models_1.default.usersPlayers.findOne({
          where: {
            groupId,
            userId,
            playerId,
          },
        })];
        case 1:
          userPlayer = _a.sent();
          if (userPlayer) {
            throw boom_1.badRequest('you can not delete yourself.', { groupId, userId, playerId });
          }
          return [4 /* yield */, models_1.default.gamesData.count({
            where: {
              groupId,
              playerId,
            },
          })];
        case 2:
          gamesCount = _a.sent();
          if (gamesCount > 0) {
            throw boom_1.badRequest('you can not delete player, remove it from existing games first.', { groupId, playerId, gamesCount });
          }
          // @ts-ignore
          return [4 /* yield */, models_1.default.usersPlayers.destroy({
            where: {
              groupId,
              playerId,
            },
          })];
        case 3:
          // @ts-ignore
          _a.sent();
          // @ts-ignore
          return [2 /* return */, models_1.default.players.destroy({
            where: {
              groupId,
              id: playerId,
            },
          })];
      }
    });
  });
}
exports.default = {
  getPlayer,
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
};
// # sourceMappingURL=players.js.map
