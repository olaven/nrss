# NRSS - RSS feeds for NRK's podcasts

⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️

**OBS**: Tjenesten er nede nå pga. endringer hos hostingtjenesten jeg bruker. Jeg jobber med å få et bedre alternativ på beina, men jeg har dessverre ikke tid til å gjøre dette før om noen uker. I mellomtiden er du velkommen til å kjøre tjenesten selv i henhold til [lisensen](./LICENSE). 

⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️

Live version: [nrss.deno.dev](https://nrss.deno.dev/)

A webapp built with Deno's [Fresh](https://fresh.deno.dev/) that generates
public accessible RSS-feeds for their produced podcasts via their
[API](https://psapi.nrk.no/documentation/).

## Local development

1. [Install Deno](https://deno.land/manual/getting_started/installation)
1. `cp .env.example .env`
1. Run the app: `deno task start`
1. Open [localhost:8000](http://localhost:8000) in your browser

## What is this?

This is made as a reaction that the goverment funded NRK is closing their own
content to their own app instead of building under open standards like RSS.

## Known Problems

- Some clients may not accept a feed hosted over HTTPS only. See @steinarb's workaround [here](https://github.com/olaven/NRSS/issues/5#issuecomment-1488840679) for a possible solution.
- The feeds only provide the latest episodes for a podcast, not the entire archive. I've not yet found any acceptable method of fetching all episodes without getting rate limited by NRK or introducing a storage layer. This is tracked in https://github.com/olaven/NRSS/issues/8.
