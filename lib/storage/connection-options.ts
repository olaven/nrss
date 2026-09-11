import "jsr:@std/dotenv/load";

export const schema = Deno.env.get("PGSCHEMA") 

console.log({schema})
export const connectionOptions = {
  host: Deno.env.get("PGHOST"),
  port: Number(Deno.env.get("PGPORT") ?? 5432),
  database: Deno.env.get("PGDATABASE"),
  user: Deno.env.get("PGUSER"),
  password: Deno.env.get("PGPASSWORD"),
  options: `-c search_path=${schema}`,
};