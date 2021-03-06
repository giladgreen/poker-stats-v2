const { dateFields } = require('../helpers/sequelize');

module.exports = function (sequelize, DataTypes) {
  const GameData = sequelize.define('gamesData', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    cashOut: {
      type: DataTypes.NUMBER,
      field: 'cash_out',
    },
    index: {
      type: DataTypes.NUMBER,
    },
    buyIn: {
      type: DataTypes.NUMBER,
      field: 'buy_in',
    },
    playerId: {
      type: DataTypes.STRING,
      field: 'player_id',
    },
    gameId: {
      type: DataTypes.STRING,
      field: 'game_id',
    },
    groupId: {
      type: DataTypes.STRING,
      field: 'group_id',
    },
    extra: {
      type: DataTypes.JSON,
      field: 'extra',
    },
    ...dateFields,
  }, {
    paranoid: false,
    tableName: 'games_data',
  });

  GameData.associate = (models) => {
    GameData.belongsTo(models.games, {
      foreignKey: 'gameId',
      as: 'playersData',
      onDelete: 'CASCADE',
    });
  };

  return GameData;
};
