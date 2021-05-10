

const __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
exports.getGroupImages = exports.deleteImage = exports.addImage = exports.imagesRoutes = void 0;
const http_status_codes_1 = __importDefault(require('http-status-codes'));
const express_1 = __importDefault(require('express'));
const images_1 = __importDefault(require('../services/images'));

exports.imagesRoutes = express_1.default.Router();
function addImage(req, res, next) {
  const userContext = req.userContext;
  const _a = req.body; const image = _a.image; const playerIds = _a.playerIds; const gameIds = _a.gameIds; const groupIds = _a.groupIds; const
    playerImage = _a.playerImage;
  images_1.default.addImage(userContext, image, playerIds, gameIds, groupIds, playerImage)
    .then((data) => {
      res.status(http_status_codes_1.default.CREATED).send(data);
    })
  // @ts-ignore
    .catch(next);
}
exports.addImage = addImage;
function deleteImage(req, res, next) {
  const userContext = req.userContext;
  const imageId = req.params.imageId;
  // @ts-ignore
  images_1.default.deleteImage(userContext, imageId)
    .then((data) => {
      res.status(http_status_codes_1.default.NO_CONTENT).send(data);
    })
  // @ts-ignore
    .catch(next);
}
exports.deleteImage = deleteImage;
function getGroupImages(req, res, next) {
  const groupId = req.params.groupId;
  // @ts-ignore
  images_1.default.getImages({ groupIds: [groupId] })
    .then((results) => {
      res.status(http_status_codes_1.default.OK).send({ results });
    })
  // @ts-ignore
    .catch(next);
}
exports.getGroupImages = getGroupImages;
// @ts-ignore
exports.imagesRoutes.post('/images', addImage);
// @ts-ignore
exports.imagesRoutes.delete('/images/:imageId', deleteImage);
// @ts-ignore
exports.imagesRoutes.get('/groups/:groupId/images', getGroupImages);
// # sourceMappingURL=images.js.map
