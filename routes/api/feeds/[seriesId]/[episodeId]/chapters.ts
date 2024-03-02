import { FreshContext } from "$fresh/server.ts";
import { parse, toSeconds } from "https://esm.sh/iso8601-duration@2.1.1";
import { nrkRadio, OriginalEpisode } from "../../../../../lib/nrk.ts";

function toChapters(episode: OriginalEpisode) {
  return episode.indexPoints.map((indexPoint) => ({
    title: indexPoint.title,
    startTime: toSeconds(parse(indexPoint.startPoint)),
  }));
}

export const handler = async (_req: Request, ctx: FreshContext): Promise<Response> => {
  const seriesId = ctx.params.seriesId;
  const episodeId = ctx.params.episodeId;

  console.log("going to get ep for ", episodeId);
  const episode = await nrkRadio.getEpisode(seriesId, episodeId);

  if (!episode) {
    return new Response(JSON.stringify({ message: `Episode ${episodeId} is missing` }), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 500,
    });
  }
  const chapters = toChapters(episode);
  const body = {
    version: "1.2.0",
    chapters,
  };

  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
