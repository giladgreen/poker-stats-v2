import dateFields from '../helpers/sequelize';

export default function (sequelize:any, DataTypes:any) {
  const Group = sequelize.define('groups', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.TEXT,
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    imageUrl: {
      type: DataTypes.TEXT,
      defaultValue: null,
      field: 'image_url',
    },
    ...dateFields,
  }, {
    paranoid: true,
    tableName: 'groups',
  });

  Group.associate = (models: any) => {
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
