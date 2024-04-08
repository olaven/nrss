import { assertEquals } from "$std/assert/mod.ts";
import { forTestingOnly } from "./caching.ts";
import { storage } from "./storage.ts";
import { testUtils } from "./test-utils.ts";

Deno.test("Verify getTimeSinceLastFetch for correct difference", () => {
  const earlyDate = new Date("2024-04-07T20:24:32Z");
  const date = new Date("2024-04-07T23:24:32Z");
  const timeSinceLastFetch = forTestingOnly.getTimeSinceLastFetch(date, earlyDate);

  assertEquals(timeSinceLastFetch, 3);
});

Deno.test("Verify getTimeSinceLastFetch for bad date", () => {
  const earlyDate = new Date("2024-04-07T20:24:32Z");
  const date = new Date("bad date");
  const timeSinceLastFetch = forTestingOnly.getTimeSinceLastFetch(date, earlyDate);

  assertEquals(timeSinceLastFetch, NaN);
});

Deno.test("Verify getTimeSinceLastFetch for bad dates (plural)", () => {
  const earlyDate = new Date("badest date");
  const date = new Date("bad date");
  const timeSinceLastFetch = forTestingOnly.getTimeSinceLastFetch(date, earlyDate);

  assertEquals(timeSinceLastFetch, NaN);
});

Deno.test("Verify seriesFromStorage is old", () => {
  const earlyDate = new Date("2024-04-07T21:24:32Z");
  const date = new Date("2024-04-07T23:24:32Z");
  const timeSinceLastFetch = forTestingOnly.getTimeSinceLastFetch(date, earlyDate);

  const series = testUtils.generateSeries({ lastFetchedAt: date });
  const syncInterval = 2;
  const isNew = forTestingOnly.isSeriesFromStorageNew(series, syncInterval, timeSinceLastFetch);

  assertEquals(isNew, true);
});

Deno.test("Verify seriesFromStorage is new", () => {
  const earlyDate = new Date("2024-04-07T20:24:32Z");
  const date = new Date("2024-04-07T23:24:32Z");
  const timeSinceLastFetch = forTestingOnly.getTimeSinceLastFetch(date, earlyDate);

  const series = testUtils.generateSeries({ lastFetchedAt: date });
  const syncInterval = 2;
  const isNew = forTestingOnly.isSeriesFromStorageNew(series, syncInterval, timeSinceLastFetch);

  assertEquals(isNew, false);
});
