import registerSubscription from './actions/registerSubscription';
import unregisterSubscription from './actions/unregisterSubscription';

const applicationServerPublicKey = 'BIzamkxmxtu3jgxzUVL3Pg7AKbbxv2y8dLPPePT6fxXVI9Nl4wBJJpGeTAEofw0etXweRs8COyNrRJ5Aw2lhmXg';
let isSubscribed = false;
let swRegistration = null;
let pushSupported = true;
function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

let subscription = localStorage.getItem('subscription');
if (subscription) {
  subscription = JSON.parse(subscription);
  isSubscribed = true;
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push is supported');

  navigator.serviceWorker.register('serviceWorker.js')
    .then((swReg) => {
      console.log('Service Worker is registered', swReg);

      swRegistration = swReg;
    })
    .catch((error) => {
      console.error('Service Worker Error', error);
      pushSupported = false;
    });
} else {
  console.warn('Push messaging is not supported');
  pushSupported = false;
}
async function updateSubscriptionOnServer(subscription, provider, token) {
  await registerSubscription(subscription, provider, token);
  localStorage.setItem('subscription', JSON.stringify(subscription));
}

async function updateUnsubscriptionOnServer(subscription, provider, token) {
  await unregisterSubscription(subscription, provider, token);
  localStorage.removeItem('subscription');
}

function subscribeUser(provider, token) {
  if (isSubscribed) {
    return;
  }
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  return swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  })
    .then((subscription) => {
      console.log('User is subscribed.');

      updateSubscriptionOnServer(subscription, provider, token);
      console.log('user is subscribed to push notifications');
      isSubscribed = true;
    });
}

function unsubscribeUser(provider, token) {
  console.log('unsubscribeUser');
  localStorage.removeItem('subscription');
  if (!isSubscribed) {
    return;
  }
  return swRegistration.pushManager.getSubscription()
    .then((subscription) => {
      if (subscription) {
        updateUnsubscriptionOnServer(subscription, provider, token);
        return subscription.unsubscribe();
      }
    });
}

function IsSubscribed() {
  console.log('IsSubscribed()', isSubscribed);
  return isSubscribed;
}
function IsPushSupported() {
  return pushSupported;
}
export default {
  IsSubscribed,
  IsPushSupported,
  subscribeUser,
  unsubscribeUser,
};
