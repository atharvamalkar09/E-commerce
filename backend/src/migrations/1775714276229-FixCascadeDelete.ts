import { MigrationInterface, QueryRunner } from "typeorm";

export class FixCascadeDelete1775714276229 implements MigrationInterface {
    name = 'FixCascadeDelete1775714276229'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" text NOT NULL, "price" decimal(10,2) NOT NULL, "stockQuantity" integer NOT NULL, "imagePath" varchar, "subCategoryId" integer)`);
        await queryRunner.query(`INSERT INTO "temporary_product"("id", "name", "description", "price", "stockQuantity", "imagePath", "subCategoryId") SELECT "id", "name", "description", "price", "stockQuantity", "imagePath", "subCategoryId" FROM "product"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`ALTER TABLE "temporary_product" RENAME TO "product"`);
        await queryRunner.query(`CREATE TABLE "temporary_product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" text NOT NULL, "price" decimal(10,2) NOT NULL, "stockQuantity" integer NOT NULL, "imagePath" varchar, "subCategoryId" integer, CONSTRAINT "FK_463d24f6d4905c488bd509164e6" FOREIGN KEY ("subCategoryId") REFERENCES "sub_category" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_product"("id", "name", "description", "price", "stockQuantity", "imagePath", "subCategoryId") SELECT "id", "name", "description", "price", "stockQuantity", "imagePath", "subCategoryId" FROM "product"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`ALTER TABLE "temporary_product" RENAME TO "product"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" RENAME TO "temporary_product"`);
        await queryRunner.query(`CREATE TABLE "product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" text NOT NULL, "price" decimal(10,2) NOT NULL, "stockQuantity" integer NOT NULL, "imagePath" varchar, "subCategoryId" integer)`);
        await queryRunner.query(`INSERT INTO "product"("id", "name", "description", "price", "stockQuantity", "imagePath", "subCategoryId") SELECT "id", "name", "description", "price", "stockQuantity", "imagePath", "subCategoryId" FROM "temporary_product"`);
        await queryRunner.query(`DROP TABLE "temporary_product"`);
        await queryRunner.query(`ALTER TABLE "product" RENAME TO "temporary_product"`);
        await queryRunner.query(`CREATE TABLE "product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" text NOT NULL, "price" decimal(10,2) NOT NULL, "stockQuantity" integer NOT NULL, "imagePath" varchar, "subCategoryId" integer, CONSTRAINT "FK_463d24f6d4905c488bd509164e6" FOREIGN KEY ("subCategoryId") REFERENCES "sub_category" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "product"("id", "name", "description", "price", "stockQuantity", "imagePath", "subCategoryId") SELECT "id", "name", "description", "price", "stockQuantity", "imagePath", "subCategoryId" FROM "temporary_product"`);
        await queryRunner.query(`DROP TABLE "temporary_product"`);
    }

}
