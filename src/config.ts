import { cleanEnv, str, port, url, CleanEnv, host, makeValidator, num } from 'envalid';
import nodeURL from 'url';

const origins = makeValidator<string[]>((x: string) => {
  let origins: string[];
  try {
    origins = JSON.parse(x);
  } catch (error) {
    throw new Error(`Invalid urls: "${x}"`);
  }
  return origins.map((origin, index) => {
    try {
      const parseURL = new nodeURL.URL(origin);
      return parseURL.origin;
    } catch (e) {
      throw new Error(`Invalid url at position [${index}]: "${origin}"`);
    }
  });
}, 'origins');

const strHex64 = makeValidator<string>((x) => {
  if (/^[0-9a-f]{64}$/.test(x)) {
    return x;
  }
  throw new Error('Expected a hex-character string of length 64');
}, 'strHex64');

type availableDatabaseConnection =
  | 'mysql'
  | 'mariadb'
  | 'postgres'
  | 'cockroachdb'
  | 'sqlite'
  | 'mssql'
  | 'sap'
  | 'oracle'
  | 'cordova'
  | 'nativescript'
  | 'react-native'
  | 'sqljs'
  | 'mongodb'
  | 'aurora-data-api'
  | 'aurora-data-api-pg'
  | 'expo';

type Environment = {
  NODE_ENV: string;
  PORT: number;
  SERVER_URL: string;
  LOG_LEVEL: string;
  WHITELIST_ORIGINS: string[];
  SECRET_HEX: string;
  ACCESS_TOKEN_LIFETIME_MIN: number;
  REFRESH_TOKEN_LIFETIME_MIN: number;
  OPEN_API_MAX_REQUEST: number;
  OPEN_API_WINDOW_IN_MS: number;
  CLOSED_API_MAX_REQUEST: number;
  CLOSED_API_WINDOW_IN_MS: number;
  DB_CONNECTION: availableDatabaseConnection;
  DB_HOST: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
  DB_PORT: number;
  REDIS_HOST: string;
  REDIS_PORT: number;
  GMAIL_USER: string;
  GMAIL_CLIENT_ID: string;
  GMAIL_CLIENT_SECRET: string;
  GMAIL_REFRESH_TOKEN: string;
  GMAIL_PASSWORD: string;
};

export type Env = Readonly<Environment & CleanEnv>;

const env: Env = cleanEnv<Environment>(process.env, {
  NODE_ENV: str({
    choices: ['production', 'test', 'development'],
    default: 'development',
  }),
  PORT: port({ default: 3333 }),
  SERVER_URL: url(),
  LOG_LEVEL: str({
    default: 'error',
    choices: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
  }),
  WHITELIST_ORIGINS: origins({ default: undefined }),
  SECRET_HEX: strHex64(),
  ACCESS_TOKEN_LIFETIME_MIN: num(),
  REFRESH_TOKEN_LIFETIME_MIN: num(),
  OPEN_API_MAX_REQUEST: num({ default: 3 }),
  OPEN_API_WINDOW_IN_MS: num({ default: 1000 }),
  CLOSED_API_MAX_REQUEST: num({ default: 3 }),
  CLOSED_API_WINDOW_IN_MS: num({ default: 1000 }),
  DB_CONNECTION: str({
    default: 'postgres',
    choices: [
      'mysql',
      'mariadb',
      'postgres',
      'cockroachdb',
      'sqlite',
      'mssql',
      'sap',
      'oracle',
      'cordova',
      'nativescript',
      'react-native',
      'sqljs',
      'mongodb',
      'aurora-data-api',
      'aurora-data-api-pg',
      'expo',
    ],
  }),
  DB_HOST: host({ default: 'localhost' }),
  DB_USERNAME: str(),
  DB_PASSWORD: str(),
  DB_DATABASE: str({ default: 'liquidation' }),
  DB_PORT: port({ default: 5432 }),
  REDIS_HOST: str({ default: '127.0.0.1' }),
  REDIS_PORT: port({ default: 6379 }),
  GMAIL_USER: str(),
  GMAIL_PASSWORD: str(),
  GMAIL_CLIENT_ID: str({ default: undefined }),
  GMAIL_CLIENT_SECRET: str({ default: undefined }),
  GMAIL_REFRESH_TOKEN: str({ default: undefined }),
});

export default env;
