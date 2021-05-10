

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
  const Group = sequelize.define('groups', __assign({
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
  }, sequelize_1.default), {
    paranoid: true,
    tableName: 'groups',
  });
  Group.associate = function (models) {
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
}
exports.default = default_1;

// # sourceMappingURL=groups.js.map
