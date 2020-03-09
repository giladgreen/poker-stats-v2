const HttpStatus = require('http-status-codes');
const imageService = require('../services/images');

function addImage(req, res, next) {
  const { userContext } = req;
  const {
    image, playerIds, gameIds, groupIds,
  } = req.getBody();
  imageService.addImage(userContext, image, playerIds, gameIds, groupIds)
    .then((data) => {
      res.status(HttpStatus.CREATED).send(data);
    })
    .catch(next);
}

function deleteImage(req, res, next) {
  const { userContext } = req;
  const { imageId } = req.getAllParams();
  imageService.deleteImage(userContext, imageId)
    .then((data) => {
      res.status(HttpStatus.NO_CONTENT).send(data);
    })
    .catch(next);
}

module.exports = {
  addImage,
  deleteImage,
};
