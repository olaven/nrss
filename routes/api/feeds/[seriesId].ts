import { FreshContext, STATUS_CODE } from "$fresh/server.ts";
import { caching } from "../../../lib/caching.ts";
import { rss } from "../../../lib/rss.ts";
import { responseJSON, responseXML, withExpiry } from "../../../lib/utils.ts";

const FEED_CACHE_KEY = "feeds-cache";

// Deno's cache API does not respect these headers.
// Until it does, manual expiry handling is needed.
// When it's working, this function would not be needed.
// See: https://github.com/denoland/deno/issues/25795
function isExpired(headers: Headers) {
  const expiresHeader = headers.get("Expires");
  if (!expiresHeader) {
    console.log("No Expires header found, treating as expired");
    return true;
  }

  const now = new Date();
  const expiryDate = new Date(expiresHeader);
  const expired = now > expiryDate;
  return expired;
}

export const handler = async (
  request: Request,
  ctx: FreshContext,
): Promise<Response> => {
  const seriesId = ctx.params.seriesId;

  const cache = await caches.open(FEED_CACHE_KEY);
  const cachedResponse = await cache.match(request);

  if (cachedResponse && !isExpired(cachedResponse.headers)) {
    console.log(`Cache hit for feed ${seriesId}`);
    return cachedResponse;
  }

  console.log(`Fetching feed for ${seriesId}`);
  const series = await caching.getSeries({ id: seriesId });
  if (!series) {
    return responseJSON({ message: "Series not found" }, STATUS_CODE.NotFound);
  }

  const feed = rss.assembleFeed(series);

  const response = withExpiry(
    responseXML(feed, STATUS_CODE.OK),
    // 2 hours
    2 * 60 * 60,
  );

  await cache.put(request, response.clone());
  return response;
};
