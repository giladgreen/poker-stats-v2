const { dateFields } = require('../helpers/sequelize');

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
    ...dateFields,
  }, {
    paranoid: true,
    tableName: 'groups',
  });

  Group.associate = (models) => {
    Group.hasMany(models.games, {
      onDelete: 'cascade',
      hooks: true,
      as: 'games',
      foreignKey: 'groupId',
      sourceKey: 'id',
    });

    Group.hasMany(models.players, {
      onDelete: 'cascade',
      hooks: true,
      as: 'players',
      foreignKey: 'groupId',
      sourceKey: 'id',
    });
  };

  return Group;
};
