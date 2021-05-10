import webpush from 'web-push';
import logger from '../services/logger';
import Models from '../models';
import { UserContext } from '../../types/declerations';

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

try {
  webpush.setVapidDetails('https://www.poker-stats.com', publicVapidKey, privateVapidKey);
} catch (e) {
  logger.error('error in setVapidDetails', { error: e.message });
}

function registerNotifications(userContext: UserContext, subscription: string) {
  // @ts-ignore
  return Models.users.update({ subscription }, {
    where: {
      id: userContext.id,
    },
  });
}

function unregisterNotifications(userContext: UserContext) {
  // @ts-ignore
  return Models.users.update({ subscription: null }, {
    where: {
      id: userContext.id,
    },
  });
}

async function sendNotification(userId: string, title: string, link: string, text: string) {
  try {
    logger.info('sendNotification', userId, title, link, text);
    // @ts-ignore
    const user = await Models.users.findOne({
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
    }).catch((error: Error) => {
      logger.error(error.message);
      logger.error(error.stack);
    });
  } catch (e) {
    logger.error('error sending notification.', e);
  }
}

const notifications =  {
  registerNotifications,
  unregisterNotifications,
  sendNotification,
};

export default notifications;

