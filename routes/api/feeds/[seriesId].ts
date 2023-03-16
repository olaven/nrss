import { nrkRadio, Episode } from "../../../lib/nrk.ts"
import { HandlerContext } from "$fresh/server.ts";

import { serialize, tag, declaration } from "https://raw.githubusercontent.com/olaven/serialize-xml/v0.4.0/mod.ts";

function toItemTag(episode: Episode) {
    const description = episode.titles.subtitle || "";
    return tag("item", [
        tag("title", episode.titles.title),
        tag("link", episode.url),
        tag("description", description),
        tag("itunes:summary", description),
        tag("guid", episode.id, [["isPermaLink", "false"]]),
        tag("pubDate", new Date(episode.date).toUTCString()),
        tag("itunes:duration", episode.durationInSeconds.toString()),
        tag("enclosure", "", [
            ["url", episode.url],
            ["length", episode.durationInSeconds.toString()],
            ["type", "audio/mpeg3"],
        ]),
    ])
}

async function buildFeed(seriesId: string) {
    const serie = await nrkRadio.getSerieData(seriesId)
    const imageUrl = serie.squareImage.at(-1)?.url;
    const linkValue = `https://radio.nrk.no/podkast/${serie.id}`;

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
                    tag("title", serie.titles.title),
                    tag("link", linkValue),
                    tag("itunes:author", "NRK"),
                    /* serie.category.id does not overlap with Apple's supported categories..
                       These podcast feeds are not going to be indexed in itunes anyways, so
                       a static, valid category is fine. The point is simply to pass third party
                       podcast feed validation. 
                       */
                    tag("itunes:category", "", [["text", "Government"]]),
                    tag("itunes:owner",
                        [
                            tag("itunes:name", "NRK"),
                            tag("itunes:email", "nrkpodcast@nrk.no")
                        ]
                    ),
                    tag(
                        "description",
                        serie.titles.subtitle || ""
                    ),
                    tag("ttl", "60"), //60 minutes
                    ...(imageUrl ? [
                        tag("itunes:image", "", [
                            ["href", imageUrl],
                        ]),
                        tag("image", [
                            tag("url", imageUrl),
                            tag("title", serie.titles.title),
                            tag("link", linkValue),
                        ])
                    ] : []),
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
            "Content-Type": "application/rss+xml"
        }
    });
};
