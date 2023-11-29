import * as dotenv from "dotenv";
dotenv.config();
export const CONFIG = {
	env: process.env.NODE_ENV ?? "test",
	port: process.env.PORT ?? 3000,
	dbName: process.env.DB_NAME ?? "sqlite::memory:",
	dbUserName: process.env.DB_USERNAME ?? "",
	dbPassword: process.env.DB_PASSWORD ?? "",
	dbHost: process.env.DB_HOST ?? "",
	dbPort: process.env.DB_PORT ?? "",
	dbDialect: process.env.DB_DIALECT ?? "sqlite",
} as const;
