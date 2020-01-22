'use strict';
let eventLink = null;
function getLink(){
    return eventLink;
}
self.addEventListener('push', function(event) {
    const data = event.data.json();
    const { title, link, text } = data;
    eventLink = link;
    const options = {
        body: text,
        icon: 'https://im-in.herokuapp.com/imin.png',
        badge: 'https://im-in.herokuapp.com/imin.png',
    };

    const notificationPromise = self.registration.showNotification(title, options);
    event.waitUntil(notificationPromise);


});


self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received.');

    event.notification.close();

    event.waitUntil(
        clients.openWindow(getLink())
    );
});
