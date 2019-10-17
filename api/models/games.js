const { dateFields } = require('../helpers/sequelize');


module.exports = function (sequelize, DataTypes) {
  const Game = sequelize.define('games', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    description: {
      type: DataTypes.TEXT,
    },
    date: {
      type: DataTypes.DATE,
    },
    groupId: {
      type: DataTypes.STRING,
      field: 'group_id',
    },
    ready: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    ...dateFields,
  }, {
    paranoid: true,
    tableName: 'games',
  });

  Game.associate = (models) => {
    Game.hasMany(models.gamesData, {
      onDelete: 'cascade',
      hooks: true,
      as: 'playersData',
      foreignKey: 'gameId',
      sourceKey: 'id',
    });
  };

  return Game;
};
