"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var boom_1 = require("boom");
var cloudinary_1 = __importDefault(require("../helpers/cloudinary"));
var models_1 = __importDefault(require("../models"));
var logger_1 = __importDefault(require("./logger"));
var Op = models_1.default.Sequelize.Op;
function deleteImage(userContext, imageId) {
    return __awaiter(this, void 0, void 0, function () {
        var image;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!userContext || !userContext.id) {
                        throw boom_1.badRequest('missing user id');
                    }
                    if (!imageId) {
                        throw boom_1.badRequest('missing imageId');
                    }
                    return [4 /*yield*/, models_1.default.images.findOne({ where: { id: imageId } })];
                case 1:
                    image = _a.sent();
                    if (!image) {
                        throw boom_1.badRequest('image not found');
                    }
                    if (image.uploadedBy !== userContext.id && !userContext.isAdmin) {
                        throw boom_1.forbidden('only the user that uploaded the image can remove it');
                    }
                    // @ts-ignore
                    return [4 /*yield*/, models_1.default.tags.destroy({ where: { imageId: imageId } })];
                case 2:
                    // @ts-ignore
                    _a.sent();
                    // @ts-ignore
                    return [4 /*yield*/, models_1.default.images.destroy({ where: { id: imageId } })];
                case 3:
                    // @ts-ignore
                    _a.sent();
                    if (image.publicId) {
                        cloudinary_1.default.delete(image.publicId);
                    }
                    return [2 /*return*/, {
                            status: 'image was removed',
                        }];
            }
        });
    });
}
function getImages(_a) {
    var playerIds = _a.playerIds, gameIds = _a.gameIds, groupIds = _a.groupIds;
    return __awaiter(this, void 0, void 0, function () {
        var tags, imageIds, allTags, images, users;
        var _b, _c, _d, _e, _f, _g, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    if ((!playerIds || playerIds.length === 0) && (!gameIds || gameIds.length === 0) && (!groupIds || groupIds.length === 0)) {
                        throw boom_1.badRequest('must supply at least one (non empty array) of:  "playerIds" / "gameIds" / "groupIds"');
                    }
                    groupIds = groupIds || [];
                    gameIds = gameIds || [];
                    playerIds = playerIds || [];
                    return [4 /*yield*/, models_1.default.tags.findAll({
                            where: (_b = {},
                                _b[Op.or] = [
                                    {
                                        playerId: (_c = {},
                                            _c[Op.in] = playerIds,
                                            _c),
                                    },
                                    {
                                        gameId: (_d = {},
                                            _d[Op.in] = gameIds,
                                            _d),
                                    },
                                    {
                                        groupId: (_e = {},
                                            _e[Op.in] = groupIds,
                                            _e),
                                    },
                                ],
                                _b),
                        })];
                case 1:
                    tags = _j.sent();
                    imageIds = tags.map(function (tag) { return tag.imageId; });
                    return [4 /*yield*/, models_1.default.tags.findAll({
                            where: {
                                imageId: (_f = {},
                                    _f[Op.in] = imageIds,
                                    _f),
                            },
                        })];
                case 2:
                    allTags = _j.sent();
                    return [4 /*yield*/, models_1.default.images.findAll({
                            order: [['createdAt', 'ASC']],
                            where: {
                                id: (_g = {},
                                    _g[Op.in] = imageIds,
                                    _g),
                            },
                        })];
                case 3:
                    images = _j.sent();
                    return [4 /*yield*/, models_1.default.users.findAll({
                            where: {
                                id: (_h = {},
                                    _h[Op.in] = images.map(function (imageDbObject) { return imageDbObject.uploadedBy; }),
                                    _h),
                            },
                        })];
                case 4:
                    users = _j.sent();
                    return [2 /*return*/, images.map(function (imageDbObject) {
                            var imageId = imageDbObject.id;
                            var imageTags = allTags.filter(function (tag) { return tag.imageId === imageId; });
                            var imageGroupIds = __spreadArray([], __read(new Set(imageTags.filter(function (tag) { return tag.groupId !== null; }).map(function (tag) { return tag.groupId; }))));
                            var imageGameIds = __spreadArray([], __read(new Set(imageTags.filter(function (tag) { return tag.gameId !== null; }).map(function (tag) { return tag.gameId; }))));
                            var imagePlayerIds = __spreadArray([], __read(new Set(imageTags.filter(function (tag) { return tag.playerId !== null; }).map(function (tag) { return tag.playerId; }))));
                            var uploadedByUser = users.find(function (user) { return user.id === imageDbObject.uploadedBy; });
                            var uploadedByName = uploadedByUser ? uploadedByUser.firstName + " " + uploadedByUser.familyName : 'unknown';
                            return {
                                id: imageId,
                                uploadedByName: uploadedByName,
                                uploadedById: imageDbObject.uploadedBy,
                                image: imageDbObject.image,
                                groupIds: imageGroupIds,
                                gameIds: imageGameIds,
                                playerIds: imagePlayerIds,
                            };
                        })];
            }
        });
    });
}
function addImage(userContext, image, playerIds, gameIds, groupIds, playerImage) {
    return __awaiter(this, void 0, void 0, function () {
        var groups, games, players, _a, url, publicId, imageId, user;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!userContext || !userContext.id) {
                        throw boom_1.badRequest('missing user id');
                    }
                    if (!image) {
                        throw boom_1.badRequest('missing image data');
                    }
                    if (!playerImage && (!playerIds || playerIds.length === 0) && (!gameIds || gameIds.length === 0) && (!groupIds || groupIds.length === 0)) {
                        throw boom_1.badRequest('must supply at least one (non empty array) of:  "playerIds" / "gameIds" / "groupIds"');
                    }
                    groupIds = groupIds || [];
                    gameIds = gameIds || [];
                    playerIds = playerIds || [];
                    return [4 /*yield*/, Promise.all(groupIds.map(function (groupId) { return models_1.default.groups.findOne({ where: { id: groupId } }); }))];
                case 1:
                    groups = _b.sent();
                    return [4 /*yield*/, Promise.all(gameIds.map(function (gameId) { return models_1.default.games.findOne({ where: { id: gameId } }); }))];
                case 2:
                    games = _b.sent();
                    return [4 /*yield*/, Promise.all(playerIds.map(function (playerId) { return models_1.default.players.findOne({ where: { id: playerId } }); }))];
                case 3:
                    players = _b.sent();
                    if (groupIds.length > 0 && groups.filter(function (group) { return group === null; }).length > 0) {
                        throw boom_1.badRequest('group not found', { groupIds: groupIds });
                    }
                    if (gameIds.length > 0 && games.filter(function (game) { return game === null; }).length > 0) {
                        throw boom_1.badRequest('game not found', { gameIds: gameIds });
                    }
                    if (playerIds.length > 0 && players.filter(function (player) { return player === null; }).length > 0) {
                        throw boom_1.badRequest('player not found', { playerIds: playerIds });
                    }
                    return [4 /*yield*/, cloudinary_1.default.upload(image)];
                case 4:
                    _a = _b.sent(), url = _a.url, publicId = _a.publicId;
                    imageId = '';
                    if (!!playerImage) return [3 /*break*/, 7];
                    logger_1.default.info('NOT playerImage, about to insert to image db, url:', url, 'publicId:', publicId);
                    // @ts-ignore
                    return [4 /*yield*/, models_1.default.images.create({ image: url, publicId: publicId, uploadedBy: userContext.id })];
                case 5:
                    // @ts-ignore
                    _b.sent();
                    return [4 /*yield*/, models_1.default.images.findOne({ where: { image: url, publicId: publicId, uploadedBy: userContext.id } })];
                case 6:
                    // @ts-ignore
                    imageId = (_b.sent()).id;
                    return [3 /*break*/, 8];
                case 7:
                    logger_1.default.info('playerImage, about to insert to image db, url:', url, 'publicId:', publicId);
                    _b.label = 8;
                case 8:
                    logger_1.default.info("imageId: " + imageId);
                    if (!imageId) return [3 /*break*/, 12];
                    // @ts-ignore
                    return [4 /*yield*/, Promise.all(groupIds.map(function (groupId) { return models_1.default.tags.create({ imageId: imageId, groupId: groupId }); }))];
                case 9:
                    // @ts-ignore
                    _b.sent();
                    // @ts-ignore
                    return [4 /*yield*/, Promise.all(gameIds.map(function (gameId) { return models_1.default.tags.create({ imageId: imageId, gameId: gameId }); }))];
                case 10:
                    // @ts-ignore
                    _b.sent();
                    // @ts-ignore
                    return [4 /*yield*/, Promise.all(playerIds.map(function (playerId) { return models_1.default.tags.create({ imageId: imageId, playerId: playerId }); }))];
                case 11:
                    // @ts-ignore
                    _b.sent();
                    _b.label = 12;
                case 12: return [4 /*yield*/, models_1.default.users.findOne({
                        where: {
                            id: userContext.id,
                        },
                    })];
                case 13:
                    user = _b.sent();
                    return [2 /*return*/, {
                            uploadedById: userContext.id,
                            uploadedByName: user ? user.firstName + " " + user.familyName : 'unknown',
                            // @ts-ignore
                            imageId: imageId,
                            image: url,
                            playerIds: playerIds,
                            gameIds: gameIds,
                            groupIds: groupIds,
                        }];
            }
        });
    });
}
exports.default = {
    addImage: addImage,
    deleteImage: deleteImage,
    getImages: getImages,
};
//# sourceMappingURL=images.js.map