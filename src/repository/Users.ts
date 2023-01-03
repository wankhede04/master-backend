import { EntityRepository } from 'typeorm';

import { BaseRepository } from './BaseRepository';
import { Users } from '../model/Users';

@EntityRepository(Users)
export class UsersRepository extends BaseRepository<Users> {
  async updateLastLogin(id: string): Promise<void> {
    await this.update(id, { lastLogin: new Date() });
  }
}
