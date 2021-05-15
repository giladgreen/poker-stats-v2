"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = __importDefault(require("../services/logger"));
function loggerMiddlewares(request, response, next) {
    var startTime = new Date();
    var imageCall = request.url.indexOf('player-stack-image') >= 0 && request.method.toLowerCase() === 'post';
    if (!imageCall) {
        logger_1.default.debug('[fitting:logger]: incoming request', {
            method: request.method,
            url: request.url,
        });
    }
    response.on('finish', function () {
        if (!imageCall || response.statusCode > 200) {
            var endTime = new Date();
            // @ts-ignore
            logger_1.default.debug('[fitting:logger]: outgoing response', { nl: '', method: request.method, url: request.url, status: response.statusCode, duration: endTime - startTime });
        }
    });
    next();
}
exports.default = loggerMiddlewares;
//# sourceMappingURL=logger.js.map