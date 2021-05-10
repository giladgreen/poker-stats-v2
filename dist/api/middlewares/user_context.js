

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
const __read = (this && this.__read) || function (o, n) {
  let m = typeof Symbol === 'function' && o[Symbol.iterator];
  if (!m) return o;
  const i = m.call(o); let r; const ar = []; let
    e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) { e = { error }; } finally {
    try {
      if (r && !r.done && (m = i.return)) m.call(i);
    } finally { if (e) throw e.error; }
  }
  return ar;
};
const __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
const moment_1 = __importDefault(require('moment'));
const boom_1 = require('boom');
const sequelize_1 = require('sequelize');
const models_1 = __importDefault(require('../models'));
const emails_1 = __importDefault(require('../services/emails'));
const logger_1 = __importDefault(require('../services/logger'));
const google_auth_1 = __importDefault(require('../helpers/google-auth'));
const facebook_auth_1 = __importDefault(require('../helpers/facebook-auth'));

const EMAIL_USER = process.env.EMAIL_USER;
const LEGAL_PROVIDERS = ['facebook', 'google'];
const cache = {};
function getGroups(userContext) {
  return __awaiter(this, void 0, void 0, function () {
    let userPlayers; let
      result;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0: return [4 /* yield */, models_1.default.usersPlayers.findAll({
          where: {
            userId: userContext.id,
          },
        })];
        case 1:
          userPlayers = _a.sent();
          result = {};
          // @ts-ignore
          userPlayers.forEach((_a) => {
            const groupId = _a.groupId; const isAdmin = _a.isAdmin; const
              playerId = _a.playerId;
            // @ts-ignore
            result[groupId] = {
              isAdmin,
              playerId,
            };
          });
          return [2 /* return */, result];
      }
    });
  });
}
function validateRequestPermissions(request) {
  return __awaiter(this, void 0, void 0, function () {
    let groupId; let
      _a;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          groupId = request.params.groupId;
          // @ts-ignore
          _a = request.userContext;
          return [4 /* yield */, getGroups(request.userContext)];
        case 1:
          // @ts-ignore
          _a.groups = _b.sent();
          // @ts-ignore
          request.userContext.inGroup = groupId && request.userContext.groups[groupId];
          // @ts-ignore
          request.userContext.isAdmin = groupId && request.userContext.groups[groupId] && request.userContext.groups[groupId].isAdmin;
          // @ts-ignore
          request.userContext.playerId = groupId && request.userContext.groups[groupId] && request.userContext.groups[groupId].playerId;
          if (groupId && !request.userContext.inGroup) {
            logger_1.default.info(`[validateRequestPermissions] user not belong to group. user context: ${JSON.stringify(request.userContext)} `);
            throw 'user not belong to group';
          }
          if (request.method === 'GET') {
            return [2];
          }
          if (request.userContext.isAdmin) {
            return [2];
          }
          if (request.method === 'POST' && request.url.includes('/players')) {
            return [2];
          }
          if (request.url.includes('/notifications') && (request.method === 'POST' || request.method === 'DELETE')) {
            return [2];
          }
          if (request.method === 'POST' && request.url.includes('/groups')) {
            return [2];
          }
          if ((request.method === 'POST' || request.method === 'DELETE') && request.url.includes('/images')) {
            return [2];
          }
          if (request.method === 'GET' && request.url.includes('/groups/') && request.url.includes('/images')) {
            return [2];
          }
          if (request.url.includes('/invitations-requests')) {
            return [2];
          }
          if (request.url.includes('/games')) {
            return [2];
          }
          logger_1.default.info(`[validateRequestPermissions] bad credentials user context: ${JSON.stringify(request.userContext)} `);
          throw 'operation not allowed';
      }
    });
  });
}
function getProfile(provider, accessToken) {
  logger_1.default.info(`[UserContext:fitting] getProfile, provider:${provider}.`);
  return (provider === 'google'
    ? google_auth_1.default.authenticate(accessToken)
    : facebook_auth_1.default.authenticate(accessToken));
}
function getHtmlBody(user, provider, newUser) {
  if (newUser === void 0) { newUser = true; }
  return `\n  <div>\n        <h1>${newUser ? 'new' : ''} user has logged in.</h1>\n      <div>\n          provider: ${provider}\n      </div>\n       <div>\n          user name: ${user.firstName} ${user.familyName}\n      </div>\n      <div>\n          user email: ${user.email} \n      </div>\n      <div>\n          <div>\n          user image: ${user.imageUrl} \n            </div>\n            <div>\n          <img style="max-width:150px;" src="${user.imageUrl}"/>\n            </div>\n      </div>\n    </div>\n  `;
}
function shouldSendMail(user) {
  if (user && user.email === EMAIL_USER) {
    return false;
  }
  // @ts-ignore
  if (cache[user.id]) {
    return false;
  }
  // @ts-ignore
  cache[user.id] = true;
  setTimeout(() => {
    // @ts-ignore
    cache[user.id] = false;
  }, 1000 * 60 * 60);
  return true;
}
function userContextMiddlewares(request, response, next) {
  return __awaiter(this, void 0, void 0, function () {
    let headers; let provider; let accessToken; let existingUser; let e_1; let userContext; let profile; let user; let _a; let results; let
      error_1;
    let _b;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 15, , 16]);
          if (request.method === 'OPTIONS' || request.url.includes('approved=') || request.url.includes('well-known') || request.url.includes('keep-alive')) {
            return [2 /* return */, next()];
          }
          headers = request.headers;
          provider = headers.provider;
          accessToken = headers['x-auth-token'];
          if (!provider || !accessToken) {
            throw 'missing token headers';
          }
          // @ts-ignore
          if (!LEGAL_PROVIDERS.includes(provider)) {
            throw `unknown provider: ${provider}`;
          }
          existingUser = void 0;
          _c.label = 1;
        case 1:
          _c.trys.push([1, 3, , 4]);
          return [4 /* yield */, models_1.default.users.findOne({
            where: {
              token: accessToken,
              tokenExpiration: (_b = {},
              _b[sequelize_1.Op.gte] = new Date(),
              _b),
            },
          })];
        case 2:
          // @ts-ignore
          existingUser = _c.sent();
          return [3 /* break */, 4];
        case 3:
          e_1 = _c.sent();
          logger_1.default.info('[UserContext:fitting] ERROR ');
          logger_1.default.info(e_1.message);
          logger_1.default.info(e_1);
          throw e_1;
        case 4:
          if (!existingUser) return [3 /* break */, 7];
          userContext = existingUser.toJSON();
          request.userContext = userContext;
          // logger.info(`[UserContext:fitting] user exist, and is using token saved in db: ${userContext.firstName} ${userContext.familyName} (${userContext.email})`);
          return [4 /* yield */, validateRequestPermissions(request)];
        case 5:
          // logger.info(`[UserContext:fitting] user exist, and is using token saved in db: ${userContext.firstName} ${userContext.familyName} (${userContext.email})`);
          _c.sent();
          // @ts-ignore
          return [4 /* yield */, models_1.default.users.update({
            tokenExpiration: moment_1.default().add(1, 'days').toDate(),
          }, {
            where: {
              id: existingUser.id,
            },
          })];
        case 6:
          // @ts-ignore
          _c.sent();
          response.setHeader('x-user-context', encodeURI(JSON.stringify(userContext)));
          return [2 /* return */, next()];
        case 7: return [4 /* yield */, getProfile(provider, accessToken)];
        case 8:
          profile = _c.sent();
          // @ts-ignore
          logger_1.default.info(`[UserContext:fitting] user request by: ${profile.firstName} ${profile.familyName}. (${profile.email})`);
          return [4 /* yield */, models_1.default.users.findOne({
            where: {
              // @ts-ignore
              email: profile.email,
            },
          })];
        case 9:
          user = _c.sent();
          if (user) return [3 /* break */, 11];
          // @ts-ignore
          logger_1.default.info(`[UserContext:fitting] creating new user: ${profile.firstName} ${profile.familyName}. (${profile.email})`);
          return [4 /* yield */, models_1.default.users.create(__assign(__assign({}, profile), { tokenExpiration: moment_1.default().add(1, 'days').toDate(), token: accessToken }))];
        case 10:
          // @ts-ignore
          user = _c.sent();
          // @ts-ignore
          emails_1.default(`new user: ${user.firstName} ${user.familyName}, has logged in`, getHtmlBody(user, provider), EMAIL_USER);
          return [3 /* break */, 13];
        case 11:
          // @ts-ignore
          logger_1.default.info(`[UserContext:fitting] user already in db: ${profile.firstName} ${profile.familyName}. (${profile.email})`);
          if (shouldSendMail(user)) {
            // @ts-ignore
            emails_1.default(`${user.firstName} ${user.familyName} has logged in`, getHtmlBody(user, provider, false), EMAIL_USER);
          }
          return [4 /* yield */, models_1.default.users.update(__assign(__assign({}, profile), { tokenExpiration: moment_1.default().add(3, 'hours').toDate(), token: accessToken }), { where: { id: user.id }, returning: true })];
        case 12:
          _a = __read.apply(void 0, [_c.sent(), 2]), results = _a[1];
          user = results[0];
          _c.label = 13;
        case 13:
          request.userContext = user.toJSON();
          return [4 /* yield */, validateRequestPermissions(request)];
        case 14:
          _c.sent();
          try {
            response.setHeader('x-user-context', encodeURI(JSON.stringify(request.userContext)));
          } catch (e) {
            response.setHeader('x-user-context', encodeURI(JSON.stringify({ email: request.userContext.email, token: request.userContext.token })));
          }
          return [2 /* return */, next()];
        case 15:
          error_1 = _c.sent();
          if (typeof error_1 === 'string') {
            logger_1.default.error(`[UserContext:fitting] error: ${error_1} `);
            return [2 /* return */, next(boom_1.unauthorized(error_1))];
          }
          logger_1.default.error(`[UserContext:fitting] error: ${JSON.stringify(error_1)} `);
          return [2 /* return */, next(boom_1.unauthorized('failed to login'))];
        case 16: return [2];
      }
    });
  });
}
exports.default = userContextMiddlewares;
// # sourceMappingURL=user_context.js.map