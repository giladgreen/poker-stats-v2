
import request from 'request';
import URL_PREFIX from '../url';

async function updateGroup(groupId, data, provider, token) {
  console.log('updateGroup', groupId, data, provider, token);
  return new Promise((resolve, reject) => {
    const options = {
      method: 'PATCH',
      url: `${URL_PREFIX}/groups/${groupId}`,
      body: JSON.stringify(data),
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
          return reject('failed to update group');
        }
        const bodyObj = JSON.parse(body);
        console.error('failed to update group');
        return reject(bodyObj.title);
      }
      return resolve(JSON.parse(body));
    });
  });
}

export default updateGroup;
