import { nrkRadio } from "./nrk/nrk.ts";
import { Series } from "./storage.ts";

type NrkSerieData = Awaited<ReturnType<typeof nrkRadio.getSerieData>>;
function series(nrkSeries: NrkSerieData): Series {
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
        link: episode._links.share?.href ?? "",
        date: new Date(episode.date),
        durationInSeconds: episode.durationInSeconds,
      };
    }),
  };
}

export const parse = {
  series,
};
