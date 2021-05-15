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
    var Tags = sequelize.define('tags', __assign({ id: {
            type: DataTypes.STRING,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        }, groupId: {
            type: DataTypes.STRING,
            field: 'group_id',
        }, gameId: {
            type: DataTypes.STRING,
            field: 'game_id',
        }, playerId: {
            type: DataTypes.STRING,
            field: 'player_id',
        }, imageId: {
            type: DataTypes.STRING,
            field: 'image_id',
        } }, sequelize_1.default), {
        paranoid: true,
        tableName: 'tags',
    });
    return Tags;
}
exports.default = default_1;
;
//# sourceMappingURL=tags.js.map