import { assertEquals } from "$std/assert/assert_equals.ts";
import { nrkRadio } from "./nrk.ts";
import { assertGreaterOrEqual } from "$std/assert/assert_greater_or_equal.ts";
import { assertExists } from "https://deno.land/std@0.216.0/assert/assert_exists.ts";

Deno.test("Verify search query `trygd` returns one result: 'Trygdekontoret'", async () => {
  const result = await nrkRadio.search("trygd");

  assertExists(result);
  assertEquals(result.length, 1);
  assertEquals(result[0].seriesId, "trygdekontoret");
});

Deno.test("Verify empty search query yields `null`", async () => {
  const result = await nrkRadio.search("");
  assertEquals(result, null);
});

Deno.test("Verify getting series data for 'trygdekontoret' works", async () => {
  const result = await nrkRadio.getSeries("trygdekontoret");

  assertExists(result);
  assertGreaterOrEqual(result.episodes.length, 1);
});

Deno.test("Verify getting series data for 'trygd' does not works", async () => {
  const result = await nrkRadio.getSeries("trygd");
  assertEquals(result, null);
});

Deno.test("Verify getting episodeId 'l_0bc5e55a-46b5-48a5-85e5-5a46b5d8a562' for 'trygdekontoret' works", async () => {
  const result = await nrkRadio.getEpisode("trygdekontoret", "l_0bc5e55a-46b5-48a5-85e5-5a46b5d8a562");

  assertExists(result);
  assertEquals(result.duration.seconds, 4152);
});

Deno.test("Verify getting episodeId 'null' for 'trygdekontoret' yields `null`", async () => {
  const result = await nrkRadio.getEpisode("trygdekontoret", "null");

  assertEquals(result, null);
});
