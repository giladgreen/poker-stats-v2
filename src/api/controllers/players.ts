import HttpStatus from 'http-status-codes';
import express from 'express';
import playersService from '../services/players';
import { Request, Response} from '../../types/declerations';

export const playersRoutes = express.Router();

export function getPlayer(req: Request, res:Response, next: Function) {
  const { groupId, playerId } = req.params;
  // @ts-ignore
  playersService.getPlayer({ groupId, playerId })
    .then((player) => {
      res.send(player);
    })
      // @ts-ignore
    .catch(next);
}
export function getPlayers(req: Request, res:Response, next: Function) {
  const { groupId, limit, offset } = req.params;
  const { userContext } = req;
  const userId = userContext.id;
  // @ts-ignore
  playersService.getPlayers(groupId, userId, limit, offset)
    .then((result) => {
      res.send(result);
    })
      // @ts-ignore
    .catch(next);
}

export function createPlayer(req: Request, res:Response, next: Function) {
  const { groupId } = req.params;
  const data = req.body;
  // @ts-ignore
  playersService.createPlayer(groupId, data)
    .then((player) => {
      res.status(HttpStatus.CREATED).send(player);
    })
      // @ts-ignore
    .catch(next);
}

export function updatePlayer(req: Request, res:Response, next: Function) {
  const { groupId, playerId } = req.params;
  const data = req.body;
  // @ts-ignore
  playersService.updatePlayer(groupId, playerId, data)
    .then((player) => {
      res.send(player);
    })
      // @ts-ignore
    .catch(next);
}
export function deletePlayer(req: Request, res:Response, next: Function) {
  const { groupId, playerId } = req.params;
  const { userContext } = req;
  const userId = userContext.id;
  // @ts-ignore
  playersService.deletePlayer(groupId, userId, playerId)
    .then(() => {
      res.status(HttpStatus.NO_CONTENT).send({ deleted: true });
    })
      // @ts-ignore
    .catch(next);
}
// @ts-ignore
playersRoutes.post('/groups/:groupId/players', createPlayer);
// @ts-ignore
playersRoutes.get('/groups/:groupId/players', getPlayers);
// @ts-ignore
playersRoutes.get('/groups/:groupId/players/:playerId', getPlayer);
// @ts-ignore
playersRoutes.patch('/groups/:groupId/players/:playerId', updatePlayer);
// @ts-ignore
playersRoutes.delete('/groups/:groupId/players/:playerId', deletePlayer);
