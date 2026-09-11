import "jsr:@std/dotenv/load";
import { runner } from "npm:node-pg-migrate@9";
import { Client } from "npm:pg@8";
import { connectionOptions, schema } from "./connection-options.ts";


// node-pg-migrate needs the schema to exist before it can create its own
// tracking table inside it, so ensure it up front.
const client = new Client(connectionOptions);
await client.connect();
await client.query(`create schema if not exists "${schema}"`);
await client.end();

await runner({
  databaseUrl: connectionOptions,
  dir: new URL("./migrations", import.meta.url).pathname,
  direction: "up",
  migrationsTable: "pgmigrations",
  schema,
});
