import uuid from 'uuid';
import {Request, Response} from "../../types/declerations";

function transactionIdMiddlewares(request: Request, response:Response, next:Function) {
  try {
    // @ts-ignore
    request.tid = uuid();
    // @ts-ignore
    response.setHeader('Transaction-ID', request.tid);
    next();
  } catch (error) {
    next(error);
  }
}

export default transactionIdMiddlewares;
