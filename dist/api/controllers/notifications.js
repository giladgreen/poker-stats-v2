"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unregisterNotifications = exports.registerNotifications = exports.notificationsRoutes = void 0;
var express_1 = __importDefault(require("express"));
var notifications_1 = __importDefault(require("../services/notifications"));
exports.notificationsRoutes = express_1.default.Router();
function registerNotifications(req, res, next) {
    var userContext = req.userContext;
    var subscription = req.body;
    notifications_1.default.registerNotifications(userContext, JSON.stringify(subscription)).then(function () {
        res.status(201).json({});
        // @ts-ignore
    }).catch(next);
}
exports.registerNotifications = registerNotifications;
function unregisterNotifications(req, res, next) {
    var userContext = req.userContext;
    notifications_1.default.unregisterNotifications(userContext).then(function () {
        res.status(204).json({});
        // @ts-ignore
    }).catch(next);
}
exports.unregisterNotifications = unregisterNotifications;
// @ts-ignore
exports.notificationsRoutes.post('/notifications', registerNotifications);
// @ts-ignore
exports.notificationsRoutes.delete('/notifications', unregisterNotifications);
//# sourceMappingURL=notifications.js.map