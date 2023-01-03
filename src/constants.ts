export enum Token {
  ACCESS = 'access_token',
  REFRESH = 'refresh_token',
}

export enum UserType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  WORKER = 'worker',
  DEVICE = 'device',
  INSTALLER = 'installer',
  CLASSIFIER = 'classifier',
}

/**
 * Permission Type
 * Supervisor - read/create/update
 * manager - create/update
 * worker - read
 */

// export enum PermissionType {
//   Supervisor = 'supervisor',
//   Manager = 'manager',
//   Worker = 'worker',
// }

/**
 * Permission Types (NEW)
 */
export enum PermissionType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

// invalid status type
export const INVALID_STATUS_TYPE = 'INVALID';

// cache time
export const cacheTime = {
  DEFECTS: 1000 * 60 * 10,
  DEFECTS_PER_SHIFT: 1000 * 60 * 10,
  DEFECTS_BY_TYPE: 1000 * 60 * 10,
  DEFECTIVE_ROLLS_COUNT: 1000 * 60 * 10,
  INDIVIDUAL_MACHINE_STATUS: 1000 * 60 * 10,
  PRODUCTION_ROTATIONS: 1000 * 60 * 10,
};
