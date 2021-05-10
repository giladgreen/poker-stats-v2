

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
const logger_1 = __importDefault(require('./logger'));
const emails_1 = __importDefault(require('./emails'));
const config_1 = require('./../../config');

const INVITATION_REQUESTED = 'invitation requested';
const INVITATION_APPROVED = 'invitation approved';
const INVITATION_REJECTED = 'invitation rejected';
const pokerStatsUrlPrefix = config_1.URL_PREFIX;
function validateGroup(groupId) {
  return __awaiter(this, void 0, void 0, function () {
    let group;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0: return [4 /* yield */, models_1.default.groups.findOne({
          where: {
            id: groupId,
          },
        })];
        case 1:
          group = _a.sent();
          if (!group) {
            /* istanbul ignore next */
            throw boom_1.notFound('group does not exist', { groupId });
          }
          return [2 /* return */, group];
      }
    });
  });
}
function getUserPlayer(groupId, userId) {
  // @ts-ignore
  return models_1.default.usersPlayers.findOne({
    where: {
      groupId,
      userId,
    },
  });
}
function getUser(userId) {
  // @ts-ignore
  return models_1.default.users.findOne({
    where: {
      id: userId,
    },
  });
}
function getExistingInvitationRequest(groupId, userId) {
  // @ts-ignore
  return models_1.default.invitationsRequests.findOne({
    where: {
      groupId,
      userId,
    },
  });
}
function createInvitationRequestInDB(groupId, userId) {
  return __awaiter(this, void 0, void 0, function () {
    let newInvitationRequest;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0: return [4 /* yield */, models_1.default.invitationsRequests.create({
          groupId,
          userId,
          status: INVITATION_REQUESTED,
        })];
        case 1:
          newInvitationRequest = _a.sent();
          return [2 /* return */, newInvitationRequest.id];
      }
    });
  });
}
function getAdmins(groupId) {
  return __awaiter(this, void 0, void 0, function () {
    let usersPlayersAdmins; let
      admins;
    const _this = this;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0: return [4 /* yield */, models_1.default.usersPlayers.findAll({
          where: {
            groupId,
            isAdmin: true,
          },
        })];
        case 1:
          usersPlayersAdmins = _a.sent();
          return [4 /* yield */, Promise.all(usersPlayersAdmins.map(usersPlayersAdmin => __awaiter(_this, void 0, void 0, function () {
            let userId; let
              adminUser;
            return __generator(this, (_a) => {
              switch (_a.label) {
                case 0:
                  userId = usersPlayersAdmin.userId;
                  return [4 /* yield */, getUser(userId)];
                case 1:
                  adminUser = _a.sent();
                  return [2 /* return */, {
                    email: adminUser.email,
                    name: `${adminUser.firstName} ${adminUser.familyName}`,
                  }];
              }
            });
          })))];
        case 2:
          admins = _a.sent();
          return [2 /* return */, admins];
      }
    });
  });
}
function getGroupPlayersData(groupId) {
  return __awaiter(this, void 0, void 0, function () {
    let allPlayers; let
      usersPlayers;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0: return [4 /* yield */, models_1.default.players.findAll({
          where: {
            groupId,
          },
        })];
        case 1:
          allPlayers = _a.sent();
          return [4 /* yield */, models_1.default.usersPlayers.findAll({
            where: {
              groupId,
            },
          })];
        case 2:
          usersPlayers = _a.sent();
          return [2 /* return */, allPlayers.filter(p => !usersPlayers.some(userPlayer => userPlayer.playerId === p.id)).map(player => ({
            id: player.id,
            name: player.name,
            email: player.email,
          }))];
      }
    });
  });
}
function getRejectLinkAddress(invitationRequestId) {
  return `${pokerStatsUrlPrefix}/invitations-requests/${invitationRequestId}?approved=false`;
}
function getNewPlayerAddress(invitationRequestId) {
  return `${pokerStatsUrlPrefix}/invitations-requests/${invitationRequestId}?approved=true`;
}
function getLinkAddress(invitationRequestId, playerId, approved, setAsAdmin) {
  return `${pokerStatsUrlPrefix}/invitations-requests/${invitationRequestId}?invitationRequestPlayerId=${playerId}&approved=${approved}&setAsAdmin=${setAsAdmin}`;
}
function createHtml(invitationRequestId, groupName, userDetails, userName, adminName, players) {
  const rejectAddress = getRejectLinkAddress(invitationRequestId);
  const newPlayerAddress = getNewPlayerAddress(invitationRequestId);
  const playersLinks = players.sort((a, b) => (a.name < b.name ? -1 : 1)).map((player) => {
    const nonAdminApproveAddress = getLinkAddress(invitationRequestId, player.id, true, false);
    const adminApproveAddress = getLinkAddress(invitationRequestId, player.id, true, true);
    /* istanbul ignore next */
    const playerEmail = (player.email && player.email.length > 3 && player.email.indexOf('@') > 1) ? player.email : '';
    const playerName = `${player.name} ${playerEmail} `;
    return `<div>* <a href="${nonAdminApproveAddress}"> ${playerName} </a>  <span> - - </span>   (<a href="${adminApproveAddress}">  set as admin </a>)  <br/><br/></div> `;
  });
  const html = `<!doctype html>\n                <html lang="en">\n                  <head>\n                    <meta charset="utf-8">\n                  </head>\n                  <body>\n                    <div>\n                        Hey ${adminName},<br/>\n                        User ${userName} (${userDetails.email}) ,<br/><br/>\n                        <img src="${userDetails.imageUrl}"/><br/><br/>\n                        has requested to join your group: ${groupName}.<br/><br/>\n                    </div>\n                     <div>\n                        press <a href="${rejectAddress}"> HERE </a> to reject the request.<br/><br/>\n                        or choose which existing player this is: <br/><br/>\n                    </div>\n                     <div>\n                      ${playersLinks.join('')}\n                      \n                    </div>\n                    \n                     <div>\n                       OR,  <a href="${newPlayerAddress}"> create a new player for him </a>.\n                      \n                      \n                    </div>\n                    \n                  </body>\n                </html>`;
  return html;
}
function sendEmail(invitationRequestId, groupName, userDetails, admins, players) {
  return __awaiter(this, void 0, void 0, function () {
    let userName; let
      subject;
    return __generator(this, (_a) => {
      userName = `${userDetails.firstName} ${userDetails.familyName}`;
      subject = `user [${userName}] has requested to join group [${groupName}]`;
      admins.forEach((admin) => {
        const html = createHtml(invitationRequestId, groupName, userDetails, userName, admin.name, players);
        emails_1.default(subject, html, admin.email);
      });
      return [2];
    });
  });
}
function createInvitationRequest(groupId, userId) {
  return __awaiter(this, void 0, void 0, function () {
    let groupName; let userPlayer; let invitationRequest; let invitationRequestId; let userDetails; let admins; let
      players;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          logger_1.default.info(`[Invitation-service] createInvitationRequest. groupId:${groupId}, userId: ${userId}`);
          return [4 /* yield */, validateGroup(groupId)];
        case 1:
          groupName = (_a.sent()).name;
          return [4 /* yield */, getUserPlayer(groupId, userId)];
        case 2:
          userPlayer = _a.sent();
          /* istanbul ignore next */
          if (userPlayer) {
            logger_1.default.info(`[Invitation-service] createInvitationRequest. userId: ${userId} is already in group :${groupId}`);
            return [2 /* return */, { status: 'user is already in group', invitationRequestId: null }];
          }
          return [4 /* yield */, getExistingInvitationRequest(groupId, userId)];
        case 3:
          invitationRequest = _a.sent();
          /* istanbul ignore next */
          if (invitationRequest) {
            logger_1.default.info('[Invitation-service] createInvitationRequest. invitation already requested');
            return [2 /* return */, { status: invitationRequest.status, invitationRequestId: null }];
          }
          return [4 /* yield */, createInvitationRequestInDB(groupId, userId)];
        case 4:
          invitationRequestId = _a.sent();
          logger_1.default.info(`[Invitation-service] createInvitationRequest. created new invitation request in db: ${invitationRequestId}`);
          return [4 /* yield */, getUser(userId)];
        case 5:
          userDetails = _a.sent();
          return [4 /* yield */, getAdmins(groupId)];
        case 6:
          admins = _a.sent();
          /* istanbul ignore next */
          if (admins.length === 0) {
            logger_1.default.error(`[Invitation-service] createInvitationRequest. group has no admins!! (${groupId})`);
            return [2 /* return */, { status: 'oops.. this group has no admin to approve you..', invitationRequestId: null }];
          }
          return [4 /* yield */, getGroupPlayersData(groupId)];
        case 7:
          players = _a.sent();
          /* istanbul ignore next */
          if (players.length === 0) {
            logger_1.default.warn(`[Invitation-service] createInvitationRequest. group has no un-assigned players.. (${groupId})`);
          }
          return [4 /* yield */, sendEmail(invitationRequestId, groupName, userDetails, admins, players)];
        case 8:
          _a.sent();
          return [2 /* return */, { status: INVITATION_REQUESTED, invitationRequestId }];
      }
    });
  });
}
function getExistingInvitationRequestById(invitationRequestId) {
  // @ts-ignore
  return models_1.default.invitationsRequests.findOne({
    where: {
      id: invitationRequestId,
    },
  });
}
function updateInvitationRequest(invitationRequestId, status) {
  // @ts-ignore
  return models_1.default.invitationsRequests.update({ status }, {
    where: {
      id: invitationRequestId,
    },
  });
}
/* istanbul ignore next */
function handleUserAlreadyInGroup(existingUserPlayer, setAsAdmin, invitationRequestPlayerId) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          if (!(existingUserPlayer.isAdmin !== setAsAdmin || existingUserPlayer.playerId !== invitationRequestPlayerId)) return [3 /* break */, 2];
          logger_1.default.info('[Invitation-service] answerInvitationRequest. updating user in group (either isAdmin or different player)');
          // @ts-ignore
          return [4 /* yield */, models_1.default.usersPlayers.update({ isAdmin: setAsAdmin, playerId: invitationRequestPlayerId }, {
            where: {
              id: existingUserPlayer.id,
            },
          })];
        case 1:
          // @ts-ignore
          _a.sent();
          return [3 /* break */, 3];
        case 2:
          logger_1.default.info('[Invitation-service] answerInvitationRequest. no need to change anything.');
          _a.label = 3;
        case 3: return [2];
      }
    });
  });
}
function createUserPlayer(setAsAdmin, invitationRequestPlayerId, groupId, userId) {
  return __awaiter(this, void 0, void 0, function () {
    let _a; let imageUrl; let email; let firstName; let familyName; let
      newPlayer;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0: return [4 /* yield */, models_1.default.users.findOne({ where: { id: userId } })];
        case 1:
          _a = _b.sent(), imageUrl = _a.imageUrl, email = _a.email, firstName = _a.firstName, familyName = _a.familyName;
          if (invitationRequestPlayerId) return [3 /* break */, 3];
          return [4 /* yield */, models_1.default.players.create({
            name: `${firstName} ${familyName}`,
            email,
            imageUrl,
            groupId,
          })];
        case 2:
          newPlayer = _b.sent();
          invitationRequestPlayerId = newPlayer.id;
          _b.label = 3;
        case 3:
          // @ts-ignore
          return [4 /* yield */, models_1.default.usersPlayers.create({
            isAdmin: setAsAdmin,
            playerId: invitationRequestPlayerId,
            groupId,
            userId,
          })];
        case 4:
          // @ts-ignore
          _b.sent();
          // @ts-ignore
          return [2 /* return */, models_1.default.players.update({ imageUrl, email }, {
            where: {
              id: invitationRequestPlayerId,
            },
          })];
      }
    });
  });
}
function sendUserUpdateEmail(userId, groupName, approved) {
  return __awaiter(this, void 0, void 0, function () {
    let userDetails; let subject; let
      html;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0: return [4 /* yield */, getUser(userId)];
        case 1:
          userDetails = _a.sent();
          subject = `your request to join group "${groupName}"`;
          html = `<!doctype html>\n                <html lang="en">\n                  <head>\n                    <meta charset="utf-8">\n                  </head>\n                  <body>\n                    <div>\n                        Hey ${userDetails.firstName},<br/><br/><br/><br/>\n                        \n                        Your request to join group "${groupName}" has been ${approved ? 'approved' : 'rejected'}.<br/><br/><br/><br/><br/><br/>\n                        \n                        ${approved ? 'if you log in now you should see this group data..' : ''}\n                  \n                    </div>\n                    \n                  </body>\n                </html>`;
          emails_1.default(subject, html, userDetails.email);
          return [2];
      }
    });
  });
}
function answerInvitationRequest(invitationRequestId, invitationRequestPlayerId, approved, setAsAdmin) {
  return __awaiter(this, void 0, void 0, function () {
    let invitationRequest; let groupId; let userId; let groupName; let
      existingUserPlayer;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          logger_1.default.info(`[Invitation-service] answerInvitationRequest. ${JSON.stringify({
            invitationRequestId, invitationRequestPlayerId, approved, setAsAdmin,
          })}`);
          return [4 /* yield */, getExistingInvitationRequestById(invitationRequestId)];
        case 1:
          invitationRequest = _a.sent();
          /* istanbul ignore next */
          if (!invitationRequest) {
            logger_1.default.error(`[Invitation-service] answerInvitationRequest. did not found invitationRequest in DB. ${invitationRequestId}`);
            return [2 /* return */, `did not found invitationRequest in DB (${invitationRequestId})`];
          }
          /* istanbul ignore next */
          if (invitationRequest.status !== INVITATION_REQUESTED) {
            logger_1.default.info(`[Invitation-service] answerInvitationRequest. invitation already ${invitationRequest.status.replace('invitation ', '')}`);
            return [2 /* return */, `invitation already ${invitationRequest.status.replace('invitation ', '')}`];
          }
          groupId = invitationRequest.groupId, userId = invitationRequest.userId;
          return [4 /* yield */, validateGroup(groupId)];
        case 2:
          groupName = (_a.sent()).name;
          if (approved) return [3 /* break */, 5];
          logger_1.default.info('[Invitation-service] answerInvitationRequest. invitation was rejected.');
          return [4 /* yield */, updateInvitationRequest(invitationRequestId, INVITATION_REJECTED)];
        case 3:
          _a.sent();
          return [4 /* yield */, sendUserUpdateEmail(userId, groupName, false)];
        case 4:
          _a.sent();
          return [2 /* return */, INVITATION_REJECTED];
        case 5: return [4 /* yield */, getUserPlayer(groupId, userId)];
        case 6:
          existingUserPlayer = _a.sent();
          if (!existingUserPlayer) return [3 /* break */, 8];
          logger_1.default.info('[Invitation-service] answerInvitationRequest. user already in group...');
          return [4 /* yield */, handleUserAlreadyInGroup(existingUserPlayer, setAsAdmin, invitationRequestPlayerId)];
        case 7:
          _a.sent();
          return [3 /* break */, 10];
        case 8:
          logger_1.default.info('[Invitation-service] answerInvitationRequest. user not in group. - adding it');
          return [4 /* yield */, createUserPlayer(setAsAdmin, invitationRequestPlayerId, groupId, userId)];
        case 9:
          _a.sent();
          _a.label = 10;
        case 10: return [4 /* yield */, updateInvitationRequest(invitationRequestId, INVITATION_APPROVED)];
        case 11:
          _a.sent();
          return [4 /* yield */, sendUserUpdateEmail(userId, groupName, true)];
        case 12:
          _a.sent();
          return [2 /* return */, INVITATION_APPROVED];
      }
    });
  });
}
exports.default = {
  createInvitationRequest,
  answerInvitationRequest,
  INVITATION_REQUESTED,
};
// # sourceMappingURL=invitations.js.map
