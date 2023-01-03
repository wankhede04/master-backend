import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
} from 'typeorm';

import { Permissions } from './Permissions';
import { UserType } from '../constants';

@Entity('users', { schema: 'public' })
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('character varying', { length: 255 })
  name!: string;

  @Column('character varying', { length: 255, unique: true })
  email!: string;

  @Column('character varying', { nullable: true, select: false })
  password!: string | null;

  @Column('timestamptz', { nullable: true })
  lastLogin!: Date | null;

  @Column('boolean', { default: () => 'false' })
  status!: boolean;

  @Column({ type: 'enum', enum: UserType })
  type!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => Permissions, (permissions) => permissions.user)
  permissions!: Permissions[];

  isSuperAdmin = (): boolean => this.type === UserType.SUPER_ADMIN;

  isAdminOrDevice = (): boolean =>
    this.type === UserType.SUPER_ADMIN ||
    this.type === UserType.ADMIN ||
    this.type === UserType.DEVICE;
}
