import { get, OK } from "https://deno.land/x/kall@v0.1.0/mod.ts";

// incomplete type of Series 
export type Serie = {
    id: string, //random id 
    seriesId: string, // readable id
    title: string,
    description: string,
    images: any,
}

// incomplete type of Episode
export type Episode = {
    id: string,
    episodeId: string,
    url: string,
    titles: {
        title: string,
        description: string,
    },
    durationInSeconds: number,
    date: string,
}

async function withDownloadLink(withoutUrl: Omit<Episode, "url">) {

    // getting stream link
    const [playbackStatus, playbackResponse] = await get(`https://psapi.nrk.no/playback/manifest/podcast/${withoutUrl.episodeId}`)

    if (playbackStatus === OK) {

        const url = playbackResponse.playable.assets[0].url;
        return {
            ...withoutUrl, url
        }
    } else {
        throw `Error getting downloadLink for ${withoutUrl.episodeId}`
    }
}

export const nrkRadio = {
    search: async (query: string): Promise<Serie[]> => {
        const [status, response] = await get(`https://psapi.nrk.no/radio/search/search?q=${query}`);
        if (status === OK) {
            const series = response.results.series.results
            return series as Serie[];
        } else {
            throw `Something went wrong with ${query} - got status ${status}`
        }
    },
    getSerieData: async (seriesId: string) => {

        const [
            [episodeStatus, episodeResponse],
            [seriesStatus, serieResponse],
        ] = await Promise.all([
            get(`https://psapi.nrk.no/radio/catalog/podcast/${seriesId}/episodes`),
            get(`https://psapi.nrk.no/radio/catalog/podcast/${seriesId}`)
        ]);


        if (episodeStatus === OK && seriesStatus === OK) {

            const episodes: Episode[] = await Promise.all(episodeResponse._embedded.episodes.map(withDownloadLink));

            return {
                id: serieResponse.series.id,
                title: serieResponse.series.titles.title,
                subtitle: serieResponse.series.titles.subtitle,
                image: serieResponse.series.image[1],
                episodes,
            }

        } else {
            throw `Error getting episodes for ${seriesId}: EpisodeStatus: ${episodeStatus}. SerieStatus: ${seriesStatus}`
        }

    }
}

const [dynga] = await nrkRadio.search("Dynga");
const info = await nrkRadio.getSerieData(dynga.seriesId);
