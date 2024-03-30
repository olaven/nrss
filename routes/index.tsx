import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import Footer from "../components/Footer.tsx";
import Header from "../components/Header.tsx";
import Search from "../components/Search.tsx";
import SeriesCard from "../components/SeriesCard.tsx";
import { nrkRadio, SearchResultList } from "../lib/nrk.ts";
import { CSS, render } from "$gfm";

interface HandlerData {
  query: string;
  origin: string;
  rawMarkdown: string;
  result?: SearchResultList;
}

export const handler: Handlers<HandlerData> = {
  async GET(request, ctx) {
    const url = new URL(request.url);
    const query = url.searchParams.get("query");
    let result: SearchResultList | undefined;
    if (query) {
      result = await nrkRadio.search(query);
    }
    const rawMarkdown = await Deno.readTextFile(new URL("../docs/what.md", import.meta.url));
    return ctx.render({ query: query || "", result, origin: url.origin, rawMarkdown });
  },
};

export default function Home({ data }: PageProps<HandlerData>) {
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
        <Header />
        <Search defaultValue={data.query} />
        {data.result
          ? (
            <div className="w-full mx-auto my-4 space-y-4">
              {data.result.map((result) => (
                <SeriesCard
                  serie={result}
                  origin={data.origin}
                />
              ))}
            </div>
          )
          : null}
        <div
          class="markdown-body"
          dangerouslySetInnerHTML={{ __html: render(data?.rawMarkdown) }}
        />
        <Footer />
      </div>
    </>
  );
}
