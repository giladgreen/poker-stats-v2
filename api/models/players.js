const { dateFields } = require('../helpers/sequelize');

module.exports = function (sequelize, DataTypes) {
  const Player = sequelize.define('players', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.TEXT,
    },
    email: {
      type: DataTypes.TEXT,
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
