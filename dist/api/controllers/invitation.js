

const __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
exports.answerInvitationRequest = exports.createInvitationRequest = exports.invitationRoutes = void 0;
const http_status_codes_1 = __importDefault(require('http-status-codes'));
const express_1 = __importDefault(require('express'));
const invitations_1 = __importDefault(require('../services/invitations'));

exports.invitationRoutes = express_1.default.Router();
function createInvitationRequest(req, res, next) {
  const requestedGroupId = req.body.requestedGroupId;
  const userContext = req.userContext;
  const userId = userContext.id;
  invitations_1.default.createInvitationRequest(requestedGroupId, userId)
    .then((result) => {
      res.status(http_status_codes_1.default.CREATED).send(result);
    })
  // @ts-ignore
    .catch(next);
}
exports.createInvitationRequest = createInvitationRequest;
function answerInvitationRequest(req, res, next) {
  const invitationRequestId = req.params.invitationRequestId;
  const _a = req.query; const invitationRequestPlayerId = _a.invitationRequestPlayerId; const approved = _a.approved; const
    setAsAdmin = _a.setAsAdmin;
  // @ts-ignore
  invitations_1.default.answerInvitationRequest(invitationRequestId, invitationRequestPlayerId, approved, setAsAdmin)
    .then((status) => {
      res.status(http_status_codes_1.default.OK).send({ status });
    })
  // @ts-ignore
    .catch(next);
}
exports.answerInvitationRequest = answerInvitationRequest;
// @ts-ignore
exports.invitationRoutes.post('/invitations-requests', createInvitationRequest);
// @ts-ignore
exports.invitationRoutes.get('/invitations-requests/:invitationRequestId', answerInvitationRequest);
// # sourceMappingURL=invitation.js.map
