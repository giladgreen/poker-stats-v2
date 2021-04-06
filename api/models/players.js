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
      defaultValue: '',

    },
    email: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    imageUrl: {
      type: DataTypes.TEXT,
      field: 'image_url',
    },
    videoUrl: {
      type: DataTypes.TEXT,
      field: 'video_url',
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
