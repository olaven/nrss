import { nrkRadio } from "../../lib/nrk.ts"
import { HandlerContext } from "$fresh/server.ts";


export const handler = async (req: Request, _ctx: HandlerContext): Promise<Response> => {


    const { query } = await req.json();
    const series = await nrkRadio.search(query);

    return new Response(JSON.stringify({ series }), {
        headers: { "Content-Type": "application/json" }
    });
};
