import { RequestHandler } from 'express';

import logger from '../service/log';

const slientAPIs = ['/auth/signin'];

/**
 * This router wrapper catches any error from async await
 * and throws it to the default express error handler,
 * instead of crashing the app
 *
 * @param handler Request handler to check for error
 */
export const handleError =
  (handler: RequestHandler): RequestHandler =>
  async (req, res, next) => {
    // @ts-ignore
    handler(req, res, next).catch((err: Error) => {
      const { method, originalUrl, body, params, query, user } = req;
      if (!slientAPIs.includes(originalUrl)) {
        let userToLog = {};
        if (user) {
          const { id, email } = user;
          userToLog = { id, email };
        }
        logger.error(
          `${method} ${originalUrl} \nUser: %o\nParams: %o\nQuery: %o\nBody: %o\n${err}`,
          { ...userToLog },
          { ...params },
          { ...query },
          { ...body },
        );
      }
      next(err);
    });
  };
