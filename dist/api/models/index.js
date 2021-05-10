

var __assign = (this && this.__assign) || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (const p in s) { if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]; }
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
const __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const pg_1 = __importDefault(require('pg'));
const sequelize_1 = __importDefault(require('sequelize'));
const fs_1 = __importDefault(require('fs'));
const uuid_1 = __importDefault(require('uuid'));
const config_1 = require('../../config');

pg_1.default.defaults.ssl = true;
const dbConnectionString = config_1.DATABASE_URL;
const mockPresets = {
  findAll() { },
  findOne() { },
  findAndCountAll() { },
  create() { },
  update() { },
  transaction() { },
  destroy() { },
  count() { },
  increment() { },
  bulkCreate() { },
};
const localStorage = {};
let sequelize;
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
    create(data) {
      // @ts-ignore
      const newId = uuid_1.default();
      const item = __assign(__assign({}, data), { id: newId });
      // @ts-ignore
      localStorage[modelName][newId] = item;
      return __assign(__assign({}, item), { toJSON() { return item; } });
    },
    // @ts-ignore
    update(data, _a) {
      const where = _a.where;
      const id = where.id;
      // @ts-ignore
      const item = __assign(__assign({}, localStorage[modelName][id]), data);
      // @ts-ignore
      localStorage[modelName][id] = item;
      return __assign(__assign({}, item), { toJSON() { return item; } });
    },
    // @ts-ignore
    findOne(_a) {
      const where = _a.where;
      // @ts-ignore
      const items = Object.values(localStorage[modelName])
        .filter((item) => {
          const attributes = Object.keys(where);
          // @ts-ignore
          return !attributes.some(attribute => where[attribute] !== item[attribute]);
        });
      // @ts-ignore
      return items.length > 0 ? __assign(__assign({}, items[0]), { toJSON() { return items[0]; } }) : null;
    },
    destroy(_a) {
      const where = _a.where;
      // @ts-ignore
      Object.values(localStorage[modelName])
        .filter((item) => {
          const attributes = Object.keys(where);
          // @ts-ignore
          return !attributes.some(attribute => where[attribute] !== item[attribute]);
          // @ts-ignore
        }).forEach(item => delete localStorage[modelName][item.id]);
    },
    findAll(_a) {
      const where = _a.where; const _b = _a.limit; const limit = _b === void 0 ? 1000 : _b; const _c = _a.offset; const
        offset = _c === void 0 ? 0 : _c;
      // @ts-ignore
      let items = Object.values(localStorage[modelName]);
      if (where) {
        items = items.filter((item) => {
          const attributes = Object.keys(where);
          // @ts-ignore
          return !attributes.some(attribute => where[attribute] !== item[attribute]);
        });
      }
      // @ts-ignore
      return items.map(item => (__assign(__assign({}, item), { toJSON() { return item; } }))).slice(offset, offset + limit);
    },
    // @ts-ignore
    count(options) {
      // @ts-ignore
      const items = Object.values(localStorage[modelName]);
      const filteredItems = options ? items.filter((item) => {
        const attributes = Object.keys(options.where);
        // @ts-ignore
        return !attributes.some(attribute => options.where[attribute] !== item[attribute]);
      }) : items;
      return filteredItems.length;
    },
    clear() {
      // @ts-ignore
      localStorage[modelName] = {};
    },
  };
}
const modelFiles = fs_1.default.readdirSync(__dirname);
const models = modelFiles
  .reduce((all, fileName) => {
    let _a; let
      _b;
    if ((fileName === 'index.js') || (fileName === 'index.ts')) {
      return all;
    }
    const split = fileName.split('.');
    const modelName = split[0];
    const ext = split.pop();
    if ((ext !== 'js') && (ext !== 'ts')) { // avoid parsing .js.map files and also parse ts files in case of unit/integration tests
      return all;
    }
    if (config_1.STORAGE === 'DB') {
      const modelAttributeToDbFieldName = {};
      return __assign(__assign({}, all), (_a = {}, _a[modelName] = __assign(__assign({}, mockPresets), { modelAttributeToDbFieldName, modelAttributes: [] }), _a));
    }
    return __assign(__assign({}, all), (_b = {}, _b[modelName] = createLocalStorageForModel(modelName), _b));
  }, {});
Object.keys(models).forEach((modelName) => {
  // @ts-ignore
  if (models[modelName].associate) {
    // @ts-ignore
    models[modelName].associate(models);
  }
});
const Models = __assign({
  NOW: sequelize_1.default.NOW,
  sequelize,
  Sequelize: sequelize_1.default,
}, models);
exports.default = Models;
// # sourceMappingURL=index.js.map
