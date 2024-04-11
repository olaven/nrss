import { STATUS_CODE } from "$fresh/server.ts";

export function getHostName() {
  const deploymentId = Deno.env.get("DENO_DEPLOYMENT_ID");
  if (deploymentId) {
    return `https://nrss-${deploymentId}.deno.dev`;
  } else {
    // assume env
    return "http://localhost:8000";
  }
}

type EnumValues<T> = T[keyof T];
type Status = EnumValues<typeof STATUS_CODE>;

export function responseJSON(body: unknown | null, status: Status) {
  return response(body, status, "json");
}

export function responseXML(body: unknown | null, status: Status) {
  return response(body, status, "xml");
}

function response(body: unknown | null, status: number, type: "json" | "xml") {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": `application/${type}`,
    },
  });
}
