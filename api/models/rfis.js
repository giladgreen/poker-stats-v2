const { NOW } = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  const Rfis = sequelize.define('rfis', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
    },
    question: {
      type: DataTypes.TEXT,
      field: 'description',
    },
    status: {
      type: DataTypes.STRING,
      enum: [
        'draft',
        'submitted',
        'open',
        'rejected',
        'answered',
        'closed',
        'void',
      ],
    },
    assignedTo: {
      type: DataTypes.STRING,
      field: 'assigned_to',
    },
    assignedToType: {
      type: DataTypes.STRING,
      enum: [
        'user', 'company', 'role',
      ],
      field: 'assigned_to_type',
    },
    dueDate: {
      type: DataTypes.DATE,
      field: 'due_date',
    },
    location: {
      type: DataTypes.STRING,
      field: 'location_description',
    },
    // Attributes needed for linkedDocuments
    linkedDocument: {
      type: DataTypes.STRING,
      field: 'target_urn',
    },
    startingVersion: {
      type: DataTypes.INTEGER,
      field: 'starting_version',
    },
    closeVersion: {
      type: DataTypes.INTEGER,
      field: 'close_version',
    },
    officialResponse: {
      type: DataTypes.TEXT,
      field: 'answer',
    },
    respondedAt: {
      type: DataTypes.DATE,
      field: 'answered_at',
    },
    respondedBy: {
      type: DataTypes.STRING,
      field: 'answered_by',
    },
    createdBy: {
      type: DataTypes.STRING,
      field: 'created_by',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedBy: {
      type: DataTypes.STRING,
      field: 'updated_by',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
    openedBy: {
      type: DataTypes.STRING,
      field: 'opened_by',
    },
    openedAt: {
      type: DataTypes.DATE,
      field: 'opened_at',
    },
    closedBy: {
      type: DataTypes.STRING,
      field: 'closed_by',
    },
    closedAt: {
      type: DataTypes.DATE,
      field: 'closed_at',
    },
    // Attributes that are used in where clauses, joins, etc. to make sequelize working
    containerId: {
      type: DataTypes.UUID,
      field: 'container_id',
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deleted_at',
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Rfi',
    },
    suggestedAnswer: {
      type: DataTypes.STRING,
      field: 'suggested_answer',
    },
    coReviewers: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      field: 'co_reviewers',
    },
    distributionList: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      field: 'distribution_list',
    },
    // TODO: after v1 adds this to the schema
    // sc: {
    //   type: DataTypes.STRING,
    // },
    managerId: {
      type: DataTypes.STRING,
      field: 'manager',
    },
    reviewerId: {
      type: DataTypes.STRING,
      field: 'reviewer',
    },
    clientCreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: NOW,
      field: 'client_created_at',
    },
    clientUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: NOW,
      field: 'client_updated_at',
    },
    answeredAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'answered_at',
    },
    answeredBy: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'answered_by',
    },
    mentionees: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    constructionManagerId: {
      type: DataTypes.STRING,
      field: 'cm',
    },
    architectId: {
      type: DataTypes.STRING,
      field: 'arch',
    },
    createdByRole: {
      type: DataTypes.STRING,
      field: 'created_by_role',
      allowNull: true,
      enum: [
        'sc',
        'gc',
      ],
    },
    customIdentifier: {
      type: DataTypes.STRING,
      field: 'custom_identifier',
    },
  }, {
    paranoid: true,
    tableName: 'issues',
  });

  Rfis.associate = (models) => {
    Rfis.hasMany(models.comments, {
      onDelete: 'cascade',
      as: 'comments',
      foreignKey: 'rfiId',
      sourceKey: 'id',
    });

    Rfis.hasOne(models.pushpins, {
      onDelete: 'cascade',
      as: 'pushpins',
      foreignKey: 'rfiId',
      sourceKey: 'id',
    });
  };

  return Rfis;
};
