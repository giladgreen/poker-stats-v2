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
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deleted_at',
    },
  }, {
    paranoid: true,
    tableName: 'games_data',
  });

/*
  GameData.associate = (models) => {
    GameData.belongsTo(models.players, {
      foreignKey: 'playerId',
      targetKey: 'id'
    });
  };
 */
  return GameData;
};
