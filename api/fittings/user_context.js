const moment = require('moment');
const { unauthorized } = require('boom');

const { EMAIL_USER } = process.env;
const { Op } = require('sequelize');
const models = require('../models');
const { sendHtmlMail } = require('../services/emails');
const logger = require('../services/logger');
const googleTokenStrategy = require('../helpers/google-auth');
const facebookTokenStrategy = require('../helpers/facebook-auth');

const LEGAL_PROVIDERS = ['facebook', 'google'];

async function getGroups(userContext) {
  const userPlayers = await models.usersPlayers.findAll({
    where: {
      userId: userContext.id,
    },
  });

  const result = {};
  userPlayers.forEach(({ groupId, isAdmin,playerId }) => {
    result[groupId] = {
      isAdmin,
      playerId
    };
  });
  return result;
}

async function validateRequestPermissions(request) {
  const { groupId } = request.getAllParams();
  request.userContext.groups = await getGroups(request.userContext);
  request.userContext.inGroup = groupId && request.userContext.groups[groupId];
  request.userContext.isAdmin = groupId && request.userContext.groups[groupId] && request.userContext.groups[groupId].isAdmin;
  request.userContext.playerId = groupId && request.userContext.groups[groupId] && request.userContext.groups[groupId].playerId;

  if (groupId) {
    logger.info(`[validateRequestPermissions] groupId: ${groupId}   request.method: ${request.method}`);
    if (!request.userContext.inGroup) {
      logger.info(`[validateRequestPermissions] user not belong to group. user context: ${JSON.stringify(request.userContext)} `);
      throw 'user not belong to group';
    } else if (request.method !== 'GET' && !request.userContext.isAdmin) {
      if (!request.url.includes('/games/')) {
        throw 'user not admin of group';
      }
    }
  }
}
function getProfile(provider, accessToken) {
  logger.info(`[UserContext:fitting] getProfile, provider:${provider}.`);

  return (provider === 'google'
    ? googleTokenStrategy.authenticate(accessToken)
    : facebookTokenStrategy.authenticate(accessToken));
}
function getHtmlBody(user, provider) {
  return `
  <div>
        <h1>new user has logged in.</h1>
      <div>
          provider: ${provider}
      </div>
       <div>
          user name: ${user.firstName} ${user.familyName}
      </div>
      <div>
          user email: ${user.email} 
      </div>
      <div>
          <div>
          user image: ${user.imageUrl} 
            </div>
            <div>
          <img src="${user.imageUrl}"/>
            </div>
      </div>
    </div>
  `;
}
function getFitting() {
  return async function UserContext({ request, response }, next) {
    try {
      logger.info(`[UserContext:fitting] ${request.method} request.`);

      if (request.method === 'OPTIONS' || request.url.includes('approved=') || request.url.includes('well-known')) {
        return next();
      }

      const { headers } = request;
      const { provider } = headers;
      const accessToken = headers['x-auth-token'];
      if (!provider || !accessToken) {
        throw 'missing token headers';
      }
      if (!LEGAL_PROVIDERS.includes(provider)) {
        throw `unknown provider: ${provider}`;
      }
      const existingUser = await models.users.findOne({
        where: {
          token: accessToken,
          tokenExpiration: {
            [Op.gte]: new Date(),
          },
        },
      });

      if (existingUser) {
        const userContext = existingUser.toJSON();
        request.userContext = userContext;
        logger.info(`[UserContext:fitting] user exist, and is using token saved in db: ${userContext.firstName} ${userContext.familyName} (${userContext.email})`);
        await validateRequestPermissions(request);

        await models.users.update({
          tokenExpiration: moment().add(1, 'days').toDate(),
        },
        {
          where: {
            id: existingUser.id,
          },
        });
        response.setHeader('x-user-context', encodeURI(JSON.stringify(userContext)));
        return next();
      }

      const profile = await getProfile(provider, accessToken);
      logger.info(`[UserContext:fitting] user request by: ${profile.firstName} ${profile.familyName}. (${profile.email})`);

      // create/update user in db
      let user = await models.users.findOne({
        where: {
          email: profile.email,
        },
      });

      if (!user) {
        logger.info(`[UserContext:fitting] creating new user: ${profile.firstName} ${profile.familyName}. (${profile.email})`);

        user = await models.users.create({ ...profile, tokenExpiration: moment().add(1, 'days').toDate() });
        sendHtmlMail('A new user has logged in', getHtmlBody(user, provider), EMAIL_USER);
      } else {
        logger.info(`[UserContext:fitting] user already in db: ${profile.firstName} ${profile.familyName}. (${profile.email})`);

        const [, results] = await models.users.update({ ...profile }, { where: { id: user.id }, returning: true });
        user = results[0];
      }

      request.userContext = user.toJSON();

      await validateRequestPermissions(request);

      try {
        response.setHeader('x-user-context', encodeURI(JSON.stringify(request.userContext)));
      } catch (e) {
        response.setHeader('x-user-context', encodeURI(JSON.stringify({ email: request.userContext.email, token: request.userContext.token })));
      }

      return next();
    } catch (error) {
      if (typeof error === 'string') {
        logger.error(`[UserContext:fitting] error: ${error} `);

        return next(unauthorized(error));
      }

      logger.error(`[UserContext:fitting] error: ${JSON.stringify(error)} `);
      return next(unauthorized('failed to create user context'));
    }
  };
}

// eslint-disable-next-line no-unused-vars
module.exports = getFitting;
