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

export function validateEmail(input: string) {
  input.match(
    // https://emailregex.com/
    // deno-lint-ignore no-control-regex
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
  );

  return !!input;
}
