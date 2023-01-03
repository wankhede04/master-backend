import { createConnection, Connection, Migration } from 'typeorm';
import postgreTypeormConfig from '../config/postgreTypeorm';

export default class Database {
  private static instance: Database;

  private _connection?: Connection;
  private _mongoConnection?: Connection;

  constructor() {
    if (Database.instance instanceof Database) {
      return Database.instance;
    }

    Database.instance = this;
  }

  get connection(): Connection | undefined {
    return this._connection;
  }

  async connect(): Promise<Connection> {
    [this._connection, this._mongoConnection] = await Promise.all([
      createConnection(postgreTypeormConfig),
    ]);
    return this._connection;
  }

  async migrate(): Promise<Migration[] | undefined> {
    const migrations = await this._connection?.runMigrations();
    return migrations;
  }

  async disConnect(): Promise<void> {
    if (this._connection) {
      await this._connection.close();
    }
    if (this._mongoConnection) {
      await this._mongoConnection.close();
    }
  }
}
