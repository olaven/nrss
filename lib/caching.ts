import { nrkRadio } from "./nrk/nrk.ts";
import { Series, storage } from "./storage.ts";
import * as datetime from "$std/datetime/mod.ts";
import { Episode } from "./storage.ts";

const SYNC_INTERVAL_HOURS = 1;

async function initialFetch(options: { id: string }): Promise<Series | null> {
  const series = await nrkRadio.getSeries(options.id);
  if (!series) {
    return null;
  }
  const stored = storage.write(series);
  if (!stored) {
    console.error(`Failed to store series ${options.id}`);
    return null;
  }

  return series;
}

type UpdatedSeries = {
  lastFetch: Date;
  episodes: Episode[];
} & Series;
async function updateFetch(existingSeries: Series): Promise<UpdatedSeries | null> {
  const series = await nrkRadio.getSeries(existingSeries.id);
  if (!series) {
    return null;
  }
  const newEpisodes = series.episodes.filter((episode) => {
    return !existingSeries.episodes.find((serieEpisode) => serieEpisode.id === episode.id);
  });

  /**
   * Since we don't control the API,
   * we should not make assumptions about the order,
   * but rather sort the episode to what we want.
   */
  const episodesSortedDescending = [...newEpisodes, ...existingSeries.episodes]
    .sort((a, b) => a.date.getTime() > b.date.getTime() ? -1 : 1);

  const updated = {
    ...existingSeries,
    lastFetch: new Date(),
    episodes: episodesSortedDescending,
  };

  const updateSuccessful = await storage.write(updated);
  if (!updateSuccessful) {
    console.log(`Failed to update series ${existingSeries.id}`);
    return null;
  }

  return updated;
}

function getTimeSinceLastFetch(inputDate: Date, againstDate = new Date()): number | null {
  return datetime.difference(inputDate, againstDate, { units: ["hours"] }).hours ?? null;
}

function isSeriesFromStorageNew(
  seriesFromStorage: Series,
  syncInterval = SYNC_INTERVAL_HOURS,
  timeSinceLastFetch = getTimeSinceLastFetch(seriesFromStorage.lastFetchedAt),
) {
  return !Number.isNaN(timeSinceLastFetch) &&
    seriesFromStorage !== null &&
    timeSinceLastFetch !== null &&
    timeSinceLastFetch !== undefined &&
    timeSinceLastFetch <= syncInterval;
}

async function getSeries(options: { id: string }): Promise<Series | null> {
  const seriesFromStorage = await storage.read(options);

  /**
   * We don't have the feed in storage,
   * and we need to fetch it for the first time.
   */
  if (seriesFromStorage === null) {
    // TODO: schedule a job to fetch the entire backlog https://github.com/olaven/NRSS/issues/24
    return await initialFetch(options);
  }

  // we have the feed in storage and it's not too old
  if (isSeriesFromStorageNew(seriesFromStorage)) {
    return seriesFromStorage;
  }

  /**
   * We have the feed in storage, but it's too old
   * and needs to be refreshed.
   */
  const updatedSeries = await updateFetch(seriesFromStorage);
  return updatedSeries;
}

export const caching = {
  getSeries,
};

export const forTestingOnly = {
  getTimeSinceLastFetch,
  isSeriesFromStorageNew,
};
