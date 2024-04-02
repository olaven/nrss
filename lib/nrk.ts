import { get, OK } from "https://deno.land/x/kall@v0.1.0/mod.ts";
import { components as searchComponents } from "./nrk-search.ts";
import { components as catalogComponents } from "./nrk-catalog.ts";
import { external as playbackComponents } from "./nrk-playback.ts";

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;
type PodcastEpisodes = catalogComponents["schemas"]["EpisodesHalResource"];
type Podcast = catalogComponents["schemas"]["SeriesHalResource"];
type PodcastEpisodesSingle = catalogComponents["schemas"]["EpisodeHalResource"];

export type Serie = catalogComponents["schemas"]["SeriesViewModel"];
export type OriginalEpisode = PodcastEpisodesSingle & { url: string };
export type PodcastEpisode = catalogComponents["schemas"]["PodcastEpisodeHalResource"];
export type SearchResultList = searchComponents["schemas"]["seriesResult"]["results"];
export type SearchResult = ArrayElement<SearchResultList> & {
  description?: string;
};

type Manifest = playbackComponents["schemas/playback-channel.json"]["components"]["schemas"]["PlayableManifest"];

const nrkAPI = `https://psapi.nrk.no`;

async function withDownloadLink(
  episode: PodcastEpisodesSingle,
  type: catalogComponents["schemas"]["Type"],
): Promise<OriginalEpisode> {
  // getting stream link
  let [playbackStatus, playbackResponse] = await get<Manifest>(
    `${nrkAPI}/playback/manifest/podcast/${episode.episodeId}`,
  );

  if (type === "series") {
    [playbackStatus, playbackResponse] = await get<Manifest>(
      `${nrkAPI}/playback/manifest/program/${episode.episodeId}`,
    );
  }

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
    >(`${nrkAPI}/radio/search/search?q=${query}`);
    if (status === OK && response) {
      return response.results.series?.results;
    }
    throw `Something went wrong with ${query} - got status ${status}`;
  },
  getSerieData: async (seriesId: string) => {
    let [
      [episodeStatus, episodeResponse],
      [seriesStatus, serieResponse],
    ] = await Promise.all([
      get<PodcastEpisodes>(
        `${nrkAPI}/radio/catalog/podcast/${seriesId}/episodes`,
      ),
      get<Podcast>(
        `${nrkAPI}/radio/catalog/podcast/${seriesId}`,
      ),
    ]);

    if (episodeStatus !== OK || seriesStatus !== OK) {
      [
        [episodeStatus, episodeResponse],
        [seriesStatus, serieResponse],
      ] = await Promise.all([
        get<catalogComponents["schemas"]["EpisodesHalResource"]>(
          `https://psapi.nrk.no/radio/catalog/series/${seriesId}/episodes`,
        ),
        get<catalogComponents["schemas"]["SeriesHalResource"]>(
          `https://psapi.nrk.no/radio/catalog/series/${seriesId}`,
        ),
      ]);
    }

    if (
      episodeStatus === OK && seriesStatus === OK &&
      serieResponse?.series && episodeResponse?._embedded.episodes?.length
    ) {
      const episodes = await Promise.all(
        episodeResponse._embedded.episodes.map((episode) => withDownloadLink(episode, serieResponse.type)),
      );
      return {
        ...serieResponse.series,
        episodes,
      };
    }
    throw `Error getting episodes for ${seriesId}: EpisodeStatus: ${episodeStatus}. SerieStatus: ${seriesStatus}`;
  },
  getEpisode: async (seriesId: string, episodeId: string): Promise<PodcastEpisode | null> => {
    const url = `${nrkAPI}/radio/catalog/podcast/${seriesId}/episodes/${episodeId}`;
    const [status, episode] = await get<PodcastEpisode>(url);
    if (status === OK && episode) {
      return episode;
    }
    throw `Error getting episode ${episodeId}. Status: ${status}. Series: ${seriesId}`;
  },
};
