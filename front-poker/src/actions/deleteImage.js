/* eslint-disable no-console */
/* eslint-disable prefer-promise-reject-errors */
import request from 'request';
import URL_PREFIX from '../url';

async function deleteImage(imageId, provider, token) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'DELETE',
      url: `${URL_PREFIX}/images/${imageId}`,
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
          return reject('failed to delete image');
        }
        const bodyObj = JSON.parse(body);
        console.error('failed to delete image');
        return reject(bodyObj.title);
      }
      return resolve(true);
    });
  });
}

export default deleteImage;
