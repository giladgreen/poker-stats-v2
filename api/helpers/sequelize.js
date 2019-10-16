const { DataTypes } = require('sequelize');

const dateFields = {
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
    allowNull: false,
  },
  deletedAt: {
    type: DataTypes.DATE,
    field: 'deleted_at',
    allowNull: true,
  },
};

function generateConnectionString() {
  return process.env.DATABASE_URL || 'postgres://rfis:12345@localhost:5432/pokerstats';
}

module.exports = {
  dateFields,
  generateConnectionString,
};
