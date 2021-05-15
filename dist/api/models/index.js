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
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
var pg_1 = __importDefault(require("pg"));
var sequelize_1 = __importDefault(require("sequelize"));
var fs_1 = __importDefault(require("fs"));
var uuid_1 = __importDefault(require("uuid"));
var config_1 = require("../../config");
pg_1.default.defaults.ssl = true;
var dbConnectionString = config_1.DATABASE_URL;
var mockPresets = {
    findAll: function () { },
    findOne: function () { },
    findAndCountAll: function () { },
    create: function () { },
    update: function () { },
    transaction: function () { },
    destroy: function () { },
    count: function () { },
    increment: function () { },
    bulkCreate: function () { },
};
var localStorage = {};
var sequelize;
if (config_1.STORAGE === 'DB') {
    // @ts-ignore
    sequelize = new sequelize_1.default(dbConnectionString, {
        dialect: 'postgres',
        logging: false,
        ssl: true,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        pool: {
            acquire: 2000,
        },
    });
}
function createLocalStorageForModel(modelName) {
    // @ts-ignore
    localStorage[modelName] = {};
    return {
        create: function (data) {
            // @ts-ignore
            var newId = uuid_1.default();
            var item = __assign(__assign({}, data), { id: newId });
            // @ts-ignore
            localStorage[modelName][newId] = item;
            return __assign(__assign({}, item), { toJSON: function () { return item; } });
        },
        // @ts-ignore
        update: function (data, _a) {
            var where = _a.where;
            var id = where.id;
            // @ts-ignore
            var item = __assign(__assign({}, localStorage[modelName][id]), data);
            // @ts-ignore
            localStorage[modelName][id] = item;
            return __assign(__assign({}, item), { toJSON: function () { return item; } });
        },
        // @ts-ignore
        findOne: function (_a) {
            var where = _a.where;
            // @ts-ignore
            var items = Object.values(localStorage[modelName])
                .filter(function (item) {
                var attributes = Object.keys(where);
                // @ts-ignore
                return !attributes.some(function (attribute) { return where[attribute] !== item[attribute]; });
            });
            // @ts-ignore
            return items.length > 0 ? __assign(__assign({}, items[0]), { toJSON: function () { return items[0]; } }) : null;
        },
        destroy: function (_a) {
            var where = _a.where;
            // @ts-ignore
            Object.values(localStorage[modelName])
                .filter(function (item) {
                var attributes = Object.keys(where);
                // @ts-ignore
                return !attributes.some(function (attribute) { return where[attribute] !== item[attribute]; });
                // @ts-ignore
            }).forEach(function (item) { return delete localStorage[modelName][item.id]; });
        },
        findAll: function (_a) {
            var where = _a.where, _b = _a.limit, limit = _b === void 0 ? 1000 : _b, _c = _a.offset, offset = _c === void 0 ? 0 : _c;
            // @ts-ignore
            var items = Object.values(localStorage[modelName]);
            if (where) {
                items = items.filter(function (item) {
                    var attributes = Object.keys(where);
                    // @ts-ignore
                    return !attributes.some(function (attribute) { return where[attribute] !== item[attribute]; });
                });
            }
            // @ts-ignore
            return items.map(function (item) { return (__assign(__assign({}, item), { toJSON: function () { return item; } })); }).slice(offset, offset + limit);
        },
        // @ts-ignore
        count: function (options) {
            // @ts-ignore
            var items = Object.values(localStorage[modelName]);
            var filteredItems = options ? items.filter(function (item) {
                var attributes = Object.keys(options.where);
                // @ts-ignore
                return !attributes.some(function (attribute) { return options.where[attribute] !== item[attribute]; });
            }) : items;
            return filteredItems.length;
        },
        clear: function () {
            // @ts-ignore
            localStorage[modelName] = {};
        },
    };
}
var modelFiles = fs_1.default.readdirSync(__dirname);
var models = modelFiles
    .reduce(function (all, fileName) {
    var _a, _b;
    if ((fileName === 'index.js') || (fileName === 'index.ts')) {
        return all;
    }
    var split = fileName.split('.');
    var modelName = split[0];
    var ext = split.pop();
    if ((ext !== 'js') && (ext !== 'ts')) { // avoid parsing .js.map files and also parse ts files in case of unit/integration tests
        return all;
    }
    if (config_1.STORAGE === 'DB') {
        var modelAttributeToDbFieldName = {};
        return __assign(__assign({}, all), (_a = {}, _a[modelName] = __assign(__assign({}, mockPresets), { modelAttributeToDbFieldName: modelAttributeToDbFieldName, modelAttributes: [] }), _a));
    }
    return __assign(__assign({}, all), (_b = {}, _b[modelName] = createLocalStorageForModel(modelName), _b));
}, {});
Object.keys(models).forEach(function (modelName) {
    // @ts-ignore
    if (models[modelName].associate) {
        // @ts-ignore
        models[modelName].associate(models);
    }
});
var Models = __assign({ NOW: sequelize_1.default.NOW, sequelize: sequelize,
    Sequelize: sequelize_1.default }, models);
exports.default = Models;
//# sourceMappingURL=index.js.map