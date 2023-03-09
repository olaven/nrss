import { get, OK } from "https://deno.land/x/kall@v0.1.0/mod.ts";

// incomplete type of Series 
type Series = {
    id: string, //random id 
    seriesId: string, // readable id
    title: string,
    description: string,
    images: any,
}

// incomplete type of Episode
type Episode = {
    id: string,
    episodeId: string,
    url: string,
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

const nrkRadio = {
    search: async (query: string): Promise<Series[]> => {
        const [status, response] = await get(`https://psapi.nrk.no/radio/search/search?q=${query}`);
        if (status === OK) {
            const series = response.results.series.results
            console.log("SERIES TYPES ", series)
            return series as Series[];
        } else {
            throw `Something went wrong with ${query} - got status ${status}`
        }
    },
    getEpisodes: async (seriesId: string) => {
        const [status, response] = await get(`https://psapi.nrk.no/radio/catalog/podcast/${seriesId}/episodes`);

        if (status === OK) {
            const episodes = response._embedded.episodes;
            return await Promise.all(episodes.map(withDownloadLink))

        } else {
            throw `Error getting episodes for ${seriesId}: Status: ${status}`
        }

    },
    streamEpisode: async (id: string) => {
        // not sure how to do this
        `https://nrk-od-43.akamaized.net/world/1639243/0/hls/${id}/playlist.m3u8?bw_low=32&bw_high=194`
    }
}


const [serie] = await nrkRadio.search("kladden");
const episodes = await nrkRadio.getEpisodes(serie.seriesId)
console.log("Episodes", episodes)
