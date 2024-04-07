import { assertEquals } from "$std/assert/mod.ts";
import { storage } from "./storage.ts";
import { testUtils } from "./test-utils.ts";

Deno.test("can store a series", async () => {
  const series = testUtils.generateSeries();
  await storage.write(series);

  const readSeries = await storage.read(series);

  assertEquals(readSeries, series);
});

Deno.test("can retrieve a series", async () => {
  const series = testUtils.generateSeries();
  await storage.write(series);

  const readSeries = await storage.read(series);

  assertEquals(readSeries, series);
});
