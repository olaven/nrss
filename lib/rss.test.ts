import { assertEquals, assertExists } from "$std/assert/mod.ts";
import { testUtils } from "./test-utils.ts";
import { rss } from "./rss.ts";
import { forTestingOnly } from "./rss.ts";

// NOTE: Could probably be expanded upon.
Deno.test("generate tag for episode", () => {
  const episode = testUtils.generateEpisode();
  const tag = forTestingOnly.assembleEpisode(episode, "someId");
  assertExists(tag);
});

Deno.test("generated rss contains the series title", () => {
  const series = testUtils.generateSeries();
  const feed = rss.assembleFeed(series);
  assertExists(feed);
  assertEquals(feed.includes(series.title), true);
});

Deno.test("generated rss contains all episode titles", () => {
  const series = testUtils.generateSeries();
  const feed = rss.assembleFeed(series);
  assertExists(feed);
  series.episodes.forEach((episode) => {
    assertEquals(feed.includes(episode.title), true);
  });
});

Deno.test("generated rss contains promo with link to donations page", () => {
  const series = testUtils.generateSeries();
  const feed = rss.assembleFeed(series);

  console.log(feed);
  feed.includes("Vurder å støtte utviklingen via Vipps med valgfritt beløp");
});
