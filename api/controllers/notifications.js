const notificationsRoutes = require('express').Router({ mergeParams: true });
const notificationsService = require('../services/notifications');


function registerNotifications(req, res, next) {
  const { userContext } = req;
  const subscription = req.body;
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

notificationsRoutes.post('/notifications', registerNotifications);
notificationsRoutes.delete('/notifications', unregisterNotifications);

module.exports = {
  registerNotifications,
  unregisterNotifications,
  notificationsRoutes,
};
