import 'reflect-metadata';

import { RedisService } from './service/redis';
import logger from './service/log';
import Database from './database';
import config from './config';
import app from './app';

const database = new Database();
const redisService = new RedisService();

const port = app.get('port');

(async function () {
  try {
    await database.connect();
    // TODO: Run migration in lock mode
    // TODO: https://github.com/typeorm/typeorm/issues/4588
    // TODO: https://github.com/typeorm/typeorm/pull/6388
    if (config.isDev || config.isTest || (config.isProd && process.env.NODE_APP_INSTANCE === '0')) {
      // TODO: Only run migration on production
      const migrations = await database.migrate();
      if (migrations && migrations.length) {
        logger.info(`Migrations: ${migrations.map((migration) => migration.name).join(', ')}`);
      }
    }

    const server = app.listen(port, () => {
      logger.info(`Server started - PORT: ${port}`);
      process.send && process.send('ready');
    });
    server.setTimeout(1000 * 60 * 5);
  } catch (error) {
    logger.error('Unable to connect to database. ', error);
    process.stdin.emit('SIGINT');
    process.exit(1);
  }
})();

process.on('SIGINT', async () => {
  logger.info('Gracefully shutting down');
  await database.disConnect();
  redisService.disconnect();
  process.exit(0);
});
