import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import Search from "../components/Search.tsx"
import { SerieCard } from "../components/SeriesCard.tsx";
import { nrkRadio, Serie } from "../lib/nrk.ts";

interface HandlerData {
    query: string;
    result?: Serie[];
    origin: string;
}

export const handler: Handlers<HandlerData> = {
    async GET(request, ctx) {
        const url = new URL(request.url);
        const query = url.searchParams.get("query");
        let result: Serie[] | undefined;
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
                <title>NRSS</title>
            </Head>
            <div className="p-4 mx-auto max-w-screen-md bg-blue-400">
                <h1 className="text-4xl text-center">NRSS - NRK-podcast som RSS</h1>
                <Search defaultValue={data.query} />
                {data.result ? (
                    <div className="w-1/2 mx-auto my-4">   
                        {data.result.map(result => <SerieCard serie={result} origin={data.origin} />)}
                    </div>
                ) : null}
                <h2 className="text-3xl">Hva er dette?</h2>
                <p>Hei! Denne løsningen er laget som en reaksjon på at statsfinnansierte NRK lukker ned innholdet sitt til sin egen app fremfor å bygge oppunder åpne standarder som RSS. Denne siden er laget i dag (09.03.23), fort og gæli - den er ustabil og kommer til å krasje :) Sjekk gjerne ut <a href="https://github.com/olaven/NRSS/" className="underline">kildekoden</a>. </p>
                <h2 className="text-3xl">Hvordan bruker jeg dette?</h2>
                <p>Søk på NRK-podcasten du vil høre på. Kopier deretter URL-en under bildet. Lim denne inn i akkurat den podcastspilleren du måtte foretrekke!</p>
            </div>
        </>
    );
}
