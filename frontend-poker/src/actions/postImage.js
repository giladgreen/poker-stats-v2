import request from 'request';
import URL_PREFIX from '../url';
import resizebase64 from 'resize-base64';

async function postImage(base64image, tags, provider, token) {

  try {
    console.log('before',base64image)
    base64image = resizebase64(base64image,600, 600);
    console.log('after',base64image)
  } catch (e) {
    console.log('error!!',e)
  }

  const { playerIds, gameIds, groupIds } = tags;
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      url: `${URL_PREFIX}/images`,
      body: JSON.stringify({
        playerIds: playerIds || [],
        gameIds: gameIds || [],
        groupIds: groupIds || [],
        image: base64image,
      }),
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
          return reject('failed to post image');
        }
        const bodyObj = JSON.parse(body);
        console.error('failed to post image');
        return reject(bodyObj.title);
      }
      return resolve(JSON.parse(body));
    });
  });
}

export default postImage;
