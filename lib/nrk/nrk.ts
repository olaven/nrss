import { get, STATUS_CODE } from "https://deno.land/x/kall@v2.0.0/mod.ts";
import { Series } from "../storage.ts";
import { components as catalogComponents } from "./nrk-catalog.ts";
import { external as playbackComponents } from "./nrk-playback.ts";
import { components as searchComponents } from "./nrk-search.ts";

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;
type PodcastEpisodes = catalogComponents["schemas"]["EpisodesHalResource"];
type Podcast = catalogComponents["schemas"]["SeriesHalResource"];
type PodcastEpisodesSingle = catalogComponents["schemas"]["EpisodeHalResource"];
type RadioSeriesEpisode = catalogComponents["schemas"]["EpisodesHalResource"];
type RadioSeries = catalogComponents["schemas"]["SeriesHalResource"];
type SeasonEpisodes = catalogComponents["schemas"]["PodcastSeasonHalResource"];

export type NrkSerie = catalogComponents["schemas"]["SeriesViewModel"];
export type NrkOriginalEpisode = PodcastEpisodesSingle & { url: string };
export type NrkPodcastEpisode = catalogComponents["schemas"]["PodcastEpisodeHalResource"];
export type NrkSearchResultList = searchComponents["schemas"]["seriesResult"]["results"];
export type SearchResult = ArrayElement<NrkSearchResultList> & {
  description?: string;
};
export type SeriesData =
  & { episodes: NrkOriginalEpisode[] }
  & (
    | RadioSeries["series"]
    | Podcast["series"]
  );

function parseSeries(nrkSeriesData: SeriesData): Series {
  const imageUrl = nrkSeriesData.squareImage?.at(-1)?.url ?? "";
  return {
    id: nrkSeriesData.id,
    title: nrkSeriesData.titles.title,
    subtitle: nrkSeriesData.titles.subtitle ?? null,
    link: `https://radio.nrk.no/podkast/${nrkSeriesData.id}`,
    imageUrl: imageUrl,
    lastFetchedAt: new Date(),
    episodes: nrkSeriesData.episodes.map((episode) => {
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

async function extractEpisodes(
  serieResponse: RadioSeries,
  episodeResponse?: PodcastEpisodes,
): Promise<NrkOriginalEpisode[]> {
  if (serieResponse.seriesType === "umbrella") {
    const seasons = await Promise.all(
      serieResponse._links.seasons.map(async (season) => {
        const response = await get<SeasonEpisodes>(
          `https://psapi.nrk.no${season.href}`,
        );
        return response.body;
      }),
    );

    const episodes = await Promise.all(
      seasons.flatMap((season) => {
        return (
          season?._embedded.episodes?._embedded.episodes?.flatMap((episode) =>
            getEpisodeWithDownloadLink(episode, serieResponse.type)
          ) ?? []
        );
      }),
    );

    return episodes;
  } else {
    const episodes = await Promise.all(
      episodeResponse?._embedded.episodes?.map((episode) => getEpisodeWithDownloadLink(episode, serieResponse.type)) ??
        [],
    );

    return episodes;
  }
}

async function getSeriesData(seriesId: string): Promise<SeriesData | null> {
  let [
    { status: episodeStatus, body: episodeResponse },
    { status: seriesStatus, body: serieResponse },
  ] = await Promise.all([
    get<PodcastEpisodes>(
      `${nrkAPI}/radio/catalog/podcast/${seriesId}/episodes`,
    ),
    get<Podcast>(`${nrkAPI}/radio/catalog/podcast/${seriesId}`),
  ]);

  if (episodeStatus !== STATUS_CODE.OK || seriesStatus !== STATUS_CODE.OK) {
    [
      { status: episodeStatus, body: episodeResponse },
      { status: seriesStatus, body: serieResponse },
    ] = await Promise.all([
      get<RadioSeriesEpisode>(
        `https://psapi.nrk.no/radio/catalog/series/${seriesId}/episodes`,
      ),
      get<RadioSeries>(`https://psapi.nrk.no/radio/catalog/series/${seriesId}`),
    ]);
  }

  if (
    episodeStatus === STATUS_CODE.OK &&
    seriesStatus === STATUS_CODE.OK &&
    serieResponse?.series &&
    episodeResponse?._embedded.episodes?.length
  ) {
    const episodes = await extractEpisodes(serieResponse, episodeResponse);
    const seriesData = {
      ...serieResponse.series,
      episodes,
    };
    return seriesData;
  }
  console.error(
    `Error getting episodes for ${seriesId}: EpisodeStatus: ${episodeStatus}. SerieStatus: ${seriesStatus}`,
  );
  return null;
}

async function getSeries(seriesId: string): Promise<Series | null> {
  const seriesData = await getSeriesData(seriesId);
  if (!seriesData) {
    return null;
  }
  const parsedSeries = parseSeries(seriesData);
  return parsedSeries;
}

async function getEpisode(
  seriesId: string,
  episodeId: string,
): Promise<NrkPodcastEpisode | null> {
  const url = `${nrkAPI}/radio/catalog/podcast/${seriesId}/episodes/${episodeId}`;
  const { status, body: episode } = await get<NrkPodcastEpisode>(url);
  if (status === STATUS_CODE.OK && episode) {
    return episode;
  }
  console.error(
    `Error getting episode ${episodeId}. Status: ${status}. Series: ${seriesId}`,
  );
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

  if (playbackStatus !== STATUS_CODE.OK && !playbackResponse) {
    throw new Error(
      `Error getting downloadLink for ${episode.episodeId}, serie: ${episode.originalTitle}. Status: ${playbackStatus}`,
    );
  }
  return { ...episode, url: playbackResponse.playable.assets[0].url };
}

export const nrkRadio = {
  search,
  getSeries,
  getEpisode,
  parseSeries,
};

export const forTestingOnly = {
  getSeriesData,
};
