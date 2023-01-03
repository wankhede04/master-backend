import { EntityRepository } from 'typeorm';

import { BaseRepository } from './BaseRepository';
import { Permissions } from '../model/Permissions';
import { Users } from '../model/Users';
import { PermissionType } from '../constants';

@EntityRepository(Permissions)
export class PermissionsRepository extends BaseRepository<Permissions> {
  async IsUserHasPermission(
    user: Users,
    factoryId: number | string,
    permissionType: PermissionType,
  ): Promise<boolean> {
    const permissions = await this.find({ where: { user, factory: factoryId } });
    if (!permissions?.length) {
      return false;
    }
    const matchPermissions = permissions.find(
      (permission) => permission.permissionType.name === permissionType,
    );
    if (!matchPermissions) {
      return false;
    }
    return true;
  }

  IsUserHasReadPermission = (user: Users, factoryId: number | string): Promise<boolean> => {
    return this.IsUserHasPermission(user, factoryId, PermissionType.READ);
  };

  IsUserHasCreatePermission = (user: Users, factoryId: number | string): Promise<boolean> => {
    return this.IsUserHasPermission(user, factoryId, PermissionType.CREATE);
  };

  IsUserHasUpdatePermission = (user: Users, factoryId: number | string): Promise<boolean> => {
    return this.IsUserHasPermission(user, factoryId, PermissionType.UPDATE);
  };

  IsUserHasDeletePermission = (user: Users, factoryId: number | string): Promise<boolean> => {
    return this.IsUserHasPermission(user, factoryId, PermissionType.DELETE);
  };
}
