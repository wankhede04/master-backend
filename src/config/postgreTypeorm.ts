import { ConnectionOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import config from '../config';

const baseFolder = config.isProd ? 'dist' : 'src';

const typeormConfig = {
  type: config.DB_CONNECTION,
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_DATABASE,
  synchronize: false, // TODO: Make true on development
  logging: ['error'],
  dropSchema: false, // TODO: Make true on test
  namingStrategy: new SnakeNamingStrategy(),
  entities: [`${baseFolder}/model/*{.js,.ts}`],
  migrations: [`${baseFolder}/database/migration/**/*{.js,.ts}`],
  subscribers: [`${baseFolder}/database/subscriber/**/*{.js,.ts}`],
  cli: {
    entitiesDir: `${baseFolder}/model`,
    migrationsDir: `${baseFolder}/database/migration`,
    subscribersDir: `${baseFolder}/database/subscriber`,
  },
} as ConnectionOptions;

export default typeormConfig;
