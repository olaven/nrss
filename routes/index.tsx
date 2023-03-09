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
            </div>
        </>
    );
}
