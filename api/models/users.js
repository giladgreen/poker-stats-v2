const { dateFields } = require('../helpers/sequelize');

module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define('users', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    firstName: {
      type: DataTypes.TEXT,
      field: 'first_name',
    },
    familyName: {
      type: DataTypes.TEXT,
      field: 'family_name',
    },
    email: {
      type: DataTypes.TEXT,
    },
    imageUrl: {
      type: DataTypes.TEXT,
      field: 'image_url',
    },
    hideGames: {
      type: DataTypes.BOOLEAN,
      field: 'hide_games',
      defaultValue: false
    },
    token: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    tokenExpiration: {
      type: DataTypes.DATE,
      field: 'token_expiration',
    },
    ...dateFields,
  }, {
    paranoid: true,
    tableName: 'users',
  });

  return User;
};
