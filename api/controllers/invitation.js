const HttpStatus = require('http-status-codes');
const invitationsService = require('../services/invitations');

function createInvitationRequest(req, res, next) {
  const { groupId } = req.getBody();
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
    inventionsRequestId, inventionsRequestPlayerId, approved, setAsAdmin,
  } = req.getAllParams();
  invitationsService.answerInvitationRequest(inventionsRequestId, inventionsRequestPlayerId, approved, setAsAdmin)
    .then((status) => {
      res.status(HttpStatus.OK).send({ status });
    })
    .catch(next);
}

module.exports = {
  createInvitationRequest,
  answerInvitationRequest,
};
