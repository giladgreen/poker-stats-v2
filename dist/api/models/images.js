

var __assign = (this && this.__assign) || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (const p in s) { if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]; }
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
const __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
const sequelize_1 = __importDefault(require('../helpers/sequelize'));

function default_1(sequelize, DataTypes) {
  const Images = sequelize.define('images', __assign({
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
  }, sequelize_1.default), {
    paranoid: true,
    tableName: 'images',
  });
  return Images;
}
exports.default = default_1;

// # sourceMappingURL=images.js.map
