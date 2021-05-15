"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = __importDefault(require("uuid"));
function transactionIdMiddlewares(request, response, next) {
    try {
        // @ts-ignore
        request.tid = uuid_1.default();
        // @ts-ignore
        response.setHeader('Transaction-ID', request.tid);
        next();
    }
    catch (error) {
        next(error);
    }
}
exports.default = transactionIdMiddlewares;
//# sourceMappingURL=transaction_id.js.map