import { assertEquals } from "$std/assert/mod.ts";
import { storage } from "./storage.ts";
import { testUtils } from "./test-utils.ts";

Deno.test("can store a series", async () => {
  const series = testUtils.generateSeries();
  await storage.writeSeries(series);

  const readSeries = await storage.readSeries(series);

  assertEquals(readSeries, series);
});

Deno.test("can retrieve a series", async () => {
  const series = testUtils.generateSeries();
  await storage.writeSeries(series);

  const readSeries = await storage.readSeries(series);

  assertEquals(readSeries, series);
});
