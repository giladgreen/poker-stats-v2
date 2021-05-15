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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGame = exports.updateGame = exports.createGame = exports.getGames = exports.filterResults = exports.getGame = exports.gamesRoutes = void 0;
var http_status_codes_1 = __importDefault(require("http-status-codes"));
var express_1 = __importDefault(require("express"));
var games_1 = __importDefault(require("../services/games"));
var models_1 = __importDefault(require("../models"));
var logger_1 = __importDefault(require("../services/logger"));
exports.gamesRoutes = express_1.default.Router();
function getGame(req, res, next) {
    var _a = req.params, gameId = _a.gameId, groupId = _a.groupId;
    games_1.default.getGame({ groupId: groupId, gameId: gameId })
        .then(function (game) {
        res.send(game);
    })
        // @ts-ignore
        .catch(next);
}
exports.getGame = getGame;
function filterResults(res, userId, hideGames) {
    return __awaiter(this, void 0, void 0, function () {
        var userPlayer, filteredResults;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!hideGames) {
                        return [2 /*return*/, res];
                    }
                    return [4 /*yield*/, models_1.default.usersPlayers.findOne({
                            where: {
                                userId: userId,
                            },
                        })];
                case 1:
                    userPlayer = _a.sent();
                    if (!userPlayer) {
                        return [2 /*return*/, res];
                    }
                    logger_1.default.info('filterResults userPlayer exist', { userId: userId, hideGames: hideGames, userPlayer: userPlayer.toJSON() });
                    filteredResults = res.results.filter(function (game) { return game.playersData.some(function (playData) { return playData.playerId === userPlayer.playerId; }); });
                    return [2 /*return*/, {
                            // @ts-ignore
                            metadata: res.metadata,
                            results: filteredResults,
                        }];
            }
        });
    });
}
exports.filterResults = filterResults;
function getGames(req, res, next) {
    var groupId = req.params.groupId;
    var _a = req.userContext, userId = _a.id, hideGames = _a.hideGames, _b = req.query, limit = _b.limit, offset = _b.offset;
    // @ts-ignore
    games_1.default.getGames(groupId, limit, offset)
        .then(function (result) {
        // @ts-ignore
        filterResults(result, userId, hideGames).then(function (filteredResult) { return res.send(filteredResult); }).catch(next);
    })
        // @ts-ignore
        .catch(next);
}
exports.getGames = getGames;
function createGame(req, res, next) {
    var groupId = req.params.groupId;
    var data = req.body;
    games_1.default.createGame(groupId, data)
        .then(function (game) {
        res.status(http_status_codes_1.default.CREATED).send(game);
    })
        // @ts-ignore
        .catch(next);
}
exports.createGame = createGame;
function updateGame(req, res, next) {
    var _a = req.params, groupId = _a.groupId, gameId = _a.gameId;
    var data = req.body;
    var userContext = req.userContext;
    games_1.default.updateGame(userContext, groupId, gameId, data)
        .then(function (game) {
        res.send(game);
    })
        // @ts-ignore
        .catch(next);
}
exports.updateGame = updateGame;
function deleteGame(req, res, next) {
    var _a = req.params, groupId = _a.groupId, gameId = _a.gameId;
    var userContext = req.userContext;
    games_1.default.deleteGame(userContext, groupId, gameId)
        .then(function () {
        res.status(http_status_codes_1.default.NO_CONTENT).send({ deleted: true });
    })
        // @ts-ignore
        .catch(next);
}
exports.deleteGame = deleteGame;
// @ts-ignore
exports.gamesRoutes.get('/groups/:groupId/games', getGames);
// @ts-ignore
exports.gamesRoutes.post('/groups/:groupId/games', createGame);
// @ts-ignore
exports.gamesRoutes.get('/groups/:groupId/games/:gameId', getGame);
// @ts-ignore
exports.gamesRoutes.patch('/groups/:groupId/games/:gameId', updateGame);
// @ts-ignore
exports.gamesRoutes.delete('/groups/:groupId/games/:gameId', deleteGame);
//# sourceMappingURL=games.js.map