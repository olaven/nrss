import { FreshContext, STATUS_CODE } from "$fresh/server.ts";
import { caching } from "../../../lib/caching.ts";
import { rss } from "../../../lib/rss.ts";
import { responseJSON, responseXML } from "../../../lib/utils.ts";

export const handler = async (_req: Request, ctx: FreshContext): Promise<Response> => {
  const seriesId = ctx.params.seriesId;

  const series = await caching.getSeries({ id: seriesId });
  if (!series) {
    return responseJSON({ message: "Series not found" }, STATUS_CODE.NotFound);
  }
  const feed = rss.assembleFeed(series);
  console.log(feed);

  const xml = responseXML(feed, STATUS_CODE.OK);
  console.log({ feed, xml });

  return xml;
};
