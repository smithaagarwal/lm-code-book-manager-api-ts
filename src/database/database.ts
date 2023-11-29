import { Dialect, Sequelize } from "sequelize";
import { CONFIG } from "../config";

// TODO: This should be external config
export let sequelize = new Sequelize("sqlite::memory:");

if (CONFIG.env !== "test") {
	sequelize = new Sequelize(
		CONFIG.dbName ?? "MISSING_DB_NAME_CONFIG",

		CONFIG.dbUserName ?? "MISSING_DB_USERNAME_CONFIG",

		CONFIG.dbPassword ?? "MISSING_DB_PASSWORD_CONFIG",
		{
			host: CONFIG.dbHost ?? "MISSING_DB_HOST_CONFIG",
			port: parseInt(CONFIG.dbPort as string) ?? "MISSING_DB_PORT_CONFIG",
			dialect: (CONFIG.dbDialect as Dialect) ?? "postgres",
		}
	);
}
