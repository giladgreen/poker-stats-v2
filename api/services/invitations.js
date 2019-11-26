const { notFound } = require('boom');
const models = require('../models');
const logger = require('./logger');
const { sendHtmlMail } = require('./emails');
const { URL_PREFIX } = require('./../../config.js');

const INVITATION_REQUESTED = 'invitation requested';
const INVITATION_APPROVED = 'invitation approved';
const INVITATION_REJECTED = 'invitation rejected';

const pokerStatsUrlPrefix = URL_PREFIX;

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
    status: INVITATION_REQUESTED,
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
    name: player.name,
    email: player.email,
  }));
}

function getRejectLinkAddress(invitationRequestId) {
  return `${pokerStatsUrlPrefix}/invitations-requests/${invitationRequestId}?approved=false`;
}

function getLinkAddress(invitationRequestId, playerId, approved, setAsAdmin) {
  return `${pokerStatsUrlPrefix}/invitations-requests/${invitationRequestId}?invitationRequestPlayerId=${playerId}&approved=${approved}&setAsAdmin=${setAsAdmin}`;
}

function createHtml(invitationRequestId, groupId, groupName, userDetails, userName, adminName, players) {
  const rejectAddress = getRejectLinkAddress(invitationRequestId);
  const playersLinks = players.map((player) => {
    const nonAdminApproveAddress = getLinkAddress(invitationRequestId, player.id, true, false);
    const adminApproveAddress = getLinkAddress(invitationRequestId, player.id, true, true);
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

async function sendEmail(invitationRequestId, groupId, groupName, userDetails, admins, players) {
  const userName = `${userDetails.firstName} ${userDetails.familyName}`;
  const subject = `user [${userName}] has requested to join group [${groupName}]`;

  admins.forEach((admin) => {
    const html = createHtml(invitationRequestId, groupId, groupName, userDetails, userName, admin.name, players);
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

function getExistingInvitationRequestById(invitationRequestId) {
  return models.invitationsRequests.findOne({
    where: {
      id: invitationRequestId,
    },
  });
}

function updateInvitationRequest(invitationRequestId, status) {
  return models.invitationsRequests.update({ status }, {
    where: {
      id: invitationRequestId,
    },
  });
}

/* istanbul ignore next */
async function handleUserAlreadyInGroup(existingUserPlayer, setAsAdmin, invitationRequestPlayerId) {
  if (existingUserPlayer.isAdmin !== setAsAdmin || existingUserPlayer.playerId !== invitationRequestPlayerId) {
    logger.info('[Invitation-service] answerInvitationRequest. updating user in group (either isAdmin or different player)');
    await models.usersPlayers.update({ isAdmin: setAsAdmin, playerId: invitationRequestPlayerId }, {
      where: {
        id: existingUserPlayer.id,
      },
    });
  } else {
    logger.info('[Invitation-service] answerInvitationRequest. no need to change anything.');
  }
}

async function createUserPlayer(setAsAdmin, invitationRequestPlayerId, groupId, userId) {
  await models.usersPlayers.create({
    isAdmin: setAsAdmin,
    playerId: invitationRequestPlayerId,
    groupId,
    userId,
  });

  const { imageUrl, email } = await models.users.findOne({ where: { id: userId } });
  return models.players.update({ imageUrl, email }, {
    where: {
      id: invitationRequestPlayerId,
    },
  });
}

async function sendUserUpdateEmail(userId, groupName, approved) {
  const userDetails = await getUser(userId);
  const subject = `your request to join group "${groupName}"`;
  const html = `<!doctype html>
                <html lang="en">
                  <head>
                    <meta charset="utf-8">
                  </head>
                  <body>
                    <div>
                        Hey ${userDetails.firstName},<br/><br/><br/><br/>
                        
                        Your request to join group "${groupName}" has been ${approved ? 'approved' : 'rejected'}.<br/><br/><br/><br/><br/><br/>
                        
                        ${approved ? 'if you log in now you should see this group data..' : ''}
                  
                    </div>
                    
                  </body>
                </html>`;
  sendHtmlMail(subject, html, userDetails.email);
}

async function answerInvitationRequest(invitationRequestId, invitationRequestPlayerId, approved, setAsAdmin) {
  logger.info(`[Invitation-service] answerInvitationRequest. ${JSON.stringify({
    invitationRequestId, invitationRequestPlayerId, approved, setAsAdmin,
  })}`);

  const invitationRequest = await getExistingInvitationRequestById(invitationRequestId);
  /* istanbul ignore next */
  if (!invitationRequest) {
    logger.error(`[Invitation-service] answerInvitationRequest. did not found invitationRequest in DB. ${invitationRequestId}`);
    return `did not found invitationRequest in DB (${invitationRequestId})`;
  }
  /* istanbul ignore next */
  if (invitationRequest.status !== INVITATION_REQUESTED) {
    logger.info(`[Invitation-service] answerInvitationRequest. invitation already ${invitationRequest.status.replace('invitation ', '')}`);
    return `invitation already ${invitationRequest.status.replace('invitation ', '')}`;
  }
  const { groupId, userId } = invitationRequest;
  const { name: groupName } = await validateGroup(groupId);
  /* istanbul ignore next */
  if (!approved) {
    logger.info('[Invitation-service] answerInvitationRequest. invitation was rejected.');
    await updateInvitationRequest(invitationRequestId, INVITATION_REJECTED);
    await sendUserUpdateEmail(userId, groupName, false);
    return INVITATION_REJECTED;
  }

  const existingUserPlayer = await getUserPlayer(groupId, userId);
  /* istanbul ignore next */
  if (existingUserPlayer) {
    logger.info('[Invitation-service] answerInvitationRequest. user already in group...');
    await handleUserAlreadyInGroup(existingUserPlayer, setAsAdmin, invitationRequestPlayerId);
  } else {
    logger.info('[Invitation-service] answerInvitationRequest. user not in group. - adding it');

    await createUserPlayer(setAsAdmin, invitationRequestPlayerId, groupId, userId);
  }
  await updateInvitationRequest(invitationRequestId, INVITATION_APPROVED);
  await sendUserUpdateEmail(userId, groupName, true);

  return INVITATION_APPROVED;
}


module.exports = {
  createInvitationRequest,
  answerInvitationRequest,
  INVITATION_REQUESTED,
};
