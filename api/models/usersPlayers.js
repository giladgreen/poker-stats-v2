const { dateFields } = require('../helpers/sequelize');

module.exports = function (sequelize, DataTypes) {
  const UserPlayers = sequelize.define('usersPlayers', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.STRING,
      field: 'user_id',
    },
    playerId: {
      type: DataTypes.STRING,
      field: 'player_id',
    },
    groupId: {
      type: DataTypes.STRING,
      field: 'group_id',
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      field: 'is_admin',
    },
    ...dateFields,
  }, {
    paranoid: true,
    tableName: 'users_players',
  });

  return UserPlayers;
};
