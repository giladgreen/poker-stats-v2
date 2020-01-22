const notificationsService = require('../services/notifications');

function registerNotifications(req, res, next) {
  const { userContext } = req;
  const subscription = req.getBody();
  notificationsService.registerNotifications(userContext, JSON.stringify(subscription)).then(() => {
    res.status(201).json({});
  }).catch(next);
}

function unregisterNotifications(req, res, next) {
  const { userContext } = req;
  notificationsService.unregisterNotifications(userContext).then(() => {
    res.status(204).json({});
  }).catch(next);
}

module.exports = {
  registerNotifications,
  unregisterNotifications,
};
