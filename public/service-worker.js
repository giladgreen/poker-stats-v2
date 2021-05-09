
let eventLink = null;
function getLink() {
  return eventLink;
}
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const { title, link, text } = data;
  eventLink = link;
  const options = {
    body: text,
    icon: 'https://www.poker-stats.com/favicon.png',
    badge: 'https://www.poker-stats.com/favicon.png',
  };

  const notificationPromise = self.registration.showNotification(title, options);
  event.waitUntil(notificationPromise);
});


self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow(getLink()),
  );
});
