import { assertEquals, assertExists, assertGreaterOrEqual } from "$std/assert/mod.ts";
import { nrkRadio } from "./nrk.ts";
import { forTestingOnly } from "./nrk.ts";

Deno.test(
  "Verify search query `trygd` returns one result: 'Trygdekontoret'",
  async () => {
    const result = await nrkRadio.search("trygd");
    assertExists(result);
    assertEquals(result.length, 1);
    assertEquals(result[0].seriesId, "trygdekontoret");
  },
);

Deno.test("Verify empty search query yields `null`", async () => {
  const result = await nrkRadio.search("");
  assertEquals(result, null);
});

Deno.test("Verify getting series data for 'trygdekontoret' works", async () => {
  const result = await forTestingOnly.getSeriesData("trygdekontoret");
  assertExists(result);
  assertGreaterOrEqual(result.episodes.length, 1);
});

Deno.test("Verify getting series data for 'trygdekontoret' works", async () => {
  const seriesData = await forTestingOnly.getSeriesData("trygdekontoret");
  assertExists(seriesData);
  const result = nrkRadio.parseSeries(seriesData);
  assertExists(result);
  assertGreaterOrEqual(result.episodes.length, 1);
  assertEquals(result.title, "Trygdekontoret");
});

Deno.test("Verify getting series for 'trygdekontoret' works", async () => {
  const result = await nrkRadio.getSeries("trygdekontoret");
  assertExists(result);
  assertGreaterOrEqual(result.episodes.length, 1);
});

Deno.test("Verify getting series data for 'trygd' does not works", async () => {
  const result = await nrkRadio.getSeries("trygd");
  assertEquals(result, null);
});

Deno.test(
  "Verify getting episodeId 'l_0bc5e55a-46b5-48a5-85e5-5a46b5d8a562' for 'trygdekontoret' works",
  async () => {
    const result = await nrkRadio.getEpisode(
      "trygdekontoret",
      "l_0bc5e55a-46b5-48a5-85e5-5a46b5d8a562",
    );
    assertExists(result);
    assertEquals(result.duration.seconds, 4152);
  },
);

Deno.test(
  "Verify getting episodeId 'null' for 'trygdekontoret' yields `null`",
  async () => {
    const result = await nrkRadio.getEpisode("trygdekontoret", "null");
    assertEquals(result, null);
  },
);

Deno.test("Can get episodes for seriesnakk", async () => {
  const result = await nrkRadio.getSeries("seriesnakk");
  assertExists(result);
});

Deno.test("Seriesnakk, an umbrella series yields all seasons", async () => {
  const seriesData = await forTestingOnly.getSeriesData("seriesnakk");
  assertExists(seriesData);
  assertGreaterOrEqual(seriesData.episodes.length, 1);
  const titles = seriesData.episodes.map((e) => e.titles.title);

  const thereseTitle = "Therese-saken: Hva kan et vitne huske? (1:5)";
  assertEquals(
    titles.includes(thereseTitle),
    true,
    `Titles include "${thereseTitle}"`,
  );

  const maktaTitle = "– Vi er ikke idioter og tror at det var elsparkesykler i 1975";
  assertEquals(
    titles.includes(maktaTitle),
    true,
    `Titles include "${maktaTitle}"`,
  );

  const soLongMarianneTitle = "- Se og hør sov på dørmatta hennes! (1:8)";
  assertEquals(
    titles.includes(soLongMarianneTitle),
    true,
    `Titles include "${soLongMarianneTitle}"`,
  );

  const nerdrumTitle = "Seriesnakk: Familien Nerdrum";
  assertEquals(
    titles.includes(nerdrumTitle),
    true,
    `Titles include "${nerdrumTitle}"`,
  );

  const selinaTitle = "– Som å se meg selv (1:6)";
  assertEquals(
    titles.includes(selinaTitle),
    true,
    `Titles include "${selinaTitle}"`,
  );

  const skamTitle = "– William må svare (4:9)";
  assertEquals(
    titles.includes(skamTitle),
    true,
    `Titles include "${skamTitle}"`,
  );

  const natoTitle = "– Jeg ville slite ut Jens (1:2)";
  assertEquals(
    titles.includes(natoTitle),
    true,
    `Titles include "${natoTitle}"`,
  );
});
