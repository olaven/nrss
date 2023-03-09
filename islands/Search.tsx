
import { Head } from "$fresh/runtime.ts";
import { useState } from "preact/hooks";
import { post, OK } from "https://deno.land/x/kall@v0.1.0/mod.ts";
import { Serie } from "../lib/nrk.ts";
import { SerieCard } from "../components/SeriesCard.tsx";

export default function Search() {

    const [query, setQuery] = useState<string>("");
    const [result, setResult] = useState<Serie[]>([]);

    const onSearch = async (event: any) => {

        const [status, response] = await post<any>("/api/search", {
            query
        });

        setResult(response.series as Serie[])
    }

    return (
        <div className="flex flex-col w-1/2 mx-auto my-4">
            <input
                placeholder="NRK-podcast"
                className="border-2"
                value={query}
                onInput={(event: any) => { setQuery(event.target.value) }} />
            <button
                className="my-2 bg-gray-100"
                onClick={onSearch}>Søk</button>
            <div>
                {result.map(result => <SerieCard serie={result}></SerieCard>)}
            </div>
        </div>
    );
}
