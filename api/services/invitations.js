const { notFound } = require('boom');
const models = require('../models');
const logger = require('./logger');
const { sendHtmlMail } = require('./emails');

const INVITATION_REQUESTED = 'invitation requested';
const INVITATION_APPROVED = 'invitation approved';
const INVITATION_REJECTED = 'invitation rejected';

const pokerStatsUrlPrefix = 'http://localhost:5000/api/v2';
// const pokerStatsUrlPrefix = 'https://poker-stats.herokuapp.com/api/v2';

async function validateGroup(groupId) {
  const group = await models.groups.findOne({
    where: {
      id: groupId,
    },
  });
  if (!group) {
    /* istanbul ignore next */
    throw notFound('group does not exist', { groupId });
  }
  return group;
}

function getUserPlayer(groupId, userId) {
  return models.usersPlayers.findOne({
    where: {
      groupId,
      userId,
    },
  });
}

function getUser(userId) {
  return models.users.findOne({
    where: {
      id: userId,
    },
  });
}

function getExistingInvitationRequest(groupId, userId) {
  return models.invitationsRequests.findOne({
    where: {
      groupId,
      userId,
    },
  });
}

async function createInvitationRequestInDB(groupId, userId) {
  const newInvitationRequest = await models.invitationsRequests.create({
    groupId,
    userId,
  });
  return newInvitationRequest.id;
}

async function getAdmins(groupId) {
  const usersPlayersAdmins = await models.usersPlayers.findAll({
    where: {
      groupId,
      isAdmin: true,
    },
  });

  const admins = await Promise.all(usersPlayersAdmins.map(async (usersPlayersAdmin) => {
    const { userId } = usersPlayersAdmin;
    const adminUser = await getUser(userId);
    return {
      email: adminUser.email,
      name: `${adminUser.firstName} ${adminUser.familyName}`,
    };
  }));

  return admins;
}

async function getGroupPlayersData(groupId) {
  const allPlayers = await models.players.findAll({
    where: {
      groupId,
    },
  });

  const usersPlayers = await models.usersPlayers.findAll({
    where: {
      groupId,
    },
  });

  return allPlayers.filter(p => !usersPlayers.some(userPlayer => userPlayer.playerId === p.id)).map(player => ({
    id: player.id,
    name: `${player.firstName} ${player.familyName}`,
    email: player.email,
  }));
}

function getRejectLinkAddress(inventionsRequestId) {
  return `${pokerStatsUrlPrefix}/inventions-requests/${inventionsRequestId}?approved=false`;
}

function getLinkAddress(inventionsRequestId, playerId, approved, setAsAdmin) {
  return `${pokerStatsUrlPrefix}/inventions-requests/${inventionsRequestId}?inventionsRequestPlayerId=${playerId}&approved=${approved}&setAsAdmin=${setAsAdmin}`;
}

function createHtml(inventionsRequestId, groupId, groupName, userDetails, userName, adminName, players) {
  const rejectAddress = getRejectLinkAddress(inventionsRequestId);
  const playersLinks = players.map((player) => {
    const nonAdminApproveAddress = getLinkAddress(inventionsRequestId, player.id, true, false);
    const adminApproveAddress = getLinkAddress(inventionsRequestId, player.id, true, true);
    /* istanbul ignore next */
    const playerEmail = (player.email && player.email.length > 3 && player.email.indexOf('@') > 1) ? player.email : '';
    const playerName = `${player.name} ${playerEmail} `;
    return `<div>* <a href="${nonAdminApproveAddress}"> ${playerName} </a>  <span> - - </span>   (<a href="${adminApproveAddress}">  set as admin </a>)  <br/><br/></div> `;
  });

  const html = `<!doctype html>
                <html lang="en">
                  <head>
                    <meta charset="utf-8">
                  </head>
                  <body>
                    <div>
                        Hey ${adminName},<br/>
                        User ${userName} (${userDetails.email}) ,<br/><br/>
                        <img src="${userDetails.imageUrl}"/><br/><br/>
                        has requested to join your group: ${groupName}.<br/><br/>
                    </div>
                     <div>
                        press <a href="${rejectAddress}"> HERE </a> to reject the request.<br/><br/>
                        or choose which existing player this is: <br/><br/>
                    </div>
                     <div>
                      ${playersLinks.join('')}
                      
                    </div>
                    
                  </body>
                </html>`;


  return html;
}

async function sendEmail(inventionsRequestId, groupId, groupName, userDetails, admins, players) {
  const userName = `${userDetails.firstName} ${userDetails.familyName}`;
  const subject = `user [${userName}] has requested to join group [${groupName}]`;

  admins.forEach((admin) => {
    const html = createHtml(inventionsRequestId, groupId, groupName, userDetails, userName, admin.name, players);
    sendHtmlMail(subject, html, admin.email);
  });
}

