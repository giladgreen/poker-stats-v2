/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import pg from 'pg';
import Sequelize from 'sequelize';
import fs from 'fs';
import uuid from 'uuid';
import { DATABASE_URL, STORAGE } from '../../config';

pg.defaults.ssl = true;
const dbConnectionString = DATABASE_URL;
const mockPresets = {
  findAll() {},
  findOne() {},
  findAndCountAll() {},
  create() {},
  update() {},
  transaction() {},
  destroy() {},
  count() {},
  increment() {},
  bulkCreate() {},
};
const localStorage = {};
let sequelize: any;
if (STORAGE === 'DB') {
  // @ts-ignore
  sequelize = new Sequelize(dbConnectionString, {
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

function createLocalStorageForModel(modelName:string) {
  // @ts-ignore
  localStorage[modelName] = {};
  return {

    create: (data:any) => {
      // @ts-ignore
      const newId = uuid();
      const item = { ...data, id: newId };
      // @ts-ignore
      localStorage[modelName][newId] = item;
      return { ...item, toJSON: () => item };
    },
    // @ts-ignore
    update: (data:any, { where }) => {
      const { id } = where;
      // @ts-ignore
      const item = { ...localStorage[modelName][id], ...data };
      // @ts-ignore
      localStorage[modelName][id] = item;
      return { ...item, toJSON: () => item };
    },
    // @ts-ignore
    findOne: ({ where }) => {
      // @ts-ignore
      const items = Object.values(localStorage[modelName])
        .filter((item) => {
          const attributes = Object.keys(where);
          // @ts-ignore
          return !attributes.some(attribute => where[attribute] !== item[attribute]);
        });
      // @ts-ignore
      return items.length > 0 ? { ...items[0], toJSON: () => items[0] } : null;
    }, // @ts-ignore
    destroy: ({ where }) => {
      // @ts-ignore
      Object.values(localStorage[modelName])
        .filter((item) => {
          const attributes = Object.keys(where);
          // @ts-ignore
          return !attributes.some(attribute => where[attribute] !== item[attribute]);
          // @ts-ignore
        }).forEach(item => delete localStorage[modelName][item.id]);
    }, // @ts-ignore
    findAll: ({ where, limit = 1000, offset = 0 }) => {
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
      return items.map(item => ({ ...item, toJSON: () => item })).slice(offset, offset + limit);
    },
    // @ts-ignore
    count: (options) => {
      // @ts-ignore
      const items = Object.values(localStorage[modelName]);
      const filteredItems = options ? items.filter((item) => {
        const attributes = Object.keys(options.where);
        // @ts-ignore
        return !attributes.some(attribute => options.where[attribute] !== item[attribute]);
      }) : items;
      return filteredItems.length;
    },
    clear: () => {
      // @ts-ignore
      localStorage[modelName] = {};
    },
  };
}

interface Models {
  games: any,
  gamesData: any,
  groups: any,
  images: any,
  invitationsRequests: any,
  players: any
  users: any
  tags: any
  usersPlayers: any
}

const modelFiles = fs.readdirSync(__dirname);
const models = modelFiles
  .reduce((all, fileName) => {
    if ((fileName === 'index.js') || (fileName === 'index.ts')) {
      return all;
    }
    const split = fileName.split('.');
    const modelName = split[0] as string;
    const ext = split.pop();

    if ((ext !== 'js') && (ext !== 'ts')) { // avoid parsing .js.map files and also parse ts files in case of unit/integration tests
      return all;
    }

    if (STORAGE === 'DB') {
      const modelAttributeToDbFieldName = {};
      return {
        ...all,
        [modelName]: { ...mockPresets, modelAttributeToDbFieldName, modelAttributes: [] },
      } as Models;
    }
    return {
      ...all,
      // @ts-ignore
      [modelName]: createLocalStorageForModel(modelName),
    };
  }, {});


Object.keys(models).forEach((modelName) => {
    // @ts-ignore
    if (models[modelName].associate) {
      // @ts-ignore
      models[modelName].associate(models);
    }
});

const Models = {
  NOW: Sequelize.NOW,
  sequelize,
  Sequelize,
  ...models,
};

export default Models;
