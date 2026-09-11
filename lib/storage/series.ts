import { query } from "./database.ts";

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

type SeriesRow = {
  id: string;
  title: string;
  subtitle: string | null;
  link: string;
  image_url: string;
  last_fetched_at: Date;
  episodes: Episode[];
};

function rowToSeries(row: SeriesRow): Series {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    link: row.link,
    imageUrl: row.image_url,
    lastFetchedAt: new Date(row.last_fetched_at),
    // pg parses jsonb columns into plain objects, so dates inside come back as strings.
    episodes: row.episodes.map((episode) => ({
      ...episode,
      date: new Date(episode.date),
    })),
  };
}

export async function readSeries(series: { id: string }): Promise<Series | null> {
  const result = await query<SeriesRow>(
    `select id, title, subtitle, link, image_url, last_fetched_at, episodes
     from series
     where id = $1`,
    [series.id],
  );

  const row = result.rows[0];
  return row ? rowToSeries(row) : null;
}

export async function writeSeries(series: Series): Promise<boolean> {
  const result = await query(
    `insert into series (id, title, subtitle, link, image_url, last_fetched_at, episodes)
     values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (id) do update set
       title = excluded.title,
       subtitle = excluded.subtitle,
       link = excluded.link,
       image_url = excluded.image_url,
       last_fetched_at = excluded.last_fetched_at,
       episodes = excluded.episodes`,
    [
      series.id,
      series.title,
      series.subtitle,
      series.link,
      series.imageUrl,
      series.lastFetchedAt,
      JSON.stringify(series.episodes),
    ],
  );

  return result.rowCount === 1;
}
