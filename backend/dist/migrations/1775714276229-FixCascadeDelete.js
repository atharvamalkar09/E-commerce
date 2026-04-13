"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixCascadeDelete1775714276229 = void 0;
class FixCascadeDelete1775714276229 {
    name = 'FixCascadeDelete1775714276229';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "temporary_product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" text NOT NULL, "price" decimal(10,2) NOT NULL, "stockQuantity" integer NOT NULL, "imagePath" varchar, "subCategoryId" integer)`);
        await queryRunner.query(`INSERT INTO "temporary_product"("id", "name", "description", "price", "stockQuantity", "imagePath", "subCategoryId") SELECT "id", "name", "description", "price", "stockQuantity", "imagePath", "subCategoryId" FROM "product"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`ALTER TABLE "temporary_product" RENAME TO "product"`);
        await queryRunner.query(`CREATE TABLE "temporary_product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" text NOT NULL, "price" decimal(10,2) NOT NULL, "stockQuantity" integer NOT NULL, "imagePath" varchar, "subCategoryId" integer, CONSTRAINT "FK_463d24f6d4905c488bd509164e6" FOREIGN KEY ("subCategoryId") REFERENCES "sub_category" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_product"("id", "name", "description", "price", "stockQuantity", "imagePath", "subCategoryId") SELECT "id", "name", "description", "price", "stockQuantity", "imagePath", "subCategoryId" FROM "product"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`ALTER TABLE "temporary_product" RENAME TO "product"`);
    }
    async down(queryRunner) {
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
exports.FixCascadeDelete1775714276229 = FixCascadeDelete1775714276229;
