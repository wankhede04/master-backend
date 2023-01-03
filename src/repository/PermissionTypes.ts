import { EntityRepository } from 'typeorm';

import { BaseRepository } from './BaseRepository';
import { PermissionTypes } from '../model/PermissionTypes';

@EntityRepository(PermissionTypes)
export class PermissionTypesRepository extends BaseRepository<PermissionTypes> {}
