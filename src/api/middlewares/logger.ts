import log from '../services/logger';
import {Request, Response} from "../../types/declerations";

function loggerMiddlewares(request: Request, response:Response, next:Function) {
  const startTime = new Date();
  const imageCall = request.url.indexOf('player-stack-image') >= 0 && request.method.toLowerCase() === 'post';
  if (!imageCall) {
    log.debug('[fitting:logger]: incoming request', {
      method: request.method,
      url: request.url,
    });
  }

  response.on('finish', () => {
    if (!imageCall || response.statusCode > 200) {
      const endTime = new Date();
      // @ts-ignore
      log.debug('[fitting:logger]: outgoing response', { nl: '', method: request.method, url: request.url, status: response.statusCode, duration: endTime - startTime });
    }
  });
  next();
}


export default loggerMiddlewares;
