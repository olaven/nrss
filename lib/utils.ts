import { STATUS_CODE } from "$fresh/server.ts";

export function getHostName() {
  const deploymentId = Deno.env.get("DENO_DEPLOYMENT_ID");
  if (deploymentId) {
    return `https://nrss-${deploymentId}.deno.dev`;
  } else {
    const proxyUrl = Deno.env.get("PROXY_URL");
    if (proxyUrl) {
      console.debug(`Using proxy URL ${proxyUrl}`);
      return proxyUrl;
    } else {
      console.debug(`Assuming localhost`);
      return "http://localhost:8000";
    }
  }
}

type EnumValues<T> = T[keyof T];
type Status = EnumValues<typeof STATUS_CODE>;

export function responseJSON(body: unknown | null, status: Status) {
  const stringifiedBody = JSON.stringify(body);
  return response(stringifiedBody, status, "json");
}

export function responseXML(body: string, status: Status) {
  return response(body, status, "xml");
}

function response(body: string, status: number, type: "json" | "xml") {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": `application/${type}`,
    },
  });
}
