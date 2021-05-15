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
    var Player = sequelize.define('players', __assign({ id: {
            type: DataTypes.STRING,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        }, name: {
            type: DataTypes.TEXT,
            defaultValue: '',
        }, email: {
            type: DataTypes.TEXT,
            defaultValue: '',
        }, imageUrl: {
            type: DataTypes.TEXT,
            field: 'image_url',
        }, videoUrl: {
            type: DataTypes.TEXT,
            field: 'video_url',
        }, groupId: {
            type: DataTypes.STRING,
            field: 'group_id',
        } }, sequelize_1.default), {
        paranoid: true,
        tableName: 'players',
    });
    return Player;
}
exports.default = default_1;
;
//# sourceMappingURL=players.js.map