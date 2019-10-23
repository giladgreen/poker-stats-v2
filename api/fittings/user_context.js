const moment = require('moment');
const { unauthorized, forbidden } = require('boom');

const { Op } = require('sequelize');
const models = require('../models');
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
  userPlayers.forEach(({ groupId, isAdmin }) => {
    result[groupId] = {
      isAdmin,
    };
  });
  return result;
}

async function validateRequestPermissions(request) {
  const { groupId: groupIdObject } = request.swagger.params;
  const groupId = groupIdObject ? groupIdObject.value : null;

  request.userContext.groups = await getGroups(request.userContext);
  request.userContext.inGroup = groupId && request.userContext.groups[groupId];
  request.userContext.isAdmin = groupId && request.userContext.groups[groupId] && request.userContext.groups[groupId].isAdmin;

  if (groupId) {
    logger.info(`[validateRequestPermissions] groupId: ${groupId}   request.method: ${request.method}`);
    if (!request.userContext.inGroup) {
      logger.info(`[validateRequestPermissions] user context: ${JSON.stringify(request.userContext)} `);
      throw forbidden('user not belong to group', { groupId });
    } else if (request.method !== 'GET' && !request.userContext.isAdmin) {
      throw forbidden('user not admin of group', { groupId });
    }
  }
}
function getFitting() {
  return async function UserContext({ request, response }, next) {
    try {
      if (request.method === 'OPTIONS') {
        logger.info('[UserContext:fitting] OPTIONS request.');
        return next();
      }
      const { headers } = request;
      const { provider } = headers;
      const accessToken = headers['x-auth-token'];
      logger.info(`[UserContext:fitting] provider:${provider} `);
      logger.info(`[UserContext:fitting] accessToken:${accessToken} `);
      if (!provider || !accessToken || !LEGAL_PROVIDERS.includes(provider)) {
        return next(unauthorized('missing token headers'));
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
        request.userContext = existingUser.toJSON();
        logger.info(`[UserContext:fitting] user exist: ${JSON.stringify(request.userContext)} `);
        await validateRequestPermissions(request);

        await models.users.update({
          tokenExpiration: moment().add(1, 'days').toDate(),
        },
        {
          where: {
            id: existingUser.id,
          },
        });
        response.setHeader('x-user-context', JSON.stringify(request.userContext));
        return next();
      }

      const profile = await (provider === 'google'
        ? googleTokenStrategy.authenticate(accessToken)
        : facebookTokenStrategy.authenticate(accessToken));


      // create/update user in db
      let user = await models.users.findOne({
        where: {
          email: profile.email,
        },
      });
      if (!user) {
        user = await models.users.create({ ...profile, tokenExpiration: moment().add(1, 'days').toDate() });
      }
      request.userContext = user.toJSON();
      await validateRequestPermissions(request);

      try {
        response.setHeader('x-user-context', JSON.stringify(request.userContext));
      } catch (e) {
        response.setHeader('x-user-context', JSON.stringify({ email: request.userContext.email, token: request.userContext.token }));
      }

      return next();
    } catch (error) {
      logger.error(`[UserContext:fitting] error: ${JSON.stringify(error)} `);

      return next(unauthorized('did not pass auth tokens'));
    }
  };
}

// eslint-disable-next-line no-unused-vars
module.exports = getFitting;
