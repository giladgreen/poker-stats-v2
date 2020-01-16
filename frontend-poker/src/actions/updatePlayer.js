
import request from 'request';
import URL_PREFIX from '../url';

async function updatePlayer(groupId, playerId, data, provider, token) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'PATCH',
      url: `${URL_PREFIX}/groups/${groupId}/players/${playerId}`,
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
          return reject('failed to update player');
        }
        const bodyObj = JSON.parse(body);
        console.error('failed to update player');
        return reject(bodyObj.title);
      }
      return resolve(JSON.parse(body));
    });
  });
}

export default updatePlayer;
