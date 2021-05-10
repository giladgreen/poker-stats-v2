import HttpStatus from 'http-status-codes';
import express from 'express';
import { Request, Response} from '../../types/declerations';
export const keepAliveRoutes = express.Router();

export function keepAlive(_req: Request, res:Response) {
  res.status(HttpStatus.OK).send({ status: 'still alive' });
}
// @ts-ignore
keepAliveRoutes.get('/keep-alive', keepAlive);

