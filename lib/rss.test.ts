import { assertEquals, assertExists } from "asserts";
import { testUtils } from "./test-utils.ts";
import { rss } from "./rss.ts";



Deno.test("generated rss contains the series title", () => {

    const series = testUtils.generateSeries();
    const feed = rss.assembleFeed(series);
    assertExists(feed)
    assertEquals(feed.includes(series.title), true)
});

Deno.test("generated rss contains all episode titles", () => {

    const series = testUtils.generateSeries();
    const feed = rss.assembleFeed(series);
    assertExists(feed)
    series.episodes.forEach(episode => {
        assertEquals(feed.includes(episode.title), true)
    })
})