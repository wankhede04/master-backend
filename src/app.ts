import express, { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'express-validation';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import schedule from 'node-schedule';

import { AppError, NotFoundError } from './error';
import config from './config';
import routes from './route';
import liquidate from './controller/order/liquidate.order';

const app = express();

// Cron expression generator https://crontab.cronhub.io/
schedule.scheduleJob('* * * * *', async () => {
  // eslint-disable-next-line no-console
  console.log('The answer to life, the universe, and everything!', new Date().getTime());
  // execute service to check and liquidate a trader
  liquidate();
});

app.set('port', config.PORT);

app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: config.WHITELIST_ORIGINS, credentials: true }));
app.use(compression());
app.use(routes());

app.use((req) => {
  throw new NotFoundError(
    `We are unable to locate requested API resource: [${req.method}] ${req.originalUrl}`,
    'API_ENDPOINT_NOT_FOUND',
  );
});

app.use((err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err?.statusCode || 500).json({
      message: err.message ?? 'Internal Server Error',
      code: err.code ?? 'INTERNAL_SERVER_ERROR',
      ...(config.isDev && { stack: err?.stack }),
    });
  }

  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err);
  }

  return res.status(500).json({
    message: err.message ?? 'Internal Server Error',
    code: 'INTERNAL_SERVER_ERROR',
    ...(config.isDev && { stack: err?.stack }),
  });
});

export default app;
