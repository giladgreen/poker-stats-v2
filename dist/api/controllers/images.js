"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupImages = exports.deleteImage = exports.addImage = exports.imagesRoutes = void 0;
var http_status_codes_1 = __importDefault(require("http-status-codes"));
var express_1 = __importDefault(require("express"));
var images_1 = __importDefault(require("../services/images"));
var logger_1 = __importDefault(require("../services/logger"));
exports.imagesRoutes = express_1.default.Router();
function addImage(req, res, next) {
    var userContext = req.userContext;
    var _a = req.body, image = _a.image, playerIds = _a.playerIds, gameIds = _a.gameIds, groupIds = _a.groupIds, playerImage = _a.playerImage;
    logger_1.default.info('got request to add image. user context:', userContext);
    logger_1.default.info(' image:', image, ' playerIds:', playerIds, 'gameIds:', gameIds, 'groupIds:', groupIds, 'playerImage:', playerImage);
    images_1.default.addImage(userContext, image, playerIds, gameIds, groupIds, playerImage)
        .then(function (data) {
        res.status(http_status_codes_1.default.CREATED).send(data);
    })
        // @ts-ignore
        .catch(next);
}
exports.addImage = addImage;
function deleteImage(req, res, next) {
    var userContext = req.userContext;
    var imageId = req.params.imageId;
    // @ts-ignore
    images_1.default.deleteImage(userContext, imageId)
        .then(function (data) {
        res.status(http_status_codes_1.default.NO_CONTENT).send(data);
    })
        // @ts-ignore
        .catch(next);
}
exports.deleteImage = deleteImage;
function getGroupImages(req, res, next) {
    var groupId = req.params.groupId;
    // @ts-ignore
    images_1.default.getImages({ groupIds: [groupId] })
        .then(function (results) {
        res.status(http_status_codes_1.default.OK).send({ results: results });
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
//# sourceMappingURL=images.js.map