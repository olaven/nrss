export type Episode = {
  id: string;
  title: string;
  subtitle: string | null;
  url: string;
  shareLink: string;
  date: Date;
  durationInSeconds: number;
};

export type Series = {
  id: string;
  title: string;
  subtitle: string | null;
  link: string;
  imageUrl: string;
  lastFetchedAt: Date;
  episodes: Episode[];
};

const kv = await Deno.openKv();

function seriesKey(series: { id: string }) {
  return ["series", series.id];
}

async function readSeries(options: { id: string }): Promise<Series | null> {
  const { id } = options;
  const key = seriesKey({ id });
  const read = await kv.get<Series>(key);
  return read.value;
}

async function writeSeries(series: Series): Promise<boolean> {
  const key = seriesKey(series);
  const stored = await kv.set(key, series);
  return stored.ok;
}

export const storage = {
  readSeries,
  writeSeries,
};
