import { Pool } from "npm:pg@8";
import "jsr:@std/dotenv/load";
import { connectionOptions } from "./connection-options.ts";

/**
 * A single pooled connection, shared by every table-specific
 * read/write module under storage/. Connection details come from
 * the standard PG* environment variables (see .env / .env.example).
 */
export const pool = new Pool(connectionOptions);

// deno-lint-ignore no-explicit-any
export function query<T extends Record<string, any> = any>(text: string, params?: unknown[]) {
  return pool.query<T>(text, params);
}
