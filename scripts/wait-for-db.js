require("dotenv/config");
const { Client } = require("pg");

// A TCP connect is not enough: on a fresh volume Postgres binds the port, then
// restarts during initdb and refuses connections for a few seconds. So this
// waits for a query to actually succeed.
const connectionString = process.env.DATABASE_URL;
const deadline = Date.now() + 90_000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  if (!connectionString) {
    console.error("DATABASE_URL is not set. Copy .env.example to .env.");
    process.exit(1);
  }

  let lastError;
  while (Date.now() < deadline) {
    const client = new Client({ connectionString, connectionTimeoutMillis: 3000 });
    try {
      await client.connect();
      await client.query("SELECT 1");
      await client.end();
      console.log("Database is ready.");
      return;
    } catch (error) {
      lastError = error;
      await client.end().catch(() => {});
      await sleep(1000);
    }
  }

  console.error(`Database was not ready within 90s: ${lastError?.message}`);
  process.exit(1);
}

main();
