import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import Search from "../components/Search.tsx";
import SeriesCard from "../components/SeriesCard.tsx";
import { CSS, render } from "$gfm";
import { nrkRadio, NrkSearchResultList } from "../lib/nrk/nrk.ts";
import { DonationSection } from "../islands/DonationSection.tsx";

type Props = {
  query: string | null;
  rawMarkdown: string;
  result?: NrkSearchResultList | null;
};

export const handler: Handlers<Props> = {
  async GET(request, ctx) {
    const url = new URL(request.url);
    const query = url.searchParams.get("query");
    let result: Props["result"];
    if (query) {
      result = await nrkRadio.search(query);
    }
    const rawMarkdown = await Deno.readTextFile(new URL("../docs/what.md", import.meta.url));
    return ctx.render({ query, result, rawMarkdown });
  },
};

export default function Home({ data, url }: PageProps<Props>) {
  return (
    <>
      <Head>
        <title>{data.query ? `Søk: ${data.query} - ` : ""}NRSS</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          ${CSS}
          .markdown-body {
            background-color: rgb(248 250 252);
          }
          `,
          }}
        />
      </Head>
      <div className="p-4 mx-auto max-w-screen-md">
        <Search defaultValue={data.query} />
        <SearchResult result={data.result} origin={url.origin} />
        <div
          class="markdown-body"
          dangerouslySetInnerHTML={{ __html: render(data?.rawMarkdown) }}
        />
        <DonationSection />
      </div>
    </>
  );
}

function SearchResult({ result, origin }: { result: Props["result"]; origin: string }) {
  if (!result) {
    return null;
  }
  if (result.length === 0) {
    return <h2 className="text-2xl font-semibold mb-8">Ingen resultater</h2>;
  }
  return (
    <div className="w-full mx-auto my-4 space-y-4">
      <h2 className="text-2xl font-semibold">Søkeresultat: {result.length} treff</h2>
      {result.map((result) => (
        <SeriesCard
          serie={result}
          origin={origin}
        />
      ))}
    </div>
  );
}
