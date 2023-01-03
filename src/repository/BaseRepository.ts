import { FindOneOptions, ObjectID, ObjectLiteral, Repository } from 'typeorm';

import { EntityNotFoundError } from '../error';

export class BaseRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
  async findByIdOrFail(
    id: string | number | Date | ObjectID,
    options?: FindOneOptions<Entity>,
  ): Promise<Entity> {
    return this.findOne(id, options).then((value) => {
      if (value === undefined) {
        return Promise.reject(new EntityNotFoundError(id, this.metadata.name));
      }
      return Promise.resolve(value);
    });
  }
}
