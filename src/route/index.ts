import { Router } from 'express';
import auth from './auth';
import logger from '../service/log';
import Database from '../database';

const database = new Database();

const routes = Router();

routes.get('/', (req, res) => res.status(400).json({ message: 'Access not allowed' }));
routes.get('/health', async (req, res) => {
  let isDBConnected = false;
  if (database.connection) {
    try {
      const result = await database.connection.query('select 1 + 1 as result;');
      if (result && result.length) isDBConnected = true;
    } catch (error) {
      logger.error('DB check failed: ', error);
    }
  }

  res.status(200).json({
    message: 'UP',
    version: process.env.npm_package_version ?? 0,
    node: process.version,
    isDBConnected,
  });
});

routes.use('/auth', auth());

export default (): Router => routes;
