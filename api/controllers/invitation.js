const HttpStatus = require('http-status-codes');
const invitationRoutes = require('express').Router({ mergeParams: true });

const invitationsService = require('../services/invitations');

function createInvitationRequest(req, res, next) {
  const { requestedGroupId } = req.body;
  const { userContext } = req;
  const userId = userContext.id;
  invitationsService.createInvitationRequest(requestedGroupId, userId)
    .then((result) => {
      res.status(HttpStatus.CREATED).send(result);
    })
    .catch(next);
}

function answerInvitationRequest(req, res, next) {
  const {
    invitationRequestId,
  } = req.params;

  const { invitationRequestPlayerId, approved, setAsAdmin } = req.query;

  invitationsService.answerInvitationRequest(invitationRequestId, invitationRequestPlayerId, approved, setAsAdmin)
    .then((status) => {
      res.status(HttpStatus.OK).send({ status });
    })
    .catch(next);
}

invitationRoutes.post('/invitations-requests', createInvitationRequest);
invitationRoutes.get('/invitations-requests/:invitationRequestId', answerInvitationRequest);


module.exports = {
  createInvitationRequest,
  answerInvitationRequest,
  invitationRoutes,
};
