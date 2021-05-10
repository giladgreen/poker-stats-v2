import HttpStatus from 'http-status-codes';
import express from 'express';
import gamesService from '../services/games';
import Models from '../models';
import logger from '../services/logger';
import { Request, Response } from '../../types/declerations';

export const gamesRoutes = express.Router();
export function getGame(req: Request, res:Response, next: Function) {
  const { gameId, groupId } = req.params;
  gamesService.getGame({ groupId, gameId })
    .then((game) => {
      res.send(game);
    })
   // @ts-ignore
    .catch(next);
}

export async function filterResults(res:Response, userId:string, hideGames:boolean) {
  if (!hideGames) {
    return res;
  }
  // @ts-ignore
  const userPlayer = await Models.usersPlayers.findOne({
    where: {
      userId,
    },
  });

  if (!userPlayer) {
    return res;
  }
  logger.info('filterResults userPlayer exist', { userId, hideGames, userPlayer: userPlayer.toJSON() });
  // @ts-ignore
  const filteredResults = res.results.filter(game => game.playersData.some(playData => playData.playerId === userPlayer.playerId));
  return {
    // @ts-ignore
    metadata: res.metadata,
    results: filteredResults,
  };
}

export function getGames(req: Request, res:Response, next: Function) {
  const { groupId } = req.params;
  const { userContext: { id: userId, hideGames }, query: { limit, offset } } = req;
  // @ts-ignore
  gamesService.getGames(groupId, limit, offset)
    .then((result) => {
      // @ts-ignore
      filterResults(result, userId, hideGames).then(filteredResult => res.send(filteredResult)).catch(next);
    })
      // @ts-ignore
    .catch(next);
}

export function createGame(req: Request, res:Response, next: Function) {
  const { groupId } = req.params;
  const data = req.body;
  gamesService.createGame(groupId, data)
    .then((game) => {
      res.status(HttpStatus.CREATED).send(game);
    })
      // @ts-ignore
    .catch(next);
}

export function updateGame(req: Request, res:Response, next: Function) {
  const { groupId, gameId } = req.params;
  const data = req.body;

  const { userContext } = req;

  gamesService.updateGame(userContext, groupId, gameId, data)
    .then((game) => {
      res.send(game);
    })
      // @ts-ignore
    .catch(next);
}

export function deleteGame(req: Request, res:Response, next: Function) {
  const { groupId, gameId } = req.params;
  const { userContext } = req;

  gamesService.deleteGame(userContext, groupId, gameId)
    .then(() => {
      res.status(HttpStatus.NO_CONTENT).send({ deleted: true });
    })
      // @ts-ignore
    .catch(next);
}

// @ts-ignore
gamesRoutes.get('/groups/:groupId/games', getGames);
// @ts-ignore
gamesRoutes.post('/groups/:groupId/games', createGame);
// @ts-ignore
gamesRoutes.get('/groups/:groupId/games/:gameId', getGame);
// @ts-ignore
gamesRoutes.patch('/groups/:groupId/games/:gameId', updateGame);
// @ts-ignore
gamesRoutes.delete('/groups/:groupId/games/:gameId', deleteGame);



