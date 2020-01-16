
import request from 'request';
import URL_PREFIX from '../url';

async function requestInvitation(groupId, provider, token) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      url: `${URL_PREFIX}/invitations-requests/`,
      headers: {
        provider,
        'x-auth-token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestedGroupId: groupId,
      }),
    };

    request(options, (error, response, body) => {
      if (error || response.statusCode >= 400) {
        if (error) {
          console.error('request cb error', error);
          return reject('failed to requestInvitation', error);
        }
        const bodyObj = JSON.parse(body);
        console.error('failed to requestInvitation', bodyObj);
        return reject(bodyObj.title);
      }
      return resolve(JSON.parse(body));
    });
  });
}

export default requestInvitation;
