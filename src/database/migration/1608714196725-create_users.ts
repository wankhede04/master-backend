import { MigrationInterface, QueryRunner } from 'typeorm';

export class createUsers1608714196725 implements MigrationInterface {
  name = 'createUsers1608714196725';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "public"."permission_types" ("id" SERIAL NOT NULL, "name" character varying(25) NOT NULL, "level" smallint, CONSTRAINT "PK_8de42dcf15507a2ff7516dcd7b0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_type_enum" AS ENUM('super_admin', 'admin', 'manager', 'worker', 'device', 'installer', 'classifier')`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying, "last_login" TIMESTAMP WITH TIME ZONE, "status" boolean NOT NULL DEFAULT false, "type" "public"."users_type_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_12ffa5c867f6bb71e2690a526ce" UNIQUE ("email"), CONSTRAINT "PK_a6cc71bedf15a41a5f5ee8aea97" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."permissions" ("id" SERIAL NOT NULL, "name" character varying(25) NOT NULL, "permission_type_id" integer, "user_id" uuid, CONSTRAINT "PK_f0f9bb265f21bfc7ad206ad2e97" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."permissions" ADD CONSTRAINT "FK_6ab57e55661fb2195701d5489be" FOREIGN KEY ("permission_type_id") REFERENCES "public"."permission_types"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."permissions" ADD CONSTRAINT "FK_02418fa8516364ff179a1095b24" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."permissions" DROP CONSTRAINT "FK_02418fa8516364ff179a1095b24"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."permissions" DROP CONSTRAINT "FK_6ab57e55661fb2195701d5489be"`,
    );
    await queryRunner.query(`DROP TABLE "public"."permissions"`);
    await queryRunner.query(`DROP TABLE "public"."users"`);
    await queryRunner.query(`DROP TYPE "public"."users_type_enum"`);
    await queryRunner.query(`DROP TABLE "public"."permission_types"`);
  }
}
