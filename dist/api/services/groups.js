

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

const attributes = ['id', 'name', 'createdAt', 'description', 'imageUrl'];
function getGroup(userContext, groupId) {
  return __awaiter(this, void 0, void 0, function () {
    let group; let
      result;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0: return [4 /* yield */, models_1.default.groups.findOne({
          where: {
            id: groupId,
          },
          attributes,
        })];
        case 1:
          group = _a.sent();
          if (!group) {
            throw boom_1.notFound('group not found', { groupId });
          }
          result = group.toJSON();
          result.isAdmin = userContext.isAdmin;
          return [2 /* return */, result];
      }
    });
  });
}
function getGroups(userContext, limit, offset) {
  if (limit === void 0) { limit = 1000; }
  if (offset === void 0) { offset = 0; }
  return __awaiter(this, void 0, void 0, function () {
    let invitations; let allCount; let allGroups; let
      results;
    const _this = this;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0: return [4 /* yield */, models_1.default.invitationsRequests.findAll({
          where: {
            userId: userContext.id,
          },
        })];
        case 1:
          invitations = _a.sent();
          return [4 /* yield */, models_1.default.groups.count()];
        case 2:
          allCount = _a.sent();
          return [4 /* yield */, models_1.default.groups.findAll({
            limit,
            offset,
            order: [['createdAt', 'ASC']],
            attributes,
          })];
        case 3:
          allGroups = _a.sent();
          results = allGroups.map((g) => {
            const group = g.toJSON();
            const userGroupData = userContext.groups[group.id];
            const result = __assign(__assign({}, group), { userInGroup: !!userGroupData });
            if (result.userInGroup) {
              result.isAdmin = userGroupData.isAdmin;
            } else {
              result.invitationRequested = false;
              const invitation = invitations.find(i => i.groupId === group.id);
              if (invitation) {
                result.invitationRequested = true;
                result.invitationStatus = invitation.status;
              }
            }
            return result;
          });
          return [4 /* yield */, Promise.all(results.map(group => __awaiter(_this, void 0, void 0, function () {
            let _a; let
              _b;
            return __generator(this, (_c) => {
              switch (_c.label) {
                case 0:
                  // @ts-ignore
                  _a = group;
                  return [4 /* yield */, models_1.default.games.count({ where: { groupId: group.id } })];
                case 1:
                  // @ts-ignore
                  _a.gamesCount = _c.sent();
                  // @ts-ignore
                  _b = group;
                  return [4 /* yield */, models_1.default.players.count({ where: { groupId: group.id } })];
                case 2:
                  // @ts-ignore
                  _b.playersCount = _c.sent();
                  return [2];
              }
            });
          })))];
        case 4:
          _a.sent();
          return [2 /* return */, {
            metadata: {
              totalResults: allCount,
              count: allGroups.length,
              limit,
              offset,
            },
            results,
          }];
      }
    });
  });
}
function createGroup(userContext, data) {
  return __awaiter(this, void 0, void 0, function () {
    let existingGroup; let newGroup; let playerData; let newPlayer; let
      userPlayerData;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0: return [4 /* yield */, models_1.default.groups.findOne({
          where: {
            name: data.name,
          },
        })];
        case 1:
          existingGroup = _a.sent();
          if (existingGroup) {
            throw boom_1.badRequest(`Name ${data.name} already in use.`, { name: data.name });
          }
          return [4 /* yield */, models_1.default.groups.create(data)];
        case 2:
          newGroup = _a.sent();
          playerData = {
            name: `${userContext.firstName} ${userContext.familyName}`,
            email: userContext.email,
            groupId: newGroup.id,
          };
          return [4 /* yield */, models_1.default.players.create(playerData)];
        case 3:
          newPlayer = _a.sent();
          userPlayerData = {
            userId: userContext.id,
            playerId: newPlayer.id,
            groupId: playerData.groupId,
            isAdmin: true,
          };
          // @ts-ignore
          return [4 /* yield */, models_1.default.usersPlayers.create(userPlayerData)];
        case 4:
          // @ts-ignore
          _a.sent();
          userContext.isAdmin = true;
          userContext.groups[playerData.groupId] = { isAdmin: true };
          return [2 /* return */, getGroup(userContext, newGroup.id)];
      }
    });
  });
}
function updateGroup(userContext, groupId, data) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          // @ts-ignore
          return [4 /* yield */, models_1.default.groups.update(data, {
            where: {
              id: groupId,
            },
          })];
        case 1:
          // @ts-ignore
          _a.sent();
          return [2 /* return */, getGroup(userContext, groupId)];
      }
    });
  });
}
function deleteGroup(groupId) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          // @ts-ignore
          return [4 /* yield */, models_1.default.players.destroy({
            where: {
              groupId,
            },
          })];
        case 1:
          // @ts-ignore
          _a.sent();
          // @ts-ignore
          return [4 /* yield */, models_1.default.gamesData.destroy({
            where: {
              groupId,
            },
          })];
        case 2:
          // @ts-ignore
          _a.sent();
          // @ts-ignore
          return [4 /* yield */, models_1.default.games.destroy({
            where: {
              groupId,
            },
          })];
        case 3:
          // @ts-ignore
          _a.sent();
          // @ts-ignore
          return [4 /* yield */, models_1.default.usersPlayers.destroy({
            where: {
              groupId,
            },
          })];
        case 4:
          // @ts-ignore
          _a.sent();
          // @ts-ignore
          return [2 /* return */, models_1.default.groups.destroy({
            where: {
              id: groupId,
            },
          })];
      }
    });
  });
}
exports.default = {
  createGroup,
  getGroup,
  getGroups,
  updateGroup,
  deleteGroup,
};
// # sourceMappingURL=groups.js.map
