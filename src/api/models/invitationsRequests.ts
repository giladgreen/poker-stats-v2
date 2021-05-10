import dateFields from '../helpers/sequelize';

export default function (sequelize:any, DataTypes:any) {
  const InvitationsRequests = sequelize.define('invitationsRequests', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    groupId: {
      type: DataTypes.STRING,
      field: 'group_id',
    },
    userId: {
      type: DataTypes.STRING,
      field: 'user_id',
    },
    status: {
      type: DataTypes.TEXT,
      defaultValue: 'invitation requested',
    },
    ...dateFields,
  }, {
    paranoid: true,
    tableName: 'invitations_requests',
  });


  return InvitationsRequests;
};
