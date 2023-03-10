import { Serie } from "../lib/nrk.ts"
import CopyButton from "../islands/CopyButton.tsx";

export function SerieCard(props: { serie: Serie, origin: string }) {
    const feedUrl = new URL(`/api/feeds/${props.serie.seriesId}`, props.origin);

    console.log(feedUrl.toString())

    return (
        <div className="border-2 my-2 p-2">
            <div className="mx-auto h-full w-full">
                <h2 className="text-xl">{props.serie.title}</h2>
                <p className="text-md">{props.serie.description}</p>
                <img src={props.serie.images[0].uri} />
                <CopyButton text={feedUrl.toString()}>
                    Kopier URL
                </CopyButton>
            </div>
        </div >
    );
}
