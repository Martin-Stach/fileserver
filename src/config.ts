process.loadEnvFile('./../.env');

type APIConfig = {
  fileServerHits: number;
  dbURL: string;
};

export const config: APIConfig = {
  fileServerHits: 0,
  dbURL: envOrThrow('dbURL'),
};

function envOrThrow(key: string) {
  if(process.env[key]) {
    return process.env[key];
  }
  throw new Error("Env entry not found!");
}