async function createInvitationRequest(groupId, userId) {
  logger.info(`[Invitation-service] createInvitationRequest. groupId:${groupId}, userId: ${userId}`);
  const { name: groupName } = await validateGroup(groupId);
  const userPlayer = await getUserPlayer(groupId, userId);
  /* istanbul ignore next */
  if (userPlayer) {
    logger.info(`[Invitation-service] createInvitationRequest. userId: ${userId} is already in group :${groupId}`);
    return { status: 'user is already in group', invitationRequestId: null };
  }

  const invitationRequest = await getExistingInvitationRequest(groupId, userId);
  /* istanbul ignore next */
  if (invitationRequest) {
    logger.info('[Invitation-service] createInvitationRequest. invitation already requested');
    return { status: invitationRequest.status, invitationRequestId: null };
  }

  const invitationRequestId = await createInvitationRequestInDB(groupId, userId);
  logger.info(`[Invitation-service] createInvitationRequest. created new invitation request in db: ${invitationRequestId}`);

  const userDetails = await getUser(userId);
  const admins = await getAdmins(groupId);
  /* istanbul ignore next */
  if (admins.length === 0) {
    logger.error(`[Invitation-service] createInvitationRequest. group has no admins!! (${groupId})`);
    return { status: 'oops.. this group has no admin to approve you..', invitationRequestId: null };
  }

  const players = await getGroupPlayersData(groupId);
  /* istanbul ignore next */
  if (players.length === 0) {
    logger.warn(`[Invitation-service] createInvitationRequest. group has no un-assigned players.. (${groupId})`);
    return { status: 'oops.. this group has no admin to approve you..', invitationRequestId: null };
  }

  await sendEmail(invitationRequestId, groupId, groupName, userDetails, admins, players);

  return { status: INVITATION_REQUESTED, invitationRequestId };
}

function getExistingInvitationRequestById(inventionsRequestId) {
  return models.invitationsRequests.findOne({
    where: {
      id: inventionsRequestId,
    },
  });
}

function updateInventionsRequest(inventionsRequestId, status) {
  return models.invitationsRequests.update({ status }, {
    where: {
      id: inventionsRequestId,
    },
  });
}

/* istanbul ignore next */
async function handleUserAlreadyInGroup(existingUserPlayer, setAsAdmin, inventionsRequestPlayerId) {
  if (existingUserPlayer.isAdmin !== setAsAdmin || existingUserPlayer.playerId !== inventionsRequestPlayerId) {
    logger.info('[Invitation-service] answerInvitationRequest. updating user in group (either isAdmin or different player)');
    await models.usersPlayers.update({ isAdmin: setAsAdmin, playerId: inventionsRequestPlayerId }, {
      where: {
        id: existingUserPlayer.id,
      },
    });
  } else {
    logger.info('[Invitation-service] answerInvitationRequest. no need to change anything.');
  }
}

function createUserPlayer(setAsAdmin, inventionsRequestPlayerId, groupId, userId) {
  return models.usersPlayers.create({
    isAdmin: setAsAdmin,
    playerId: inventionsRequestPlayerId,
    groupId,
    userId,
  });
}

async function answerInvitationRequest(inventionsRequestId, inventionsRequestPlayerId, approved, setAsAdmin) {
  logger.info(`[Invitation-service] answerInvitationRequest. ${JSON.stringify(inventionsRequestId, inventionsRequestPlayerId, approved, setAsAdmin)}`);

  const inventionsRequest = await getExistingInvitationRequestById(inventionsRequestId);
  /* istanbul ignore next */
  if (!inventionsRequest) {
    logger.error(`[Invitation-service] answerInvitationRequest. did not found inventionsRequest in DB. ${inventionsRequestId}`);
    return `did not found inventionsRequest in DB (${inventionsRequestId})`;
  }
  /* istanbul ignore next */
  if (inventionsRequest.status !== INVITATION_REQUESTED) {
    logger.info(`[Invitation-service] answerInvitationRequest. invitation already ${inventionsRequest.status.replace('invitation ', '')}`);
    return `invitation already ${inventionsRequest.status.replace('invitation ', '')}`;
  }
  const { groupId, userId } = inventionsRequest;
  /* istanbul ignore next */
  if (!approved) {
    logger.info('[Invitation-service] answerInvitationRequest. invitation was rejected.');
    await updateInventionsRequest(inventionsRequestId, INVITATION_REJECTED);
    return INVITATION_REJECTED;
  }

  const existingUserPlayer = await getUserPlayer(groupId, userId);
  /* istanbul ignore next */
  if (existingUserPlayer) {
    logger.info('[Invitation-service] answerInvitationRequest. user already in group...');
    await handleUserAlreadyInGroup(existingUserPlayer, setAsAdmin, inventionsRequestPlayerId);
  } else {
    logger.info('[Invitation-service] answerInvitationRequest. user not in group. - adding it');
    await createUserPlayer(setAsAdmin, inventionsRequestPlayerId, groupId, userId);
  }
  await updateInventionsRequest(inventionsRequestId, INVITATION_APPROVED);
  return INVITATION_APPROVED;
}

module.exports = {
  createInvitationRequest,
  answerInvitationRequest,
  INVITATION_REQUESTED,
};
