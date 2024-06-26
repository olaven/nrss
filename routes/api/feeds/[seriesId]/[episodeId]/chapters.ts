import { FreshContext, STATUS_CODE } from "$fresh/server.ts";
import { parse, toSeconds } from "https://esm.sh/iso8601-duration@2.1.1";
import { NrkPodcastEpisode, nrkRadio } from "../../../../../lib/nrk/nrk.ts";
import { responseJSON } from "../../../../../lib/utils.ts";

type Chapter = {
  title: string | undefined;
  startTime: number | undefined;
};

function toChapters(episode: NrkPodcastEpisode): Chapter[] | null {
  if (!episode.indexPoints) {
    return null;
  }
  return episode.indexPoints.map((indexPoint) => ({
    title: indexPoint.title,
    startTime: indexPoint.startPoint ? toSeconds(parse(indexPoint.startPoint)) : undefined,
  }));
}

export const handler = async (_req: Request, ctx: FreshContext): Promise<Response> => {
  const seriesId = ctx.params.seriesId;
  const episodeId = ctx.params.episodeId;

  console.log("going to get ep for ", episodeId);
  const episode = await nrkRadio.getEpisode(seriesId, episodeId);

  if (!episode) {
    return responseJSON({ message: `Episode ${episodeId} is missing` }, STATUS_CODE.NotFound);
  }
  const chapters = toChapters(episode);
  const body = {
    version: "1.2.0",
    chapters,
  };

  return responseJSON(body, STATUS_CODE.OK);
};
