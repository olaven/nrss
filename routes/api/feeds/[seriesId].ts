import { nrkRadio, Serie, Episode } from "../../../lib/nrk.ts"
import { HandlerContext } from "$fresh/server.ts";

import { serialize, tag, declaration } from "https://deno.land/x/serializexml@v0.3.2/mod.ts";

function toItemTag(episode: Episode): string {
    return tag("item", [
        tag("title", episode.title),
        tag("link", episode.url),
        tag("description", episode.description),
        tag("itunes:summary", episode.description),
        tag("guid", episode.id, ["isPermaLink", "false"]),
        tag("pubDate", episode.date),
        tag("enclosure", "", [
            ["url", episode.url],
            ["length", episode.durationInSeconds],
            ["type", "audio/mpeg3"],
        ]),
    ])
}

async function buildFeed(seriesId) {
    const serie = await nrkRadio.getSerieData(seriesId)


    // Quickly adapted from https://raw.githubusercontent.com/olaven/paperpod/1cde9abd3174b26e126aa74fc5a3b63fd078c0fd/packages/converter/src/rss.ts
    return serialize(
        declaration([
            ["version", "1.0"],
            ["encoding", "UTF-8"],
        ]),
        tag(
            "rss",
            [
                tag("channel", [
                    tag("title", serie.title),
                    tag("link", `https://radio.nrk.no/podkast/${serie.id}`),
                    tag(
                        "description",
                        serie.subtitle
                    ),
                    tag("ttl", "60"), //60 minutes
                    tag("image", [
                        tag("url", serie.image.uri),
                        tag("title", serie.title),
                    ]),
                    ...serie.episodes.map(toItemTag),
                ]),
            ],
            [
                ["version", "2.0"],
                ["xmlns:itunes", "http://www.itunes.com/dtds/podcast-1.0.dtd"],
                ["xmlns:content", "http://purl.org/rss/1.0/modules/content/"],
            ]
        )
    );
}

export const handler = async (req: Request, _ctx: HandlerContext): Promise<Response> => {
    const seriesId = _ctx.params.seriesId;
    const feedContent = await buildFeed(seriesId);

    return new Response(feedContent, {
        headers: {
            "Content-Type": "application/xml"
        }
    });
};
