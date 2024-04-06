import { FreshContext } from "$fresh/server.ts";
import { storage } from "../../../lib/storage.ts";





export const handler = async (_req: Request, ctx: FreshContext): Promise<Response> => {
  const seriesId = ctx.params.seriesId;

  const storedSeries = await storage.read({ id: seriesId });
  if (storedSeries === null) {


    // TODO: fetch for the first time 
    // const convert and store 
  }

  if (datetime)



    const feedContent = await buildFeed(seriesId);

  return new Response(feedContent, {
    headers: {
      "Content-Type": "application/xml",
    },
  })
};
