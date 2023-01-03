import { PathParams } from 'express-serve-static-core';
import { Router, RequestHandler } from 'express';

import logger from '../service/log';

const router = Router();

export type Method = 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

export const all = route('all');
export const get = route('get');
export const post = route('post');
export const put = route('put');
export const del = route('delete');
export const patch = route('patch');
export const options = route('options');
export const head = route('head');

function route(method: Method) {
  return (path: PathParams, ...handlers: RequestHandler[]) => {
    return router[method](
      path,
      handlers.map(
        (handler): RequestHandler =>
          async (req, res, next) => {
            // FIXME: Multer middleware having problem - Cannot read property 'catch' of undefined
            try {
              // @ts-ignore
              handler(req, res, next).catch((err: Error) => {
                const { method, originalUrl, body, params, query } = req;
                // TODO: Remove and scrub password
                logger.error(
                  `${err}\n${err.stack}\n${method} ${originalUrl}\nParams: %o\nQuery: %o\nBody: %o`,
                  { ...params },
                  { ...query },
                  { ...body },
                );
                next(err);
              });
            } catch (error) {
              logger.error(error);
            }
          },
      ),
    );
  };
}
