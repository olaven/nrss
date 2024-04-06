import { nrkRadio, OriginalEpisode } from "../../../lib/nrk.ts";
import { FreshContext } from "$fresh/server.ts";
import { declaration, serialize, tag } from "https://raw.githubusercontent.com/olaven/serialize-xml/v0.4.0/mod.ts";
import { getHostName } from "../../../utils.ts";
import { SeriesData } from "../../../lib/nrk.ts";

function toItemTag(seriesId: string, episode: OriginalEpisode) {
  const description = episode.titles.subtitle || "";
  return tag("item", [
    tag("title", episode.titles.title),
    tag("link", episode._links.share?.href),
    tag("description", description),
    tag("itunes:summary", description),
    tag("guid", episode.id, [["isPermaLink", "false"]]),
    tag("pubDate", new Date(episode.date).toUTCString()),
    tag("itunes:duration", episode.durationInSeconds.toString()),
    tag("podcast:chapters", "", [
      [
        "url",
        `${getHostName()}/api/feeds/${seriesId}/${episode.episodeId}/chapters`,
      ],
      ["type", "application/json+chapters"],
    ]),
    tag("enclosure", "", [
      ["url", episode.url],
      ["length", episode.durationInSeconds.toString()],
      ["type", "audio/mpeg3"],
    ]),
  ]);
}

function buildFeed(series: SeriesData) {
  const imageUrl = series.squareImage?.at(-1)?.url ?? "";
  const linkValue = `https://radio.nrk.no/podkast/${series.id}`;

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
          tag("title", series.titles.title),
          tag("link", linkValue),
          tag("itunes:author", "NRK"),
          /* serie.category.id does not overlap with Apple's supported categories..
                       These podcast feeds are not going to be indexed in itunes anyways, so
                       a static, valid category is fine. The point is simply to pass third party
                       podcast feed validation.
                       */
          tag("itunes:category", "", [["text", "Government"]]),
          tag("itunes:owner", [
            tag("itunes:name", "NRK"),
            tag("itunes:email", "nrkpodcast@nrk.no"),
          ]),
          tag(
            "description",
            series.titles.subtitle || "",
          ),
          tag("ttl", "60"), //60 minutes
          ...(imageUrl
            ? [
              tag("itunes:image", "", [
                ["href", imageUrl],
              ]),
              tag("image", [
                tag("url", imageUrl),
                tag("title", series.titles.title),
                tag("link", linkValue),
              ]),
            ]
            : []),
          ...series.episodes.map((episode) => toItemTag(series.id, episode)),
        ]),
      ],
      [
        ["version", "2.0"],
        ["xmlns:itunes", "http://www.itunes.com/dtds/podcast-1.0.dtd"],
        ["xmlns:content", "http://purl.org/rss/1.0/modules/content/"],
        ["xmlns:podcast", "https://podcastindex.org/namespace/1.0"],
      ],
    ),
  );
}

export const handler = async (_req: Request, ctx: FreshContext): Promise<Response> => {
  const seriesId = ctx.params.seriesId;
  const series = await nrkRadio.getSerieData(seriesId);
  if (!series) {
    return new Response(`Couldn't find series with seriesId: ${seriesId}`, { status: 404 });
  }
  try {
    const feedContent = buildFeed(series);

    return new Response(feedContent, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Could not generate feed" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
