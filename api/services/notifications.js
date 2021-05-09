const webpush = require('web-push');
const logger = require('../services/logger');
const models = require('../models');

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
try {
  webpush.setVapidDetails('https://www.poker-stats.com', publicVapidKey, privateVapidKey);
} catch (e) {
  logger.error('error in setVapidDetails', { error: e.message });
}

function registerNotifications(userContext, subscription) {
  return models.users.update({ subscription }, {
    where: {
      id: userContext.id,
    },
  });
}

function unregisterNotifications(userContext) {
  return models.users.update({ subscription: null }, {
    where: {
      id: userContext.id,
    },
  });
}

async function sendNotification(userId, title, link, text) {
  try {
    logger.info('sendNotification', userId, title, link, text);
    const user = await models.users.findOne({
      where: {
        id: userId,
      },
    });
    if (!user || !user.subscription) {
      logger.info('user is not registered to notifications..', userId);
      return;
    }

    const payload = JSON.stringify({ title, link, text });
    const subscription = JSON.parse(user.subscription);

    await webpush.sendNotification(subscription, payload).then(() => {
      logger.info('notification was sent');
    }).catch((error) => {
      logger.error(error.message);
      logger.error(error.stack);
    });
  } catch (e) {
    logger.error('error sending notification.', e);
  }
}

module.exports = {
  registerNotifications,
  unregisterNotifications,
  sendNotification,
};
