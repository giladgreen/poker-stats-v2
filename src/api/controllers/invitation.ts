import HttpStatus from 'http-status-codes';
import express from 'express';
import invitationsService from '../services/invitations';
import { Request, Response} from '../../types/declerations';

export const invitationRoutes = express.Router();
export function createInvitationRequest(req: Request, res:Response, next: Function) {
  const { requestedGroupId } = req.body;
  const { userContext } = req;
  const userId = userContext.id;
  invitationsService.createInvitationRequest(requestedGroupId, userId)
    .then((result) => {
      res.status(HttpStatus.CREATED).send(result);
    })
      // @ts-ignore
    .catch(next);
}

export function answerInvitationRequest(req: Request, res:Response, next: Function) {
  const {
    invitationRequestId,
  } = req.params;

  const { invitationRequestPlayerId, approved, setAsAdmin } = req.query;
  // @ts-ignore
  invitationsService.answerInvitationRequest(invitationRequestId, invitationRequestPlayerId, approved, setAsAdmin)
    .then((status) => {
      res.status(HttpStatus.OK).send({ status });
    })
      // @ts-ignore
    .catch(next);
}
// @ts-ignore
invitationRoutes.post('/invitations-requests', createInvitationRequest);
// @ts-ignore
invitationRoutes.get('/invitations-requests/:invitationRequestId', answerInvitationRequest);

