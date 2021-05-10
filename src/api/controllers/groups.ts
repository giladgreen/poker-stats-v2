import HttpStatus from 'http-status-codes';
import express from 'express';
import groupsService from '../services/groups';
import {Request, Response} from "../../types/declerations";

export const groupsRoutes  = express.Router();

export function getGroup(req: Request, res:Response, next: Function) {
  const { userContext } = req;
  const { groupId } = req.params;
  // @ts-ignore
  groupsService.getGroup(userContext, groupId)
    .then((group) => {
      res.send(group);
    })
      // @ts-ignore
    .catch(next);
}

export function getGroups(req: Request, res:Response, next: Function) {
  const { userContext, query: { limit, offset } } = req;
  // @ts-ignore
  groupsService.getGroups(userContext, limit, offset)
    .then((result) => {
      res.send(result);
    })
      // @ts-ignore
    .catch(next);
}

export function createGroup(req: Request, res:Response, next: Function) {
  const { userContext } = req;
  const data = req.body;
  groupsService.createGroup(userContext, data)
    .then((group) => {
      res.status(HttpStatus.CREATED).send(group);
    })
      // @ts-ignore
    .catch(next);
}

export function updateGroup(req: Request, res:Response, next: Function) {
  const { userContext } = req;
  const { groupId } = req.params;
  const data = req.body;
  // @ts-ignore
  groupsService.updateGroup(userContext, groupId, data)
    .then((group) => {
      res.send(group);
    })
      // @ts-ignore
    .catch(next);
}

export function deleteGroup(req: Request, res:Response, next: Function) {
  const { groupId } = req.params;
  // @ts-ignore
  groupsService.deleteGroup(groupId)
    .then(() => {
      res.status(HttpStatus.NO_CONTENT).send({ deleted: true });
    })
      // @ts-ignore
    .catch(next);
}

// @ts-ignore
groupsRoutes.get('/groups', getGroups);
// @ts-ignore
groupsRoutes.post('/groups', createGroup);
// @ts-ignore
groupsRoutes.get('/groups/:groupId', getGroup);
// @ts-ignore
groupsRoutes.patch('/groups/:groupId', updateGroup);
// @ts-ignore
groupsRoutes.delete('/groups/:groupId', deleteGroup);

