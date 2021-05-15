"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
var boom_1 = require("boom");
var moment_1 = __importDefault(require("moment"));
var models_1 = __importDefault(require("../models"));
var notifications_1 = __importDefault(require("./notifications"));
var game_1 = __importDefault(require("../helpers/game"));
var logger_1 = __importDefault(require("./logger"));
var gameAttributes = ['id', 'description', 'date', 'ready', 'groupId', 'createdAt'];
var gameDataAttributes = ['playerId', 'buyIn', 'cashOut', 'index', 'updatedAt', 'extra'];
var GILAD_USER_ID = 'e7659c43-a0fe-449b-85cd-33d561d74995';
var defaultValues = {
    description: '',
    date: (new Date()).toISOString(),
};
function getGame(_a) {
    var groupId = _a.groupId, gameId = _a.gameId;
    return __awaiter(this, void 0, void 0, function () {
        var gameData, game, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, models_1.default.games.findOne({
                        where: {
                            groupId: groupId,
                            id: gameId,
                        },
                        attributes: gameAttributes,
                    })];
                case 1:
                    gameData = _c.sent();
                    if (!gameData) {
                        throw boom_1.notFound('game not found', { groupId: groupId, gameId: gameId });
                    }
                    game = gameData.toJSON();
                    // @ts-ignore
                    _b = game;
                    return [4 /*yield*/, models_1.default.gamesData.findAll({
                            where: {
                                groupId: groupId,
                                gameId: gameId,
                            },
                            attributes: gameDataAttributes,
                            order: [['index', 'ASC'], ['createdAt', 'ASC']],
                        })];
                case 2:
                    // @ts-ignore
                    _b.playersData = (_c.sent()).map(function (data) { return data.toJSON(); });
                    return [2 /*return*/, game];
            }
        });
    });
}
function isGameReady(game) {
    var totalBuyIn = game.playersData.map(function (pd) { return pd.buyIn; }).reduce(function (total, num) { return total + num; }, 0);
    var totalCashOut = game.playersData.map(function (pd) { return pd.cashOut; }).reduce(function (total, num) { return total + num; }, 0);
    var diff = totalBuyIn - totalCashOut;
    return diff === 0 && game.playersData.length > 1;
}
function getGames(groupId, limit, offset) {
    if (limit === void 0) { limit = 1000; }
    if (offset === void 0) { offset = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var allCount, allGames, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, models_1.default.games.count({ where: { groupId: groupId } })];
                case 1:
                    allCount = _a.sent();
                    return [4 /*yield*/, models_1.default.games.findAll({
                            limit: limit,
                            offset: offset,
                            order: [['createdAt', 'ASC']],
                            include: [{
                                    // @ts-ignore
                                    model: models_1.default.gamesData,
                                    as: 'playersData',
                                    required: false,
                                    where: {
                                        groupId: groupId,
                                    },
                                }],
                            where: {
                                groupId: groupId,
                            },
                            attributes: gameAttributes,
                        })];
                case 2:
                    allGames = _a.sent();
                    results = allGames.map(function (game) { return game.toJSON(); }).map(function (game) {
                        game.description = game.description || '';
                        game.ready = isGameReady(game);
                        if (game.ready) {
                            game.mvpPlayerId = game.playersData.map(function (data) { return ({ playerId: data.playerId, bottomLine: data.cashOut - data.buyIn }); })
                                .reduce(function (a, b) { return (a.bottomLine > b.bottomLine ? a : (a.bottomLine < b.bottomLine ? b : (a.buyIn < b.buyIn ? a : b))); }).playerId;
                        }
                        return game;
                    });
                    return [2 /*return*/, {
                            metadata: {
                                totalResults: allCount,
                                count: allGames.length,
                                limit: limit,
                                offset: offset,
                            },
                            results: results,
                        }];
            }
        });
    });
}
function createGame(groupId, data) {
    return __awaiter(this, void 0, void 0, function () {
        var playersData, ready, date, newGameData, newGame;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    playersData = data.playersData;
                    ready = game_1.default.isGameReady(playersData);
                    date = moment_1.default(new Date(("" + data.date).substr(0, 10))).add(12, 'hours').toDate();
                    newGameData = __assign(__assign(__assign({}, defaultValues), data), { ready: ready, groupId: groupId, date: date });
                    delete newGameData.playersData;
                    return [4 /*yield*/, models_1.default.games.create(newGameData)];
                case 1:
                    newGame = _a.sent();
                    if (!playersData) return [3 /*break*/, 3];
                    // @ts-ignore
                    return [4 /*yield*/, Promise.all(playersData.map(function (playerData, index) { return models_1.default.gamesData.create(__assign(__assign({}, playerData), { index: index, gameId: newGame.id, groupId: groupId, extra: { cashOuts: [], buyIns: [{ time: new Date(), amount: playerData.buyIn }] } })); }))];
                case 2:
                    // @ts-ignore
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/, getGame({ groupId: groupId, gameId: newGame.id })];
            }
        });
    });
}
function validateUserCanEditGame(groupId, gameId, isAdmin) {
    return __awaiter(this, void 0, void 0, function () {
        var existingGame, ready;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, models_1.default.gamesData.findOne({
                        where: {
                            groupId: groupId,
                            gameId: gameId,
                        },
                    })];
                case 1:
                    existingGame = _a.sent();
                    if (existingGame) {
                        ready = existingGame.ready;
                        if (ready && !isAdmin) {
                            throw boom_1.unauthorized('user not admin of group');
                        }
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function updateGame(userContext, groupId, gameId, data) {
    return __awaiter(this, void 0, void 0, function () {
        var date, existingData, updateData, playersData, ready, game, mvpPlayerId, mvpPlayer, text, link, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, validateUserCanEditGame(groupId, gameId, userContext.isAdmin)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, getGame({ groupId: groupId, gameId: gameId })];
                case 2:
                    _a.sent();
                    date = moment_1.default(new Date(("" + data.date).substr(0, 10))).add(12, 'hours').toDate();
                    return [4 /*yield*/, models_1.default.gamesData.findAll({
                            where: {
                                groupId: groupId,
                                gameId: gameId,
                            },
                        })];
                case 3:
                    existingData = _a.sent();
                    // @ts-ignore
                    return [4 /*yield*/, models_1.default.gamesData.destroy({
                            where: {
                                groupId: groupId,
                                gameId: gameId,
                            },
                            paranoid: false,
                        })];
                case 4:
                    // @ts-ignore
                    _a.sent();
                    updateData = __assign({}, data);
                    playersData = updateData.playersData;
                    ready = game_1.default.isGameReady(playersData);
                    delete updateData.playersData;
                    // @ts-ignore
                    return [4 /*yield*/, models_1.default.games.update(__assign(__assign({}, data), { date: date, ready: ready }), {
                            where: {
                                groupId: groupId,
                                id: gameId,
                            },
                        })];
                case 5:
                    // @ts-ignore
                    _a.sent();
                    if (!playersData) return [3 /*break*/, 7];
                    return [4 /*yield*/, Promise.all(playersData.map(function (playerData, index) {
                            var currentPlayerData = existingData.find(function (d) { return d.playerId === playerData.playerId; });
                            var extra = {
                                buyIns: [],
                                cashOuts: [],
                            };
                            var buyInSum = 0;
                            if (currentPlayerData && currentPlayerData.extra && currentPlayerData.extra.buyIns) {
                                currentPlayerData.extra.buyIns.forEach(function (bi) {
                                    // @ts-ignore
                                    extra.buyIns.push(bi);
                                    buyInSum += bi.amount;
                                });
                            }
                            var cashOutSum = 0;
                            if (currentPlayerData && currentPlayerData.extra && currentPlayerData.extra.cashOuts) {
                                currentPlayerData.extra.cashOuts.forEach(function (co) {
                                    // @ts-ignore
                                    extra.cashOuts.push(co);
                                    cashOutSum += co.amount;
                                });
                            }
                            if (playerData.buyIn - buyInSum > 0) {
                                // @ts-ignore
                                extra.buyIns.push({ time: new Date(), amount: playerData.buyIn - buyInSum });
                            }
                            if (playerData.cashOut - cashOutSum > 0) {
                                // @ts-ignore
                                extra.cashOuts.push({ time: new Date(), amount: playerData.cashOut - cashOutSum });
                            }
                            // @ts-ignore
                            return models_1.default.gamesData.create(__assign(__assign({}, playerData), { index: index, gameId: gameId, groupId: groupId, extra: extra }));
                        }))];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [4 /*yield*/, getGame({ groupId: groupId, gameId: gameId })];
                case 8:
                    game = _a.sent();
                    if (!ready) return [3 /*break*/, 13];
                    _a.label = 9;
                case 9:
                    _a.trys.push([9, 12, , 13]);
                    mvpPlayerId = game.playersData.map(function (pdata) { return ({ playerId: pdata.playerId, bottomLine: pdata.cashOut - pdata.buyIn }); })
                        .reduce(function (a, b) { return (a.bottomLine > b.bottomLine ? a : (a.bottomLine < b.bottomLine ? b : (a.buyIn < b.buyIn ? a : b))); }).playerId;
                    mvpPlayer = void 0;
                    if (!mvpPlayerId) return [3 /*break*/, 11];
                    return [4 /*yield*/, models_1.default.players.findOne({
                            where: {
                                groupId: groupId,
                                id: mvpPlayerId,
                            },
                        })];
                case 10:
                    // @ts-ignore
                    mvpPlayer = _a.sent();
                    _a.label = 11;
                case 11:
                    text = mvpPlayer ? "MVP: " + mvpPlayer.name : 'Game is done';
                    link = mvpPlayer ? mvpPlayer.imageUrl : 'https://www.poker-stats.com/';
                    notifications_1.default.sendNotification(GILAD_USER_ID, 'Game Updated', link, text);
                    return [3 /*break*/, 13];
                case 12:
                    e_1 = _a.sent();
                    logger_1.default.error('error sending update game notification', e_1.message, e_1.stack);
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/, game];
            }
        });
    });
}
function deleteGame(userContext, groupId, gameId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, validateUserCanEditGame(groupId, gameId, userContext.isAdmin)];
                case 1:
                    _a.sent();
                    // @ts-ignore
                    return [4 /*yield*/, models_1.default.gamesData.destroy({
                            where: {
                                groupId: groupId,
                                gameId: gameId,
                            },
                            paranoid: false,
                        })];
                case 2:
                    // @ts-ignore
                    _a.sent();
                    // @ts-ignore
                    return [2 /*return*/, models_1.default.games.destroy({
                            where: {
                                groupId: groupId,
                                id: gameId,
                            },
                        })];
            }
        });
    });
}
exports.default = {
    createGame: createGame,
    getGame: getGame,
    getGames: getGames,
    updateGame: updateGame,
    deleteGame: deleteGame,
};
//# sourceMappingURL=games.js.map