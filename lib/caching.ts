import { nrkRadio } from "./nrk/nrk.ts";
import { Series, storage } from "./storage.ts";
import * as datetime from "datetime";

const SYNC_INTERVAL_HOURS = 1;

async function initialFetch(options: { id: string }) {
  const series = await nrkRadio.getSeries(options.id);
  const stored = storage.write(series);
  if (!stored) {
    throw new Error(`Failed to store series ${options.id}`);
  }

  return series;
}

async function updateFetch(existingSeries: Series) {
  const series = await nrkRadio.getSeries(existingSeries.id);
  const newEpisodes = series.episodes.filter((episode) => {
    return !existingSeries.episodes.find((serieEpisode) => serieEpisode.id === episode.id);
  });

  if (newEpisodes.length === 0) {
    return existingSeries;
  }

  const updated = {
    ...existingSeries,
    lastFetch: new Date(),
    /**
     * Since we don't control the API,
     * we should not make assumptions about the order,
     * but rather sort the episode to what we want.
     */
    episodes: [...newEpisodes, ...existingSeries.episodes]
      .sort((a, b) => a.date.getTime() > b.date.getTime() ? -1 : 1),
  };

  const updateSuccessful = await storage.write(updated);
  if (!updateSuccessful) {
    throw new Error(`Failed to update series ${existingSeries.id}`);
  }

  return updated;
}

async function getSeries(options: { id: string }): Promise<Series> {
  const seriesFromStorage = await storage.read(options);

  /**
   * We don't have the feed in storage,
   * and we need to fetch it for the first time.
   */
  if (seriesFromStorage === null) {
    // TODO: schedule a job to fetch the entire backlog https://github.com/olaven/NRSS/issues/24
    return await initialFetch(options);
  }

  const timeSinceLastFetch =
    datetime.difference(seriesFromStorage.lastFetchedAt, new Date(), { units: ["hours"] }).hours;

  // we have the feed in storage and it's not too old
  if (
    seriesFromStorage !== null &&
    timeSinceLastFetch !== null &&
    timeSinceLastFetch !== undefined &&
    timeSinceLastFetch <= SYNC_INTERVAL_HOURS
  ) {
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
