import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIssuesTable1777392000000 implements MigrationInterface {
  name = 'CreateIssuesTable1777392000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "issues" (
        "id" varchar NOT NULL,
        "identifier" varchar NOT NULL,
        "title" varchar NOT NULL,
        "description" text,
        "priority" integer,
        "state" varchar NOT NULL,
        "branch_name" varchar,
        "url" varchar,
        "labels" text NOT NULL DEFAULT '[]',
        "blocked_by" text NOT NULL DEFAULT '[]',
        CONSTRAINT "PK_issues_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_issues_identifier" ON "issues" ("identifier")');
    await queryRunner.query('CREATE INDEX "IDX_issues_priority" ON "issues" ("priority")');
    await queryRunner.query('CREATE INDEX "IDX_issues_state" ON "issues" ("state")');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_issues_state"');
    await queryRunner.query('DROP INDEX "IDX_issues_priority"');
    await queryRunner.query('DROP INDEX "IDX_issues_identifier"');
    await queryRunner.query('DROP TABLE "issues"');
  }
}
