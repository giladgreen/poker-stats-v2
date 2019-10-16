const { dateFields } = require('../helpers/sequelize');

module.exports = function (sequelize, DataTypes) {
  const GameData = sequelize.define('gamesData', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    cashOut: {
      type: DataTypes.NUMBER,
      field: 'cash_out',
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
    ...dateFields,
  }, {
    paranoid: false,
    tableName: 'games_data',
  });

  return GameData;
};
