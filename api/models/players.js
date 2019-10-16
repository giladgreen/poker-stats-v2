const { dateFields } = require('../helpers/sequelize');

module.exports = function (sequelize, DataTypes) {
  const Player = sequelize.define('players', {
    id: {
      type: DataTypes.TEXT,
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
    phone: {
      type: DataTypes.TEXT,
    },
    email: {
      type: DataTypes.TEXT,
    },
    imageUrl: {
      type: DataTypes.TEXT,
      field: 'image_url',
    },
    birthday: {
      type: DataTypes.DATE,
    },
    groupId: {
      type: DataTypes.STRING,
      field: 'group_id',
    },
    ...dateFields,
  }, {
    paranoid: true,
    tableName: 'players',
  });

  return Player;
};
