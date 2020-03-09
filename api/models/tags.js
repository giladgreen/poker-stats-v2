const { dateFields } = require('../helpers/sequelize');

module.exports = function (sequelize, DataTypes) {
  const Tags = sequelize.define('tags', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    groupId: {
      type: DataTypes.STRING,
      field: 'group_id',
    },
    gameId: {
      type: DataTypes.STRING,
      field: 'game_id',
    },
    playerId: {
      type: DataTypes.STRING,
      field: 'player_id',
    },
    imageId: {
      type: DataTypes.STRING,
      field: 'image_id',
    },
    ...dateFields,
  }, {
    paranoid: true,
    tableName: 'tags',
  });

  return Tags;
};
