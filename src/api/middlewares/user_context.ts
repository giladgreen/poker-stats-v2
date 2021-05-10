import moment from 'moment';
import { unauthorized } from 'boom';
import { Op } from 'sequelize';
import Models from '../models';
import sendHtmlMail from '../services/emails';
import logger from '../services/logger';
import googleTokenStrategy from '../helpers/google-auth';
import facebookTokenStrategy from '../helpers/facebook-auth';
import {UserContext, Request, Response} from "../../types/declerations";

const { EMAIL_USER } = process.env;
const LEGAL_PROVIDERS = ['facebook', 'google'];
const cache = {};

async function getGroups(userContext:UserContext) {
  // @ts-ignore
  const userPlayers = await Models.usersPlayers.findAll({
    where: {
      userId: userContext.id,
    },
  });

  const result = {};
  // @ts-ignore
  userPlayers.forEach(({ groupId, isAdmin, playerId }) => {
    // @ts-ignore
    result[groupId] = {
      isAdmin,
      playerId,
    };
  });

  return result;
}

async function validateRequestPermissions(request: Request) {

  const groupId: string = <string>request.params.groupId;
  // @ts-ignore
  request.userContext.groups = await getGroups(request.userContext);
  // @ts-ignore
  request.userContext.inGroup = groupId && request.userContext.groups[groupId];
  // @ts-ignore
  request.userContext.isAdmin = groupId && request.userContext.groups[groupId] && request.userContext.groups[groupId].isAdmin;
  // @ts-ignore
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
  if (request.url.includes('/notifications') && (request.method === 'POST' || request.method === 'DELETE')) {
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

function getProfile(provider:string, accessToken:string) {
  logger.info(`[UserContext:fitting] getProfile, provider:${provider}.`);

  return (provider === 'google'
    ? googleTokenStrategy.authenticate(accessToken)
    : facebookTokenStrategy.authenticate(accessToken));
}

function getHtmlBody(user:any, provider:string, newUser = true) {
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

function shouldSendMail(user:any) {
  if (user && user.email === EMAIL_USER) {
    return false;
  }
// @ts-ignore
  if (cache[user.id]) {
    return false;
  }
  // @ts-ignore
  cache[user.id] = true;
  setTimeout(() => {
    // @ts-ignore
    cache[user.id] = false;
  }, 1000 * 60 * 60);
  return true;
}

async function userContextMiddlewares(request: Request, response:Response, next:Function) {
  try {
    if (request.method === 'OPTIONS' || request.url.includes('approved=') || request.url.includes('well-known') || request.url.includes('keep-alive')) {
      return next();
    }

    const { headers } = request;
    const provider = <string>headers.provider;
    const accessToken = <string>headers['x-auth-token'];
    if (!provider || !accessToken) {
      throw 'missing token headers';
    }
    // @ts-ignore
    if (!LEGAL_PROVIDERS.includes(provider)) {
      throw `unknown provider: ${provider}`;
    }
    let existingUser;
    try {
      // @ts-ignore
      existingUser = await Models.users.findOne({
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
      // logger.info(`[UserContext:fitting] user exist, and is using token saved in db: ${userContext.firstName} ${userContext.familyName} (${userContext.email})`);
      await validateRequestPermissions(request);
// @ts-ignore
      await Models.users.update({
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
    // @ts-ignore
    logger.info(`[UserContext:fitting] user request by: ${profile.firstName} ${profile.familyName}. (${profile.email})`);

    // create/update user in db
    // @ts-ignore
    let user = await Models.users.findOne({
      where: {
        // @ts-ignore
        email: profile.email,
      },
    });

    if (!user) {
      // @ts-ignore
      logger.info(`[UserContext:fitting] creating new user: ${profile.firstName} ${profile.familyName}. (${profile.email})`);
      // @ts-ignore
      user = await Models.users.create({ ...profile, tokenExpiration: moment().add(1, 'days').toDate(), token: accessToken });
      // @ts-ignore
      sendHtmlMail(`new user: ${user.firstName} ${user.familyName}, has logged in`, getHtmlBody(user, provider), EMAIL_USER);
    } else {
      // @ts-ignore
      logger.info(`[UserContext:fitting] user already in db: ${profile.firstName} ${profile.familyName}. (${profile.email})`);

      if (shouldSendMail(user)) {
        // @ts-ignore
        sendHtmlMail(`${user.firstName} ${user.familyName} has logged in`, getHtmlBody(user, provider, false), EMAIL_USER);
      }
      // @ts-ignore
      const [, results] = await Models.users.update({ ...profile, tokenExpiration: moment().add(3, 'hours').toDate(), token: accessToken }, { where: { id: user.id }, returning: true });
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
}

export default userContextMiddlewares;
