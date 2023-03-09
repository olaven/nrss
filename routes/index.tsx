import { Head } from "$fresh/runtime.ts";
import { useState } from "preact/hooks";
import { post, OK } from "https://deno.land/x/kall@v0.1.0/mod.ts";
import Search from "../islands/Search.tsx"

export default function Home() {

    return (
        <>
            <Head>
                <title>NRSS</title>
            </Head>
            <div className="p-4 mx-auto max-w-screen-md bg-blue-400">
                <h1 className="text-4xl text-center">NRSS - NRK-podcast som RSS</h1>
                <Search />
                <h2 className="text-3xl">Hva er dette?</h2>
                <p>Hei! Denne løsningen er laget som en reaksjon på at statsfinnansierte NRK lukker ned innholdet sitt til sin egen app fremfor å bygge oppunder åpne standarder som RSS. Denne siden er laget i dag (09.03.23), fort og gæli - den er ustabil og kommer til å krasje :) Sjekk gjerne ut <a href="https://github.com/olaven/NRSS/" className="underline">kildekoden</a>. </p>
                <h2 className="text-3xl">Hvordan bruker jeg dette?</h2>
                <p>Søk på NRK-podcasten du vil høre på. Kopier deretter URL-en under bildet. Lim denne inn i akkurat den podcastspilleren du måtte foretrekke!</p>
            </div>
        </>
    );
}
