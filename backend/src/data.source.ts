import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "better-sqlite3",
    database: "database.sqlite",
    synchronize: false,
    logging: true,
    entities: ["src/entities/*.ts"],
    migrations: [__dirname,"src/migrations/*.ts"],
});