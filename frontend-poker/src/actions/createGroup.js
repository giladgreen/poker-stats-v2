
import request from 'request';
import URL_PREFIX from '../url';

async function createGroup(name, provider, token) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      url: `${URL_PREFIX}/groups/`,
      body: JSON.stringify({ name }),
      headers: {
        provider,
        'x-auth-token': token,
        'Content-Type': 'application/json',
      },
    };

    request(options, (error, response, body) => {
      if (error || response.statusCode >= 400) {
        if (error) {
          console.error('request cb error', error);
          return reject('failed to create new group');
        }
        const bodyObj = JSON.parse(body);
        console.error('failed to create new group');
        return reject(bodyObj.title);
      }
      return resolve(JSON.parse(body));
    });
  });
}

export default createGroup;
