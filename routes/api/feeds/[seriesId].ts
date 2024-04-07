import { FreshContext } from "$fresh/server.ts";
import { caching } from "../../../lib/caching.ts";
import { rss } from "../../../lib/rss.ts";

export const handler = async (_req: Request, ctx: FreshContext): Promise<Response> => {
  const seriesId = ctx.params.seriesId;

  const series = await caching.getSeries({ id: seriesId });
  const feed = rss.assembleFeed(series);

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
};
