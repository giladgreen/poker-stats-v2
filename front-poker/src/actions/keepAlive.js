import request from 'request';
import URL_PREFIX from '../url';

async function keepAlive() {
  console.log('keep server Alive ');
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: `${URL_PREFIX}/keep-alive`,
    };
    request(options, (error, response, body) => {
      const answer = JSON.parse(body);
      return resolve(answer);
    });
  });
}

export default keepAlive;
