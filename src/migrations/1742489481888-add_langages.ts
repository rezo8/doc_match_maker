// import { Migration, MigrationInterface, QueryRunner } from "typeorm";

// export class AddLangages1742489481888 implements MigrationInterface {

//     private readonly defaultLanguages = [
//         { name: 'English' },
//         { name: 'Arabic' },
//         { name: 'Spanish' },
//         { name: 'French' },
//         { name: 'German' },
//         { name: 'Chinese' },
//     ];

//     public async up(queryRunner: QueryRunner): Promise<void> {
//         for (const language of this.defaultLanguages) {
//             await queryRunner.query(
//                 `INSERT INTO "languages" ("name") VALUES ($1)`,
//                 [language.name]
//             );
//         }
//     }

//     public async down(queryRunner: QueryRunner): Promise<void> {
//         for (const language of this.defaultLanguages) {
//             await queryRunner.query(
//                 `DELETE FROM "languages" WHERE "name" = $1`,
//                 [language.name]
//             );
//         }
//     }

// }
