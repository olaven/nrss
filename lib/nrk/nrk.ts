import { get, STATUS_CODE } from "https://deno.land/x/kall@v2.0.0/mod.ts";
import { components as searchComponents } from "./nrk-search.ts";
import { components as catalogComponents } from "./nrk-catalog.ts";
import { external as playbackComponents } from "./nrk-playback.ts";
import { Series } from "../storage.ts";

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;
type PodcastEpisodes = catalogComponents["schemas"]["EpisodesHalResource"];
type Podcast = catalogComponents["schemas"]["SeriesHalResource"];
type PodcastEpisodesSingle = catalogComponents["schemas"]["EpisodeHalResource"];
type RadioSeriesEpisode = catalogComponents["schemas"]["EpisodesHalResource"];
type RadioSeries = catalogComponents["schemas"]["SeriesHalResource"];

export type NrkSerie = catalogComponents["schemas"]["SeriesViewModel"];
export type NrkOriginalEpisode = PodcastEpisodesSingle & { url: string };
export type NrkPodcastEpisode = catalogComponents["schemas"]["PodcastEpisodeHalResource"];
export type NrkSearchResultList = searchComponents["schemas"]["seriesResult"]["results"];
export type SearchResult = ArrayElement<NrkSearchResultList> & {
  description?: string;
};
export type SeriesData = { episodes: NrkOriginalEpisode[] } & (RadioSeries["series"] | Podcast["series"]);

function parseSeries(nrkSeries: SeriesData): Series {
  const imageUrl = nrkSeries.squareImage?.at(-1)?.url ?? "";

  return {
    id: nrkSeries.id,
    title: nrkSeries.titles.title,
    subtitle: nrkSeries.titles.subtitle ?? null,
    link: `https://radio.nrk.no/podkast/${nrkSeries.id}`,
    imageUrl: imageUrl,
    lastFetchedAt: new Date(),
    episodes: nrkSeries.episodes.map((episode) => {
      return {
        id: episode.id,
        title: episode.titles.title,
        subtitle: episode.titles.subtitle ?? null,
        url: episode.url,
        shareLink: episode._links.share?.href ?? "",
        date: new Date(episode.date),
        durationInSeconds: episode.durationInSeconds,
      };
    }),
  };
}

const nrkAPI = `https://psapi.nrk.no`;

async function search(query: string): Promise<NrkSearchResultList | null> {
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

async function getSeries(seriesId: string): Promise<Series | null> {
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
    const seriesData = {
      ...serieResponse.series,
      episodes,
    };
    const parsedSeries = parseSeries(seriesData);
    return parsedSeries;
  }
  console.error(
    `Error getting episodes for ${seriesId}: EpisodeStatus: ${episodeStatus}. SerieStatus: ${seriesStatus}`,
  );
  return null;
}

async function getEpisode(seriesId: string, episodeId: string): Promise<NrkPodcastEpisode | null> {
  const url = `${nrkAPI}/radio/catalog/podcast/${seriesId}/episodes/${episodeId}`;
  const { status, body: episode } = await get<NrkPodcastEpisode>(url);
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
): Promise<NrkOriginalEpisode> {
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
  getSeries,
  getEpisode,
  parseSeries,
};
