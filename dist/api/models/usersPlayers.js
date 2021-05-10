

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
  const UserPlayers = sequelize.define('usersPlayers', __assign({
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
  }, sequelize_1.default), {
    paranoid: true,
    tableName: 'users_players',
  });
  return UserPlayers;
}
exports.default = default_1;

// # sourceMappingURL=usersPlayers.js.map
