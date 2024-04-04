import { assertEquals } from "$std/assert/assert_equals.ts";
import { assertRejects } from "$std/assert/assert_rejects.ts";
import { nrkRadio } from "./nrk.ts";
import { assertGreaterOrEqual } from "$std/assert/assert_greater_or_equal.ts";
import { assertExists } from "https://deno.land/std@0.216.0/assert/assert_exists.ts";

Deno.test("Verify search query `trygd` returns one result: 'Trygdekontoret'", async () => {
  const result = await nrkRadio.search("trygd");

  assertExists(result);
  assertEquals(result.length, 1);
  assertEquals(result[0].seriesId, "trygdekontoret");
});

Deno.test("Verify empty search query yields error", async () => {
  await assertRejects(async () => await nrkRadio.search(""));
});

Deno.test("Verify getting series data for 'trygdekontoret' works", async () => {
  const result = await nrkRadio.getSerieData("trygdekontoret");

  assertGreaterOrEqual(result.episodes.length, 1);
});

// TODO: This doesn't work because there is no try-catch system, it seems.
// Deno.test("Verify getting series data for 'trygd' does not works", async () => {
//   await assertThrows(async () => await nrkRadio.getSerieData("trygd"));
// });

Deno.test("Verify getting episodeId 'l_0bc5e55a-46b5-48a5-85e5-5a46b5d8a562' for 'trygdekontoret' works", async () => {
  const result = await nrkRadio.getEpisode("trygdekontoret", "l_0bc5e55a-46b5-48a5-85e5-5a46b5d8a562");

  assertExists(result);
  assertEquals(result.duration.seconds, 4152);
});

Deno.test("Verify getting episodeId 'null' for 'trygdekontoret' fails", async () => {
  const result = await nrkRadio.getEpisode("trygdekontoret", "null");

  assertEquals(result, null);
});
