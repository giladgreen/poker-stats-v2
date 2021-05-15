"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.answerInvitationRequest = exports.createInvitationRequest = exports.invitationRoutes = void 0;
var http_status_codes_1 = __importDefault(require("http-status-codes"));
var express_1 = __importDefault(require("express"));
var invitations_1 = __importDefault(require("../services/invitations"));
exports.invitationRoutes = express_1.default.Router();
function createInvitationRequest(req, res, next) {
    var requestedGroupId = req.body.requestedGroupId;
    var userContext = req.userContext;
    var userId = userContext.id;
    invitations_1.default.createInvitationRequest(requestedGroupId, userId)
        .then(function (result) {
        res.status(http_status_codes_1.default.CREATED).send(result);
    })
        // @ts-ignore
        .catch(next);
}
exports.createInvitationRequest = createInvitationRequest;
function answerInvitationRequest(req, res, next) {
    var invitationRequestId = req.params.invitationRequestId;
    var _a = req.query, invitationRequestPlayerId = _a.invitationRequestPlayerId, approved = _a.approved, setAsAdmin = _a.setAsAdmin;
    // @ts-ignore
    invitations_1.default.answerInvitationRequest(invitationRequestId, invitationRequestPlayerId, approved, setAsAdmin)
        .then(function (status) {
        res.status(http_status_codes_1.default.OK).send({ status: status });
    })
        // @ts-ignore
        .catch(next);
}
exports.answerInvitationRequest = answerInvitationRequest;
// @ts-ignore
exports.invitationRoutes.post('/invitations-requests', createInvitationRequest);
// @ts-ignore
exports.invitationRoutes.get('/invitations-requests/:invitationRequestId', answerInvitationRequest);
//# sourceMappingURL=invitation.js.map