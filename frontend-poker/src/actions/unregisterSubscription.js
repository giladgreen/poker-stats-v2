
import request from 'request';
import URL_PREFIX from '../url';

async function unregisterSubscription(data, provider, token) {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${URL_PREFIX}/notifications`,
      method: 'DELETE',
      headers: {
        provider,
        'x-auth-token': token,
        'Content-Type': 'application/json',
      },
    };
    console.log('unregisterSubscription', options.method, options.url, options.body);

    request(options, (error, response, body) => {
      if (error || response.statusCode >= 400) {
        if (error) {
          console.error('request cb error', error);
          return reject('failed to unregisterSubscription , server might be down');
        }
        const bodyObj = JSON.parse(body);
        console.error('request cb error body', bodyObj);
        return reject(bodyObj.title);
      }

      if (response && response.headers && response.headers['x-user-context']) {
        const userContextString = response.headers['x-user-context'];
        const userContext = JSON.parse(decodeURI(userContextString));
        const data = JSON.parse(body);
        console.log('got data:', data);
        return resolve({
          data, userContext, provider, token,
        });
      }
      console.error('request cb no header');

      return reject('server response is missing the user context');
    });
  });
}

export default unregisterSubscription;
