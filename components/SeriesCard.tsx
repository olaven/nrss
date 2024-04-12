import CopyButton from "../islands/CopyButton.tsx";
import { SearchResult } from "../lib/nrk/nrk.ts";
import { ButtonLink } from "./Button.tsx";
import IconPodcast from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/brand-apple-podcast.tsx";

export default function SeriesCard(props: { serie: SearchResult; origin: string }) {
  const feedUrl = new URL(`/api/feeds/${props.serie.seriesId}`, props.origin);
  const image = props.serie.images[0];
  return (
    <div className="border-2 border-blue-800 p-4 rounded-lg bg-blue-400">
      <div className="mx-auto h-full w-full space-y-2">
        <h3 className="text-xl font-semibold">{props.serie.title}</h3>
        <p className="text-md">{props.serie.description}</p>
        <img src={image.uri} width={image.width} alt="" />
        <ButtonLink href={`podcast:${feedUrl.toString()}`} className="block flex items-center gap-2">
          <IconPodcast /> Åpne i din podkast-app
        </ButtonLink>
        <div className="w-full flex">
          <CopyButton copyText={feedUrl.toString()} className="whitespace-nowrap flex items-center gap-2">
            Kopier URL
          </CopyButton>
          <pre className="w-full font-mono bg-black text-white select-all p-2 overflow-x-auto">
            {feedUrl.toString()}
          </pre>
        </div>
      </div>
    </div>
  );
}
