import dateFields from '../helpers/sequelize';

export default function (sequelize:any, DataTypes:any) {
  const Images = sequelize.define('images', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uploadedBy: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'user_id',
    },
    publicId: {
      type: DataTypes.STRING,
      field: 'public_id',
    },
    ...dateFields,
  }, {
    paranoid: true,
    tableName: 'images',
  });

  return Images;
};
