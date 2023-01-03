import RateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

import { RedisService } from '../service/redis';
import { TooManyRequest } from '../error';
import config from '../config';

const openAPIsOptions: RateLimit.Options = {
  max: config.OPEN_API_MAX_REQUEST,
  windowMs: config.OPEN_API_WINDOW_IN_MS,
  handler: (req, res, next) => next(new TooManyRequest()),
};

const closedAPIsOption: RateLimit.Options = {
  max: config.CLOSED_API_MAX_REQUEST,
  windowMs: config.CLOSED_API_WINDOW_IN_MS,
  keyGenerator: (req) => {
    return `${req.ip}-${req.user.id}`;
  },
  handler: (req, res, next) => next(new TooManyRequest()),
};

if (!config.isTest) {
  const redisService = new RedisService();
  openAPIsOptions.store = new RedisStore({ client: redisService.getInstance() });
  closedAPIsOption.store = new RedisStore({ client: redisService.getInstance() });
}

export const openLimiter = (): RateLimit.RateLimit => RateLimit(openAPIsOptions);
export const closedLimiter = (): RateLimit.RateLimit => RateLimit(closedAPIsOption);
