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

## Self-hosting

NRSS can run on any platform that supports Docker or running Deno processes.
This project still runs on the Deno + Fresh runtime; self-hosting support adds
deployment options, not a runtime migration.

### Quick start

Local mode (no Traefik):

```bash
docker-compose up -d nrss
```

Traefik mode (HTTPS + domain routing):

```bash
docker-compose --profile traefik up -d nrss-traefik
```

### Environment variables

- `APP_BASE_URL` (required in production): canonical public URL, e.g. `https://nrss.example.com`.
- `SUPPORT_EMAIL` (required when donations are enabled): contact address shown in donation-related UI.
- `VIPPS_*`: optional; only required if you enable donation endpoints.
- `VIPPS_SYSTEM_NAME` (required when Vipps is enabled): merchant/system name sent to Vipps.

When Vipps variables are missing, donations are disabled by default. Related
routes (`/api/trigger-donation/vipps`, `/donations-success`,
`/donations-cancel`) return `404`.

### Docker

Build and run directly:

```bash
docker build -t nrss .
docker run --rm -p 8000:8000 --env APP_BASE_URL=https://nrss.example.com nrss
```

### Docker Compose + Traefik

The provided `docker-compose.yml` supports two modes.

Local mode (no Traefik):

```bash
docker-compose up -d nrss
```

Traefik mode (HTTPS + domain routing):

```bash
docker-compose --profile traefik up -d nrss-traefik
```

For Traefik mode:

1. Set `APP_BASE_URL` to your public HTTPS URL.
1. Update Traefik router host rule from `nrss.example.com` to your domain.
1. Ensure Traefik and NRSS share the same Docker network.
1. Keep `VIPPS_*` unset unless you explicitly want donations enabled.

Traefik already forwards `X-Forwarded-Host` and `X-Forwarded-Proto`. NRSS uses
`APP_BASE_URL` first, then forwarded request headers, then localhost fallback.

### Container registry

On version tags, GitHub Actions publishes a container image to GHCR using
`.github/workflows/publish-ghcr.yaml`.

Expected image name:

```bash
ghcr.io/<owner>/nrss:<tag>
```

## What is this?

This is made as a reaction that the goverment funded NRK is closing their own
content to their own app instead of building under open standards like RSS.

## Known Problems

- Some clients may not accept a feed hosted over HTTPS only. See @steinarb's workaround [here](https://github.com/olaven/NRSS/issues/5#issuecomment-1488840679) for a possible solution.
- The feeds only provide the latest episodes for a podcast, not the entire archive. I've not yet found any acceptable method of fetching all episodes without getting rate limited by NRK or introducing a storage layer. This is tracked in https://github.com/olaven/NRSS/issues/8.
