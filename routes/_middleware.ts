import { FreshContext, STATUS_CODE } from "$fresh/server.ts";
import { getHostUrl } from "../lib/utils.ts";

// Cloudflare reports the scheme the visitor actually used, e.g. {"scheme":"http"}.
function visitorScheme(request: Request): string | undefined {
  const cfVisitor = request.headers.get("cf-visitor");
  if (!cfVisitor) return undefined;
  try {
    return JSON.parse(cfVisitor).scheme;
  } catch {
    return undefined;
  }
}

export async function handler(request: Request, ctx: FreshContext) {
  // Redirect plain http to https, so that feeds are always served from the
  // same location as their atom:link rel="self" reference.
  const hostUrl = getHostUrl();
  if (hostUrl.startsWith("https://") && visitorScheme(request) === "http") {
    const url = new URL(request.url);
    const location = `${hostUrl}${url.pathname}${url.search}`;
    return new Response(null, {
      status: STATUS_CODE.MovedPermanently,
      headers: { Location: location },
    });
  }

  return await ctx.next();
}
