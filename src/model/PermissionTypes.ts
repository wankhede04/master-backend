import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Permissions } from './Permissions';

@Entity('permission_types', { schema: 'public' })
export class PermissionTypes {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column('character varying', { length: 25 })
  name!: string;

  @Column('smallint', { nullable: true })
  level!: number | null;

  @OneToMany(() => Permissions, (permissions) => permissions.permissionType)
  permissions!: Permissions[];
}
