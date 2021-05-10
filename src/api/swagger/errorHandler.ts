/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
import { isBoom } from 'boom';
import {Request,Response} from '../../types/declerations'
/**
 * Error handler class
 */
class ErrorHandler {
  private logger: any;
  /**
     * Constructor
     * @param   {Object}  logger
     */
  constructor(logger:any) {
    this.logger = logger;
  }

  /**
     * Middleware for each request
     * @param req
     * @param res
     * @param next
     */
  middleware(errorRaw:any, _req:Request, res:Response, next:Function) {
    console.log('error middleware, ', errorRaw);
    if (!errorRaw) {
      next();
      return false;
    }
    const error = this.handleBoomError(errorRaw)
            || this.handleSwaggerError(errorRaw)
            || this.handleGenericError(errorRaw)
            || this.handleUnknownError(errorRaw);

    res.status(error.statusCode).send(error.body);

    return error;
  }

  /**
     * Handle boom errors
     * @param   {Object}            error
     * @returns {Object|Boolean}
     */
  handleBoomError(error:any) {
    if (isBoom(error)) {
      // this.logger.error('[module:swagger-error-handler]: BoomError was produced', JSON.stringify(error));
      const { output: { statusCode, payload: { message } } } = error;
      const body = {
        title: message,
      };
      if (error.data) {
        // @ts-ignore
        body.details = error.data;
      }
      return {
        statusCode,
        body,
      };
    }
    return false;
  }

  /**
     * Handle swagger errors
     * @param   {Object}            error
     * @returns {Object|Boolean}
     */
  handleSwaggerError(error:any) {
    // @ts-ignore
    if (error instanceof Error && typeof error.code === 'string') {
      // this.logger.error('[module:swagger-error-handler]: native Swagger error was produced', JSON.stringify(error));
      const body = {
        title: error.message,
      };
      // @ts-ignore
      if (error.failedValidation && error.results) {
        // @ts-ignore
        body.details = error.results.errors;
      }
      return {
        statusCode: 400,
        body,
      };
    }
    return false;
  }

  /**
     * Handle generic errors (not boom and not swagger)
     * @param   {Object}            error
     * @returns {Object|Boolean}
     */
  handleGenericError(error:any) {
    if (error instanceof Error) {
      // this.logger.error('[module:swagger-error-handler]: some unexpected error happened', error);
      return {
        statusCode: 500,
        body: { title: 'An internal server error occurred' },
      };
    }

    return false;
  }

  /**
     * Handle generic errors
     * @param   {Object}            error
     * @returns {Object|Boolean}
     */
  handleUnknownError(error:any) {
    this.logger.error(`[module:swagger-error-handler]: some unexpected error happened, which is not an instance of Error class, ${error.message}`);
    return {
      statusCode: 500,
      body: { title: 'An internal server error occurred' },
    };
  }
}

export default ErrorHandler;
