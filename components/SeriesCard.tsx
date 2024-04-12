import CopyButton from "../islands/CopyButton.tsx";
import { SearchResult } from "../lib/nrk/nrk.ts";

export default function SeriesCard(props: { serie: SearchResult; origin: string }) {
  const feedUrl = new URL(`/api/feeds/${props.serie.seriesId}`, props.origin);
  const image = props.serie.images[0];
  return (
    <div className="border-2 border-blue-800 p-4 rounded-lg bg-blue-400">
      <div className="mx-auto h-full w-full space-y-2">
        <h3 className="text-xl font-semibold">{props.serie.title}</h3>
        <p className="text-md">{props.serie.description}</p>
        <img src={image.uri} width={image.width} alt="" />
        <a
          className="block w-max bg-blue-100 text-black p-2 border-black border"
          href={`podcast:${feedUrl.toString()}`}
        >
          📻 Åpne i din podkast-app
        </a>
        <div className="">
          <code className="font-mono bg-black text-white select-all p-2">{feedUrl.toString()}</code>
          <CopyButton text={feedUrl.toString()}>
            Kopier URL
          </CopyButton>
        </div>
      </div>
    </div>
  );
}
