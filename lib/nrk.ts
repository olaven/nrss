import { get, OK } from "https://deno.land/x/kall@v0.1.0/mod.ts";
import { components as searchComponents } from "./nrk-search.ts";
import { components as catalogComponents } from "./nrk-catalog.ts";

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;
export type Serie = catalogComponents["schemas"]["SeriesViewModel"];
type _OriginalEpisode = catalogComponents["schemas"]["EpisodeHalResource"];
export type OriginalEpisode = _OriginalEpisode & { url: string };
export type SearchResultList = searchComponents["schemas"]["seriesResult"]["results"];
export type SearchResult = ArrayElement<SearchResultList> & {
  description?: string;
};

/* Incomplete manifest types */
interface Manifest {
  id: string;
  playable: {
    endSequenceStartTime: null;
    duration: string;
    assets: {
      url: string;
      format: string;
      mimeType: string;
      encrypted: boolean;
    }[];
  };
}

async function withDownloadLink(
  episode: _OriginalEpisode,
): Promise<OriginalEpisode> {
  // getting stream link
  const [playbackStatus, playbackResponse] = await get<Manifest>(
    `https://psapi.nrk.no/playback/manifest/podcast/${episode.episodeId}`,
  );

  if (playbackStatus === OK && playbackResponse) {
    return { ...episode, url: playbackResponse.playable.assets[0].url };
  } else {
    throw `Error getting downloadLink for ${episode.episodeId}, serie: ${episode.originalTitle}. Status: ${playbackStatus}`;
  }
}

export const nrkRadio = {
  search: async (query: string): Promise<SearchResultList> => {
    const [status, response] = await get<
      searchComponents["schemas"]["searchresult"]
    >(`https://psapi.nrk.no/radio/search/search?q=${query}`);
    if (status === OK && response) {
      console.log("res", response.results);
      return response.results.series?.results;
    } else {
      throw `Something went wrong with ${query} - got status ${status}`;
    }
  },
  getSerieData: async (seriesId: string) => {
    const [
      [episodeStatus, episodeResponse],
      [seriesStatus, serieResponse],
    ] = await Promise.all([
      get<catalogComponents["schemas"]["EpisodesHalResource"]>(
        `https://psapi.nrk.no/radio/catalog/podcast/${seriesId}/episodes`,
      ),
      get<catalogComponents["schemas"]["SeriesHalResource"]>(
        `https://psapi.nrk.no/radio/catalog/podcast/${seriesId}`,
      ),
    ]);

    if (
      episodeStatus === OK && seriesStatus === OK &&
      serieResponse?.series && episodeResponse?._embedded.episodes?.length
    ) {
      const episodes = await Promise.all(
        episodeResponse._embedded.episodes.map((episode) => withDownloadLink(episode)),
      );
      return {
        ...serieResponse.series,
        episodes,
      };
    } else {
      throw `Error getting episodes for ${seriesId}: EpisodeStatus: ${episodeStatus}. SerieStatus: ${seriesStatus}`;
    }
  },
  getEpisode: async (seriesId: string, episodeId: string): Promise<OriginalEpisode | null> => {
    const url = `https://psapi.nrk.no/radio/catalog/podcast/${seriesId}/episodes/${episodeId}`;
    const [status, episode] = await get<OriginalEpisode>(url);
    if (status !== OK) {
      throw `Error getting episode ${episodeId}. Status: ${status}. Series: ${seriesId}`;
    }

    return episode;
  },
};
