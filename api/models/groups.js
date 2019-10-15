module.exports = function (sequelize, DataTypes) {
  const Group = sequelize.define('groups', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
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
    tableName: 'groups',
  });

  Group.associate = (models) => {
    Group.hasMany(models.games, {
      onDelete: 'cascade',
      as: 'games',
      foreignKey: 'groupId',
      sourceKey: 'id',
    });

    Group.hasMany(models.players, {
      onDelete: 'cascade',
      as: 'players',
      foreignKey: 'groupId',
      sourceKey: 'id',
    });

  };

  return Group;
};
