import ErrorHandler from '../swagger/errorHandler';
import logger from '../services/logger';
import { Request, Response} from '../../types/declerations';

const errorHandler = new ErrorHandler(logger);

function errorHandlerMiddleware(error:any, req: Request, res:Response, next:Function) {
  return errorHandler.middleware(error, req, res, next);
}

export default errorHandlerMiddleware;
