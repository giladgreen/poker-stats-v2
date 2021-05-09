
import request from 'request';
import URL_PREFIX from '../url';

async function getGroupData(group, provider, token) {
  return new Promise((resolve, reject) => {
    const playersOptions = {
      method: 'GET',
      url: `${URL_PREFIX}/groups/${group.id}/players/`,
      headers: {
        provider,
        'x-auth-token': token,
        'Content-Type': 'application/json',
      },
    };
    const gamesOptions = {
      method: 'GET',
      url: `${URL_PREFIX}/groups/${group.id}/games/`,
      headers: {
        provider,
        'x-auth-token': token,
        'Content-Type': 'application/json',
      },
    };
    const imagesOptions = {
      method: 'GET',
      url: `${URL_PREFIX}/groups/${group.id}/images/`,
      headers: {
        provider,
        'x-auth-token': token,
        'Content-Type': 'application/json',
      },
    };
    let images;
    let players;
    let games;

    request(playersOptions, (error, response, body) => {
      if (error || response.statusCode >= 400) {
        if (error) {
          console.error('request cb error.failed to get group players', error);
          return reject('failed to get group data');
        }
        const bodyObj = JSON.parse(body);
        console.error('failed to get group players', bodyObj);
        return reject(bodyObj.title);
      }
      players = JSON.parse(body).results;
      if (players && games && images) {
        const userContextString = response.headers['x-user-context'];
        const userContext = JSON.parse(decodeURI(userContextString));
        return resolve({
          ...group, players, games, images, userContext,
        });
      }
    });
    request(gamesOptions, (error, response, body) => {
      if (error || response.statusCode >= 400) {
        if (error) {
          console.error('request cb error.failed to get group games', error);
          return reject('failed to get group data');
        }
        const bodyObj = JSON.parse(body);
        console.error('failed to get group games', bodyObj);
        return reject(bodyObj.title);
      }
      games = (JSON.parse(body).results).map(game => ({
        ...game,
        date: new Date(game.date),
      }));
      if (players && games && images) {
        const userContextString = response.headers['x-user-context'];
        const userContext = JSON.parse(decodeURI(userContextString));

        return resolve({
          ...group, players, games, images, userContext,
        });
      }
    });

    request(imagesOptions, (error, response, body) => {
      if (error || response.statusCode >= 400) {
        if (error) {
          console.error('request cb error.failed to get group images', error);
          return reject('failed to get group data');
        }
        const bodyObj = JSON.parse(body);
        console.error('failed to get group images', bodyObj);
        return reject(bodyObj.title);
      }
      images = JSON.parse(body).results;
      if (players && games && images) {
        const userContextString = response.headers['x-user-context'];
        const userContext = JSON.parse(decodeURI(userContextString));

        return resolve({
          ...group, players, games, images, userContext,
        });
      }
    });
  });
}

export default getGroupData;
