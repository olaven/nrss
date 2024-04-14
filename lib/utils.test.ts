import { assertEquals, assertNotEquals } from "$std/assert/mod.ts";
import { responseJSON, responseXML } from "./utils.ts";

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
