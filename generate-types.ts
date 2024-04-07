import openapiTS from "openapi-typescript";

const nrkTypes: { filename: string; url: URL }[] = [
  {
    filename: "./lib/nrk/nrk-search.ts",
    url: new URL("https://psapi.nrk.no/documentation/openapi/search-radio/v1/openapi.yml"),
  },
  {
    filename: "./lib/nrk/nrk-catalog.ts",
    url: new URL("https://psapi.nrk.no/documentation/openapi/programsider-radio/openapi.yml"),
  },
  {
    filename: "./lib/nrk/nrk-playback.ts",
    url: new URL("https://psapi.nrk.no/documentation/openapi/playback/2.0/openapi.json"),
  },
] as const;

async function generateTypes() {
  for (const type of nrkTypes) {
    const contents = await openapiTS(type.url);

    await Deno.writeTextFile(new URL(type.filename, import.meta.url), contents);
  }
}

if (import.meta.main) {
  await generateTypes();
}
