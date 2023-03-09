import { Serie } from "../lib/nrk.ts"

export function SerieCard(props: { serie: Serie }) {

    return <div className="border-2 my-2 mx-4">
        <h2 className="text-4xl">{props.serie.title}</h2>
        <p className="text-2xl">{props.serie.description}</p>
        <img src={props.serie.images[0].uri} />
        <p>
            Feed: {location.hostname}{`/api/feeds/${props.serie.seriesId}`}
        </p>
    </div >;
}
