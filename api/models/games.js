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
    tableName: 'games',
  });

  Game.associate = (models) => {
    Game.hasMany(models.gamesData, {
      onDelete: 'cascade',
      hooks: true,
      as: 'data',
      foreignKey: 'gameId',
      sourceKey: 'id',
    });
  };

  return Game;
};
