"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = require("sequelize");
var dateFields = {
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'created_at',
        allowNull: false,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'updated_at',
        allowNull: false,
    },
    deletedAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'deleted_at',
        allowNull: true,
    },
};
exports.default = dateFields;
//# sourceMappingURL=sequelize.js.map