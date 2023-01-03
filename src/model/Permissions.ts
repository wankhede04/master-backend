import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { PermissionTypes } from './PermissionTypes';
import { Users } from './Users';

@Entity('permissions', { schema: 'public' })
export class Permissions {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column('character varying', { length: 25 })
  name!: string;

  @ManyToOne(() => PermissionTypes, (permissionTypes) => permissionTypes.permissions, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    eager: true,
  })
  permissionType!: PermissionTypes;

  @ManyToOne(() => Users, (users) => users.permissions, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  user!: Users;
}
