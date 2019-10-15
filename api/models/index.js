const Sequelize = require('sequelize');
const fs = require('fs');
const { generateConnectionString } = require('../helpers/sequelize');

const dbConnectionString = generateConnectionString();

const sequelize = new Sequelize(dbConnectionString, { ssl:true, pool: { acquire: 2000 } });

const models = fs.readdirSync(__dirname)
  .reduce((all, fileName) => {
    if (fileName === 'index.js') {
      return all;
    }

    return {
      ...all,
      [fileName.split('.')[0]]: sequelize.import(`${__dirname}/${fileName}`),
    };
  }, {});

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  Sequelize,
  ...models,
};
