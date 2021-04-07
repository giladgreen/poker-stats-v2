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
  userPlayers.forEach(({ groupId, isAdmin, playerId }) => {
    result[groupId] = {
      isAdmin,
      playerId,
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

  if (groupId && !request.userContext.inGroup) {
    logger.info(`[validateRequestPermissions] user not belong to group. user context: ${JSON.stringify(request.userContext)} `);
    throw 'user not belong to group';
  }

  if (request.method === 'GET') {
    return;
  }
  if (request.userContext.isAdmin) {
    return;
  }
  if (request.method === 'POST' && request.url.includes('/players')) {
    return;
  }
  if (request.method === 'POST' && request.url.includes('/groups')) {
    return;
  }
  if ((request.method === 'POST' || request.method === 'DELETE') && request.url.includes('/images')) {
    return;
  }
  if (request.method === 'GET' && request.url.includes('/groups/') && request.url.includes('/images')) {
    return;
  }
  if (request.url.includes('/invitations-requests')) {
    return;
  }
  if (request.url.includes('/games')) {
    return;
  }

  logger.info(`[validateRequestPermissions] bad credentials user context: ${JSON.stringify(request.userContext)} `);
  throw 'operation not allowed';
}

function getProfile(provider, accessToken) {
  logger.info(`[UserContext:fitting] getProfile, provider:${provider}.`);

  return (provider === 'google'
    ? googleTokenStrategy.authenticate(accessToken)
    : facebookTokenStrategy.authenticate(accessToken));
}
function getHtmlBody(user, provider, newUser = true) {
  return `
  <div>
        <h1>${newUser ? 'new' : ''} user has logged in.</h1>
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
          <img style="max-width:150px;" src="${user.imageUrl}"/>
            </div>
      </div>
    </div>
  `;
}
const cache = {};
function shouldSendMail(user) {
  if (user && user.email === EMAIL_USER) {
    return false;
  }

  if (cache[user.id]) {
    return false;
  }
  cache[user.id] = true;
  setTimeout(() => {
    cache[user.id] = false;
  }, 1000 * 60 * 60);
  return true;
}
function getFitting() {
  return async function UserContext({ request, response }, next) {
    try {
      if (request.method === 'OPTIONS' || request.url.includes('approved=') || request.url.includes('well-known') || request.url.includes('keep-alive')) {
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
      let existingUser;
      try {
        existingUser = await models.users.findOne({
          where: {
            token: accessToken,
            tokenExpiration: {
              [Op.gte]: new Date(),
            },
          },
        });
      } catch (e) {
        logger.info('[UserContext:fitting] ERROR ');
        logger.info(e.message);
        logger.info(e);
        throw e;
      }

      if (existingUser) {
        const userContext = existingUser.toJSON();
        request.userContext = userContext;
        //logger.info(`[UserContext:fitting] user exist, and is using token saved in db: ${userContext.firstName} ${userContext.familyName} (${userContext.email})`);
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

        user = await models.users.create({ ...profile, tokenExpiration: moment().add(1, 'days').toDate(), token: accessToken });
        sendHtmlMail(`new user: ${user.firstName} ${user.familyName}, has logged in`, getHtmlBody(user, provider), EMAIL_USER);
      } else {
        logger.info(`[UserContext:fitting] user already in db: ${profile.firstName} ${profile.familyName}. (${profile.email})`);

        if (shouldSendMail(user)) {
          sendHtmlMail(`${user.firstName} ${user.familyName} has logged in`, getHtmlBody(user, provider, false), EMAIL_USER);
        }

        const [, results] = await models.users.update({ ...profile, tokenExpiration: moment().add(3, 'hours').toDate(), token: accessToken }, { where: { id: user.id }, returning: true });
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
      return next(unauthorized('failed to login'));
    }
  };
}

// eslint-disable-next-line no-unused-vars
module.exports = getFitting;
