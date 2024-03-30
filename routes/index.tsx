import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import Search from "../components/Search.tsx";
import SeriesCard from "../components/SeriesCard.tsx";
import { nrkRadio, SearchResultList } from "../lib/nrk.ts";

interface HandlerData {
  query: string;
  result?: SearchResultList;
  origin: string;
}

export const handler: Handlers<HandlerData> = {
  async GET(request, ctx) {
    const url = new URL(request.url);
    const query = url.searchParams.get("query");
    let result: SearchResultList | undefined;
    if (query) {
      result = await nrkRadio.search(query);
    }
    return ctx.render({ query: query || "", result, origin: url.origin });
  },
};

export default function Home({ data }: PageProps<HandlerData>) {
  return (
    <>
      <Head>
        <title>{data.query ? `Søk: ${data.query} - ` : ""}NRSS</title>
      </Head>
      <div className="p-4 mx-auto max-w-screen-md bg-blue-400">
        <div className="text-center">
          <h1 className="text-2xl lg:text-3xl">NRSS</h1>
          <h2 className="lg:text-xl">NRK-podcast som RSS</h2>
        </div>
        <Search defaultValue={data.query} />
        {data.result
          ? (
            <div className="w-full mx-auto my-4">
              {data.result.map((result) => (
                <SeriesCard
                  serie={result}
                  origin={data.origin}
                />
              ))}
            </div>
          )
          : null}
        <h2 className="text-3xl">Hva er dette?</h2>
        <p>
          Hei! Denne løsningen er laget som en reaksjon på at statsfinansierte NRK lukker ned innholdet sitt til sin
          egen app fremfor å bygge oppunder åpne standarder som RSS. Denne siden er laget fort og gæli - den er ustabil
          og kommer til å krasje :) Sjekk gjerne ut{" "}
          <a
            href="https://github.com/olaven/NRSS/"
            className="underline"
          >
            kildekoden
          </a>.
        </p>
        <h2 className="text-3xl">Hvordan bruker jeg dette?</h2>
        <p>
          Søk på NRK-podcasten du vil høre på. Kopier deretter URL-en under bildet. Lim denne inn i akkurat den
          podcastspilleren du måtte foretrekke! Se{" "}
          <a
            className="underline"
            href="https://help.omnystudio.com/en/articles/5222518-podcast-apps-that-support-add-rss-feed"
          >
            her
          </a>{" "}
          for en oversikt over hvordan det gjøres i populære podcastspillere.
        </p>
      </div>
    </>
  );
}
