import express from 'express';
import { Request, Response} from '../../types/declerations';
import notificationsService from '../services/notifications';

export const notificationsRoutes = express.Router();
export function registerNotifications(req: Request, res:Response, next: Function) {
  const { userContext } = req;
  const subscription = req.body;
  notificationsService.registerNotifications(userContext, JSON.stringify(subscription)).then(() => {
    res.status(201).json({});
    // @ts-ignore
  }).catch(next);
}

export function unregisterNotifications(req: Request, res:Response, next: Function) {
  const { userContext } = req;
  notificationsService.unregisterNotifications(userContext).then(() => {
    res.status(204).json({});
    // @ts-ignore
  }).catch(next);
}
// @ts-ignore
notificationsRoutes.post('/notifications', registerNotifications);
// @ts-ignore
notificationsRoutes.delete('/notifications', unregisterNotifications);

