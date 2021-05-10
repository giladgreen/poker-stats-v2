

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
  const GameData = sequelize.define('gamesData', __assign({
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    cashOut: {
      type: DataTypes.NUMBER,
      field: 'cash_out',
    },
    index: {
      type: DataTypes.NUMBER,
    },
    buyIn: {
      type: DataTypes.NUMBER,
      field: 'buy_in',
    },
    playerId: {
      type: DataTypes.STRING,
      field: 'player_id',
    },
    gameId: {
      type: DataTypes.STRING,
      field: 'game_id',
    },
    groupId: {
      type: DataTypes.STRING,
      field: 'group_id',
    },
    extra: {
      type: DataTypes.JSON,
      field: 'extra',
    },
  }, sequelize_1.default), {
    paranoid: false,
    tableName: 'games_data',
  });
  GameData.associate = function (models) {
    GameData.belongsTo(models.games, {
      foreignKey: 'gameId',
      as: 'playersData',
      onDelete: 'CASCADE',
    });
  };
  return GameData;
}
exports.default = default_1;

// # sourceMappingURL=gamesData.js.map
