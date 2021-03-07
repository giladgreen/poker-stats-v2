const pg = require('pg');

pg.defaults.ssl = true;

const Sequelize = require('sequelize');
const fs = require('fs');
const uuid = require('uuid');

const { DATABASE_URL, STORAGE } = require('../../config.js');

const dbConnectionString = DATABASE_URL;

const localStorage = {};
let sequelize;
if (STORAGE === 'DB') {
  sequelize = new Sequelize(dbConnectionString, {
    dialect: 'postgres',
    logging: false,
    native: true,
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
      },
    },
    pool: {
      acquire: 2000,
    },
  });
}
function createLocalStorageForModel(modelName) {
  localStorage[modelName] = {};
  return {

    create: (data) => {
      const newId = uuid();
      const item = { ...data, id: newId };
      localStorage[modelName][newId] = item;
      return { ...item, toJSON: () => item };
    },
    update: (data, { where }) => {
      const { id } = where;
      const item = { ...localStorage[modelName][id], ...data };
      localStorage[modelName][id] = item;
      return { ...item, toJSON: () => item };
    },
    findOne: ({ where }) => {
      const items = Object.values(localStorage[modelName])
        .filter((item) => {
          const attributes = Object.keys(where);
          return !attributes.some(attribute => where[attribute] !== item[attribute]);
        });
      return items.length > 0 ? { ...items[0], toJSON: () => items[0] } : null;
    },
    destroy: ({ where }) => {
      Object.values(localStorage[modelName])
        .filter((item) => {
          const attributes = Object.keys(where);
          return !attributes.some(attribute => where[attribute] !== item[attribute]);
        }).forEach(item => delete localStorage[modelName][item.id]);
    },
    findAll: ({ where, limit = 1000, offset = 0 }) => {
      let items = Object.values(localStorage[modelName]);
      if (where) {
        items = items.filter((item) => {
          const attributes = Object.keys(where);
          return !attributes.some(attribute => where[attribute] !== item[attribute]);
        });
      }

      return items.map(item => ({ ...item, toJSON: () => item })).slice(offset, offset + limit);
    },
    count: (options) => {
      const items = Object.values(localStorage[modelName]);
      const filteredItems = options ? items.filter((item) => {
        const attributes = Object.keys(options.where);
        return !attributes.some(attribute => options.where[attribute] !== item[attribute]);
      }) : items;
      return filteredItems.length;
    },
    clear: () => {
      localStorage[modelName] = {};
    },
  };
}
const models = fs.readdirSync(__dirname)
  .reduce((all, fileName) => {
    if (fileName === 'index.js') {
      return all;
    }
    const modelName = fileName.split('.')[0];
    if (STORAGE === 'DB') {
      return {
        ...all,
        [modelName]: sequelize.import(`${__dirname}/${fileName}`),
      };
    }
    return {
      ...all,
      [modelName]: createLocalStorageForModel(modelName),
    };
  }, {});

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});
module.exports = {
  NOW: Sequelize.NOW,
  sequelize,
  Sequelize,
  ...models,
};
