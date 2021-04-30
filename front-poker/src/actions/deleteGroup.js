
import request from 'request';
import URL_PREFIX from '../url';

async function deleteGroup(groupId, provider, token) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'DELETE',
      url: `${URL_PREFIX}/groups/${groupId}`,
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
          return reject('failed to delete group');
        }
        const bodyObj = JSON.parse(body);
        console.error('failed to delete group');
        return reject(bodyObj.title);
      }
      return resolve();
    });
  });
}

export default deleteGroup;
