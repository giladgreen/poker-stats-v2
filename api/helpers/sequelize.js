const moment = require('moment');
const { DataTypes, Op } = require('sequelize');
const { db: { host, dbName, user } } = require('config');
const logger = require('../services/logger');

const dateFields = {
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
    allowNull: false,
  },
  deletedAt: {
    type: DataTypes.DATE,
    field: 'deleted_at',
    allowNull: true,
  },
};

function formatSequelizeRow(row) {
  const obj = row.toJSON();
  return Object.keys(obj).reduce((all, key) => {
    if (obj[key] !== null) {
      // eslint-disable-next-line no-param-reassign
      all[key] = obj[key];
    }
    return all;
  }, {});
}

function formatSequelizeRows(rows) {
  return rows.map(row => formatSequelizeRow(row));
}


function generateConnectionString() {
  return 'postgres://rfis:12345@localhost:5432/pokerstats';
  /*
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  const { env: { DATABASE_URL } } = process;
  if (!DATABASE_URL) {
    logger.error('Could not find DATABASE_URL env var');
    throw new Error('DATABASE_URL ENV VARIABLE IS MISSING');
  }
  return DATABASE_URL;

   */
}
function wrapArray(arr) {
  if (arr.length === 1) {
    return arr[0];
  }

  return {
    [Op.in]: arr,
  };
}

function wrapDateRanges(startDate, endDate) {
  return {
    [Op.between]: [
      moment(startDate).format('YYYY-MM-DD'),
      moment(endDate).format('YYYY-MM-DD'),
    ],
  };
}

function wrapSearch(text) {
  return {
    [Op.or]: [
      ...['title', 'question', 'officialResponse', 'customIdentifier'].map(property => ({
        [property]: {
          [Op.iLike]: `%${text}%`,
        },
      })),
    ],
  };
}

function wrapOptionals(params) {
  const dateProperties = ['createdAt', 'dueDate'];
  const searchProperty = 'search';

  return Object.keys(params).reduce((all, key) => {
    if (params[key]) {
      if (dateProperties.includes(key)) {
        const [startDate, endDate] = params[key];
        return {
          ...all,
          [key]: wrapDateRanges(startDate, endDate),
        };
      }

      if (key === searchProperty) {
        return {
          ...all,
          ...wrapSearch(params[key]),
        };
      }

      return {
        ...all,
        [key]: {
          [Op.in]: params[key],
        },
      };
    }
    return all;
  }, {});
}

module.exports = {
  dateFields,
  formatSequelizeRow,
  generateConnectionString,
  formatSequelizeRows,
  wrapArray,
  wrapOptionals,
};
