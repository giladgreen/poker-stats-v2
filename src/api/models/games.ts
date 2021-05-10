import dateFields from '../helpers/sequelize';


export default function (sequelize:any, DataTypes:any) {
  const Game = sequelize.define('games', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: '',
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

  Game.associate = (models: any) => {
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
