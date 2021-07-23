const HttpStatus = require('http-status-codes');
const imagesRoutes = require('express').Router({ mergeParams: true });
const userContextMiddlewares = require('../middlewares/user_context');
const imageService = require('../services/images');

function addImage(req, res, next) {
  const { userContext } = req;
  const {
    image, playerIds, gameIds, groupIds, playerImage,
  } = req.body;
  imageService.addImage(userContext, image, playerIds, gameIds, groupIds, playerImage)
    .then((data) => {
      res.status(HttpStatus.CREATED).send(data);
    })
    .catch(next);
}

function deleteImage(req, res, next) {
  const { userContext } = req;
  const { imageId } = req.params;
  imageService.deleteImage(userContext, imageId)
    .then((data) => {
      res.status(HttpStatus.NO_CONTENT).send(data);
    })
    .catch(next);
}

function getGroupImages(req, res, next) {
  const { groupId } = req.params;
  imageService.getImages({ groupIds: [groupId] })
    .then((results) => {
      res.status(HttpStatus.OK).send({ results });
    })
    .catch(next);
}

imagesRoutes.post('/images', userContextMiddlewares, addImage);
imagesRoutes.delete('/images/:imageId', userContextMiddlewares, deleteImage);
imagesRoutes.get('/groups/:groupId/images', userContextMiddlewares, getGroupImages);

module.exports = {
  addImage,
  deleteImage,
  getGroupImages,
  imagesRoutes,
};
