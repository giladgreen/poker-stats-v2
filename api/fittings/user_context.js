const moment = require('moment');
const { unauthorized } = require('boom');
const { Op } = require('sequelize');
const models = require('../models');
const googleTokenStrategy = require('../helpers/google-auth');
const facebookTokenStrategy = require('../helpers/facebook-auth');

const LEGAL_PROVIDERS = ['facebook', 'google'];

function getFitting() {
  return async function UserContext({ request, response }, next) {
    if (process.env.test) {
      request.userContext = {
        email: 'email',
        token: 'token',
      };
      return next();
    }
    try {
      const { headers } = request;
      const { provider } = headers;
      const accessToken = headers['x-auth-token'];
      if (!provider || !accessToken || !LEGAL_PROVIDERS.includes(provider)) {
        return next(unauthorized('did not pass auth tokens'));
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

      request.userContext = profile;

      // create/update user in db
      const user = await models.users.findOne({
        where: {
          email: profile.email,
        },
      });
      if (!user) {
        await models.users.create({ ...profile, tokenExpiration: moment().add(1, 'days').toDate() });
      }
      try {
        response.setHeader('x-user-context', JSON.stringify(request.userContext));
      } catch (e) {
        response.setHeader('x-user-context', JSON.stringify({ email: request.userContext.email, token: request.userContext.token }));
      }

      return next();
    } catch (error) {
      return next(unauthorized('did not pass auth tokens'));
    }
  };
}

// eslint-disable-next-line no-unused-vars
module.exports = getFitting;
