/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import request from 'request';
import URL_PREFIX from '../url';

async function generalRequest(data) {
  return new Promise((resolve, reject) => {
    const headers = {};
    data.headers.forEach((header) => {
      if (!header.includes(':')) {
        return;
      }
      const [key, val] = header.split(':');
      headers[key.trim()] = val.trim();
    });
    const options = {
      method: data.method,
      url: data.url,
      headers,
    };
    if (data.body) {
      options.body = JSON.stringify(data.body);
    }
    request(options, (error, response, body) => {
      let bodyObj;
      try {
        bodyObj = JSON.parse(body);
      } catch (e) {
        console.log('e', e);
      }
      return resolve({
        statusCode: response.statusCode,
        body,
        headers: response.headers,
        bodyObj,
        error,
      });
    });
  });
}

export default generalRequest;
