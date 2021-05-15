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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = __importDefault(require("../helpers/sequelize"));
function default_1(sequelize, DataTypes) {
    var User = sequelize.define('users', __assign({ id: {
            type: DataTypes.STRING,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        }, subscription: {
            type: DataTypes.TEXT,
            field: 'subscription',
            defaultValue: null,
        }, firstName: {
            type: DataTypes.TEXT,
            field: 'first_name',
        }, familyName: {
            type: DataTypes.TEXT,
            field: 'family_name',
        }, email: {
            type: DataTypes.TEXT,
        }, imageUrl: {
            type: DataTypes.TEXT,
            field: 'image_url',
        }, hideGames: {
            type: DataTypes.BOOLEAN,
            field: 'hide_games',
            defaultValue: false,
        }, token: {
            type: DataTypes.TEXT,
            defaultValue: null,
        }, tokenExpiration: {
            type: DataTypes.DATE,
            field: 'token_expiration',
        } }, sequelize_1.default), {
        paranoid: true,
        tableName: 'users',
    });
    return User;
}
exports.default = default_1;
;
//# sourceMappingURL=users.js.map