import { assertEquals } from "$std/assert/mod.ts";
import { readSeries, writeSeries } from "./series.ts";
import { testUtils } from "../test-utils.ts";

Deno.test({
  name: "can store a series",
  // A pooled pg connection is a long-lived resource shared across
  // this whole test run, which Deno's sanitizers would otherwise flag.
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const series = testUtils.generateSeries();
    await writeSeries(series);

    const stored = await readSeries(series);

    assertEquals(stored, series);
  },
});

Deno.test({
  name: "can retrieve a series",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const series = testUtils.generateSeries();
    await writeSeries(series);

    const stored = await readSeries(series);

    assertEquals(stored, series);
  },
});
