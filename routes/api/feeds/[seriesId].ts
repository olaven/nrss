import { FreshContext, STATUS_CODE } from "$fresh/server.ts";
import { caching } from "../../../lib/caching.ts";
import { rss } from "../../../lib/rss.ts";
import { responseJSON, responseXML, withExpiry } from "../../../lib/utils.ts";

const FEED_CACHE_KEY = "feeds-cache";

export const handler = async (
  request: Request,
  ctx: FreshContext,
): Promise<Response> => {
  const seriesId = ctx.params.seriesId;

  const cache = await caches.open(FEED_CACHE_KEY);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    console.log(`Cache hit for feed ${seriesId}`);
    return cachedResponse;
  }

  const series = await caching.getSeries({ id: seriesId });
  if (!series) {
    return responseJSON({ message: "Series not found" }, STATUS_CODE.NotFound);
  }

  const feed = rss.assembleFeed(series);

  const response = withExpiry(
    responseXML(feed, STATUS_CODE.OK),
    // 2 hours
    60 * 60 * 2,
  );

  await cache.put(request, response.clone());
  return response;
};
