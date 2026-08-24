import database from "/infra/database.js";

async function status(request, response) {
  let variavelEsquecida;
  const databaseName = process.env.POSTGRES_DB;
  const updatedAt = new Date().toISOString();

  const databaseVersionResult = await database.query("SHOW server_version");
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;

  const databaseMaxConnectionsResult = await database.query(
    "SHOW max_connections",
  );
  const databaseMaxConnectionsValue = parseInt(
    databaseMaxConnectionsResult.rows[0].max_connections,
  );

  const databaseOpennedConnectionsResult = await database.query(
    `SELECT count(*)::int FROM pg_stat_activity WHERE datname = '${databaseName}';`,
  );
  const databaseOpennedConnectionsValue = parseInt(
    databaseOpennedConnectionsResult.rows[0].count,
  );

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        max_connections: databaseMaxConnectionsValue,
        opened_connections: databaseOpennedConnectionsValue,
      },
    },
  });
}

export default status;
