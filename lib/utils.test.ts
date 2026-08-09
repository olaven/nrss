import { assertEquals, assertNotEquals } from "$std/assert/mod.ts";
import { getHostUrl, responseJSON, responseXML, withExpiry } from "./utils.ts";

const BASE_ENV_KEYS = [
  "APP_BASE_URL",
  "DENO_DEPLOYMENT_ID",
  "TUNNEL_URL",
] as const;

function clearBaseUrlEnv() {
  for (const key of BASE_ENV_KEYS) {
    Deno.env.delete(key);
  }
}

Deno.test("JSON response is stringified", async () => {
  const body = { message: "Hello, World!" };
  const response = responseJSON(body, 200);
  assertEquals(await response.text(), JSON.stringify(body));
});

Deno.test("XML resopnse is _not_ stringified", async () => {
  const body = "<message>Hello, World!</message>";
  const response = responseXML(body, 200);
  const responseBody = await response.text();
  assertEquals(responseBody, body);
  assertNotEquals(responseBody, JSON.stringify(body));
});

Deno.test(
  "Response with cache control returns a response with the correct header",
  () => {
    const response = responseJSON({ message: "Hello, World!" }, 200);
    const cachedResponse = withExpiry(response, 3600);
    assertEquals(cachedResponse.headers.get("Cache-Control"), "max-age=3600");
  },
);

Deno.test(
  "Response with cache control returns the same body as the original",
  async () => {
    const body = { message: "Hello, World!" };
    const response = responseJSON(body, 200);
    const cachedResponse = withExpiry(response, 3600);
    assertEquals(await cachedResponse.text(), await response.text());
  },
);

Deno.test("Response with cache control does not modify the original", () => {
  const response = responseJSON({ message: "Hello, World!" }, 200);
  withExpiry(response, 3600);
  assertEquals(response.headers.get("Cache-Control"), null);
});

Deno.test(
  "Response with cache control returns the correct number of seconds",
  () => {
    const response = responseJSON({ message: "Hello, World!" }, 200);
    const ttlInSeconds = 1234;
    const cachedResponse = withExpiry(response, ttlInSeconds);
    assertEquals(
      cachedResponse.headers.get("Cache-Control"),
      `max-age=${ttlInSeconds}`,
    );
  },
);

Deno.test("getHostUrl prefers APP_BASE_URL", () => {
  clearBaseUrlEnv();
  Deno.env.set("APP_BASE_URL", "https://example.com/");

  assertEquals(getHostUrl(), "https://example.com");

  clearBaseUrlEnv();
});

Deno.test("getHostUrl uses forwarded headers when request is available", () => {
  clearBaseUrlEnv();
  const request = new Request("http://localhost:8000", {
    headers: {
      "x-forwarded-host": "nrss.example.com",
      "x-forwarded-proto": "https",
    },
  });

  assertEquals(getHostUrl(request), "https://nrss.example.com");

  clearBaseUrlEnv();
});

Deno.test(
  "getHostUrl uses host header when forwarded headers are missing",
  () => {
    clearBaseUrlEnv();
    const request = new Request("http://localhost:8000", {
      headers: {
        host: "nrss.example.com",
      },
    });

    assertEquals(getHostUrl(request), "https://nrss.example.com");

    clearBaseUrlEnv();
  },
);

Deno.test("getHostUrl falls back to localhost default", () => {
  clearBaseUrlEnv();
  assertEquals(getHostUrl(), "http://localhost:8000");
});
