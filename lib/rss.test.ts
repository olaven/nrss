import { assertEquals, assertExists, assertLess } from "$std/assert/mod.ts";
import { testUtils } from "./test-utils.ts";
import { rss } from "./rss.ts";
import { forTestingOnly } from "./rss.ts";

const VIPPS_ENV_KEYS = [
  "VIPPS_CLIENT_ID",
  "VIPPS_CLIENT_SECRET",
  "VIPPS_OCP_APIM_SUBSCRIPTION_KEY_PRIMARY",
  "VIPPS_OCM_APIM_SUBSCRIPTION_KEY_SECONDARY",
  "VIPPS_MSN",
  "VIPPS_API_BASE_URL",
] as const;

function clearVippsEnv() {
  for (const key of VIPPS_ENV_KEYS) {
    Deno.env.delete(key);
  }
}

function enableVippsEnv() {
  Deno.env.set("VIPPS_CLIENT_ID", "client-id");
  Deno.env.set("VIPPS_CLIENT_SECRET", "client-secret");
  Deno.env.set("VIPPS_OCP_APIM_SUBSCRIPTION_KEY_PRIMARY", "primary-key");
  Deno.env.set("VIPPS_OCM_APIM_SUBSCRIPTION_KEY_SECONDARY", "secondary-key");
  Deno.env.set("VIPPS_MSN", "msn");
  Deno.env.set("VIPPS_API_BASE_URL", "https://api.vipps.no");
}

function clearRssHostEnv() {
  Deno.env.delete("APP_BASE_URL");
  Deno.env.delete("DENO_DEPLOYMENT_ID");
  Deno.env.delete("TUNNEL_URL");
}

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

Deno.test("generated rss omits promo when Vipps is disabled", () => {
  clearVippsEnv();
  const series = testUtils.generateSeries();
  const feed = rss.assembleFeed(series);

  assertEquals(feed.includes("Vurder å støtte utviklingen via Vipps"), false);
});

Deno.test(
  "generated rss contains promo with configured host when Vipps is enabled",
  () => {
    clearVippsEnv();
    clearRssHostEnv();
    enableVippsEnv();
    Deno.env.set("APP_BASE_URL", "https://nrss.example.com/");

    const series = testUtils.generateSeries();
    const feed = rss.assembleFeed(series);

    assertEquals(feed.includes("Vurder å støtte utviklingen via Vipps"), true);
    assertEquals(feed.includes("https://nrss.example.com"), true);

    clearVippsEnv();
    clearRssHostEnv();
  },
);

Deno.test("Vipps promotion replaces the removed first promotion", () => {
  clearVippsEnv();
  clearRssHostEnv();
  enableVippsEnv();

  const series = testUtils.generateSeries();
  const feed = rss.assembleFeed(series);

  const indexOfFirstPromotion = feed.indexOf(
    "NRSS er avhengig av din Vipps-støtte",
  );
  const indexOfSecondPromotion = feed.indexOf("Vurder å støtte utviklingen");
  assertEquals(indexOfFirstPromotion, -1, "First promotion should be removed");
  assertLess(
    -1,
    indexOfSecondPromotion,
    "Replacement promotion should still be present",
  );

  clearVippsEnv();
  clearRssHostEnv();
});

Deno.test("first promotion is removed", () => {
  clearVippsEnv();
  clearRssHostEnv();
  enableVippsEnv();

  const series = testUtils.generateSeries();
  const feed = rss.assembleFeed(series);
  const indexOfFirstPromotion = feed.indexOf(
    "NRSS er avhengig av din Vipps-støtte",
  );
  assertEquals(indexOfFirstPromotion, -1, "First promotion should be removed");

  clearVippsEnv();
  clearRssHostEnv();
});
