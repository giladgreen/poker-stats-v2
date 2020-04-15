const { dateFields } = require('../helpers/sequelize');


module.exports = function (sequelize, DataTypes) {
  const OnlineGames = sequelize.define('onlineGames', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    data: {
      type: DataTypes.JSON,
      field: 'extra',
    },
    ...dateFields,
  }, {
    paranoid: true,
    tableName: 'online_games',
  });

  return OnlineGames;
};
