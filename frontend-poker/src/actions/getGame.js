
import request from 'request';
import URL_PREFIX from '../url';

async function getGame(groupId, gameId, provider, token) {
  console.log('getGame ' )
  console.trace()
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: `${URL_PREFIX}/groups/${groupId}/games/${gameId}`,
      headers: {
        provider,
        'x-auth-token': token,
        'Content-Type': 'application/json',
      },
    };
    console.log('getting gamer data')
    request(options, (error, response, body) => {
      if (error || response.statusCode >= 400) {
        if (error) {
          console.error('request cb error.failed to get game data', error);
          return reject('failed to get game data');
        }
        const bodyObj = JSON.parse(body);
        console.error('failed to get game data', bodyObj);
        return reject(bodyObj.title);
      }
      const game = JSON.parse(body);
      return resolve(game);
    });
  });
}

export default getGame;
