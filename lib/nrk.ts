// FIXME: Remember to replace this with actual version
import { get, STATUS_CODE } from "../../kall/mod.ts";
import { components as searchComponents } from "./nrk-search.ts";
import { components as catalogComponents } from "./nrk-catalog.ts";
import { external as playbackComponents } from "./nrk-playback.ts";

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;
type PodcastEpisodes = catalogComponents["schemas"]["EpisodesHalResource"];
type Podcast = catalogComponents["schemas"]["SeriesHalResource"];
type PodcastEpisodesSingle = catalogComponents["schemas"]["EpisodeHalResource"];
type RadioSeriesEpisode = catalogComponents["schemas"]["EpisodesHalResource"];
type RadioSeries = catalogComponents["schemas"]["SeriesHalResource"];

export type Serie = catalogComponents["schemas"]["SeriesViewModel"];
export type OriginalEpisode = PodcastEpisodesSingle & { url: string };
export type PodcastEpisode = catalogComponents["schemas"]["PodcastEpisodeHalResource"];
export type SearchResultList = searchComponents["schemas"]["seriesResult"]["results"];
export type SearchResult = ArrayElement<SearchResultList> & {
  description?: string;
};

const nrkAPI = `https://psapi.nrk.no`;

async function search(query: string): Promise<SearchResultList | null> {
  if (query === "") {
    console.error("Empty search query.");
    return null;
  }
  const { status, body } = await get<
    searchComponents["schemas"]["searchresult"]
  >(`${nrkAPI}/radio/search/search?q=${query}`);
  if (status === STATUS_CODE.OK && body) {
    return body.results.series?.results;
  }

  console.error(`Something went wrong with ${query} - got status ${status}`);
  return null;
}

async function getSerieData(
  seriesId: string,
): Promise<{ episodes: OriginalEpisode[] } & (RadioSeries["series"] | Podcast["series"]) | null> {
  let [
    { status: episodeStatus, body: episodeResponse },
    { status: seriesStatus, body: serieResponse },
  ] = await Promise.all([
    get<PodcastEpisodes>(
      `${nrkAPI}/radio/catalog/podcast/${seriesId}/episodes`,
    ),
    get<Podcast>(
      `${nrkAPI}/radio/catalog/podcast/${seriesId}`,
    ),
  ]);

  if (episodeStatus !== STATUS_CODE.OK || seriesStatus !== STATUS_CODE.OK) {
    [
      { status: episodeStatus, body: episodeResponse },
      { status: seriesStatus, body: serieResponse },
    ] = await Promise.all([
      get<RadioSeriesEpisode>(
        `https://psapi.nrk.no/radio/catalog/series/${seriesId}/episodes`,
      ),
      get<RadioSeries>(
        `https://psapi.nrk.no/radio/catalog/series/${seriesId}`,
      ),
    ]);
  }

  if (
    episodeStatus === STATUS_CODE.OK && seriesStatus === STATUS_CODE.OK &&
    serieResponse?.series && episodeResponse?._embedded.episodes?.length
  ) {
    const episodes = await Promise.all(
      episodeResponse._embedded.episodes.map((episode) => getEpisodeWithDownloadLink(episode, serieResponse.type)),
    );
    return {
      ...serieResponse.series,
      episodes,
    };
  }
  console.error(
    `Error getting episodes for ${seriesId}: EpisodeStatus: ${episodeStatus}. SerieStatus: ${seriesStatus}`,
  );
  return null;
}

async function getEpisode(seriesId: string, episodeId: string): Promise<PodcastEpisode | null> {
  const url = `${nrkAPI}/radio/catalog/podcast/${seriesId}/episodes/${episodeId}`;
  const { status, body: episode } = await get<PodcastEpisode>(url);
  if (status === STATUS_CODE.OK && episode) {
    return episode;
  }
  console.error(`Error getting episode ${episodeId}. Status: ${status}. Series: ${seriesId}`);
  return null;
}

type Manifest = playbackComponents["schemas/playback-channel.json"]["components"]["schemas"]["PlayableManifest"];

async function getEpisodeWithDownloadLink(
  episode: PodcastEpisodesSingle,
  type: catalogComponents["schemas"]["Type"],
): Promise<OriginalEpisode> {
  // getting stream link
  let { status: playbackStatus, body: playbackResponse } = await get<Manifest>(
    `${nrkAPI}/playback/manifest/podcast/${episode.episodeId}`,
  );

  if (type === "series") {
    const { status, body } = await get<Manifest>(
      `${nrkAPI}/playback/manifest/program/${episode.episodeId}`,
    );
    playbackStatus = status;
    playbackResponse = body;
  }

  if (playbackStatus === STATUS_CODE.OK && playbackResponse) {
    return { ...episode, url: playbackResponse.playable.assets[0].url };
  } else {
    throw `Error getting downloadLink for ${episode.episodeId}, serie: ${episode.originalTitle}. Status: ${playbackStatus}`;
  }
}

export const nrkRadio = {
  search,
  getSerieData,
  getEpisode,
};

export const forTestingOnly = {
  getEpisodeWithDownloadLink,
};
