import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

export default async function migrations(request, response) {
  const dbClient = await database.getNewCliente();
  const defaultMigrationsOptions = {
    dbClient: dbClient,
    databaseUrl: process.env.DATABASE_URL,
    dryRun: true,
    dir: join("infra", "migrations"), // usa esse método para evitar problemas com caracteres especiais no linux, windows etc.
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  if (request.method === "GET") {
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
    });
    await dbClient.end();
    return response.status(200).json(pendingMigrations);
  }

  if (request.method === "POST") {
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dryRun: false,
    });
    await dbClient.end();
    const statusCode = migratedMigrations.length > 0 ? 201 : 200;
    return response.status(statusCode).json(migratedMigrations);
  }

  return response.status(405).end();
}
