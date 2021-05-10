import HttpStatus from 'http-status-codes';
import express from 'express';
import imageService from '../services/images';
import { Request, Response} from '../../types/declerations';

export const imagesRoutes = express.Router();

export function addImage(req: Request, res:Response, next: Function) {
  const { userContext } = req;
  const {
    image, playerIds, gameIds, groupIds, playerImage,
  } = req.body;
  imageService.addImage(userContext, image, playerIds, gameIds, groupIds, playerImage)
    .then((data) => {
      res.status(HttpStatus.CREATED).send(data);
    })
      // @ts-ignore
    .catch(next);
}

export function deleteImage(req: Request, res:Response, next: Function) {
  const { userContext } = req;
  const { imageId } = req.params;
  // @ts-ignore
  imageService.deleteImage(userContext, imageId)
    .then((data) => {
      res.status(HttpStatus.NO_CONTENT).send(data);
    })
      // @ts-ignore
    .catch(next);
}

export function getGroupImages(req: Request, res:Response, next: Function) {
  const { groupId } = req.params;
  // @ts-ignore
  imageService.getImages({ groupIds: [groupId] })
    .then((results) => {
      res.status(HttpStatus.OK).send({ results });
    })
      // @ts-ignore
    .catch(next);
}
// @ts-ignore
imagesRoutes.post('/images', addImage);
// @ts-ignore
imagesRoutes.delete('/images/:imageId', deleteImage);
// @ts-ignore
imagesRoutes.get('/groups/:groupId/images', getGroupImages);
