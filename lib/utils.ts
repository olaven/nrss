import { STATUS_CODE } from "$fresh/server.ts";

export function getHostUrl() {
  const deploymentId = Deno.env.get("DENO_DEPLOYMENT_ID");
  const tunnelUrl = Deno.env.get("TUNNEL_URL");
  if (deploymentId) {
    return `https://nrss-${deploymentId}.deno.dev`;
  } else if (tunnelUrl) {
    return tunnelUrl;
  } else {
    return "http://localhost:8000";
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

export const withExpiry = <T>(response: Response, ttlInSeconds: number) => {
  const clonedResponse = response.clone();
  clonedResponse.headers.set("Cache-Control", `max-age=${ttlInSeconds}`);
  clonedResponse.headers.set("Expires", new Date(Date.now() + ttlInSeconds * 1000).toUTCString());
  return clonedResponse;
};

function response(body: string, status: number, type: "json" | "xml") {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": `application/${type}`,
    },
  });
}

export function validateEmail(input: string) {
  input.match(
    // https://emailregex.com/
    // deno-lint-ignore no-control-regex
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
  );

  return !!input;
}
