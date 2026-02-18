import type { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();

type APIConfig = {
	fileServerHits: number;
	port: number;
	platform: string;
};

type DBConfig = {
	url: string;
	migrationConfig: MigrationConfig;
};

type Config = {
	api: APIConfig;
	db: DBConfig;
};

const migrationConfig: MigrationConfig = {
	migrationsFolder: "./src/db/migrations",
};

export const config: Config = {
	api: {
		fileServerHits: 0,
		port: Number(envOrThrow("PORT")),
		platform: envOrThrow("PLATFORM"),
	},
	db: {
		url: envOrThrow("DB_URL"),
		migrationConfig: migrationConfig,
	},
};

function envOrThrow(key: string) {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Env ${key} entry not found!`);
	}
	return value;
}
