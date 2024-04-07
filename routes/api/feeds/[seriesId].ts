import { FreshContext, STATUS_CODE } from "$fresh/server.ts";
import { caching } from "../../../lib/caching.ts";
import { rss } from "../../../lib/rss.ts";

export const handler = async (_req: Request, ctx: FreshContext): Promise<Response> => {
  const seriesId = ctx.params.seriesId;

  const series = await caching.getSeries({ id: seriesId });
  if (!series) {
    return new Response(JSON.stringify({ message: "Series not found" }), {
      status: STATUS_CODE.NotFound,
      headers: {
        "Content-Type": "application/xml",
      },
    });
  }
  const feed = rss.assembleFeed(series);

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
};
