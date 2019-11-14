const HttpStatus = require('http-status-codes');
const invitationsService = require('../services/invitations');

function createInvitationRequest(req, res, next) {
  const body = req.getBody();
  const { groupId } = body;
  const { userContext } = req;
  const userId = userContext.id;
  invitationsService.createInvitationRequest(groupId, userId)
    .then((result) => {
      res.status(HttpStatus.CREATED).send(result);
    })
    .catch(next);
}

function answerInvitationRequest(req, res, next) {
  const {
    invitationRequestId, invitationRequestPlayerId, approved, setAsAdmin,
  } = req.getAllParams();

  invitationsService.answerInvitationRequest(invitationRequestId, invitationRequestPlayerId, approved, setAsAdmin)
    .then((status) => {
      res.status(HttpStatus.OK).send({ status });
    })
    .catch(next);
}

module.exports = {
  createInvitationRequest,
  answerInvitationRequest,
};
