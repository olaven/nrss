import { Handlers } from "$fresh/server.ts";
import { storage } from "../lib/storage.ts";
import { validateEmail } from "../lib/utils.ts";
import { isVippsEnabled } from "../lib/vipps/vipps.ts";

export const handler: Handlers = {
  async GET(request, ctx) {
    if (!isVippsEnabled()) {
      return new Response("Not Found", { status: 404 });
    }

    const url = new URL(request.url);
    const urlEncodedEmail = url.searchParams.get("urlEncodedEmail");
    const email = urlEncodedEmail ? decodeURIComponent(urlEncodedEmail) : null;

    if (!email) {
      console.error("Missing email in query params", request.url);
      return Response.redirect("/donations-error");
    }

    if (!validateEmail(email)) {
      console.error("Invalid email server side", email);
      return Response.redirect("/donations-error");
    }

    const agreement = await storage.readVippsAgreement({ id: email });
    if (!agreement) {
      console.error("Missing agreement for email", email);
      return Response.redirect("/donations-error");
    }

    await storage.writeVippsAgreement({
      ...agreement,
      validAt: new Date(),
    });

    return ctx.render({});
  },
};

export default function () {
  return (
    <div className="my-16 text-center flex flex-col items-center  min-h-screen ">
      <h1 className="text-6xl mb-8">🙏🌟😊💖</h1>
      <p className="text-4xl mb-4">
        Tusen takk! Jeg er veldig takknemlig for all støtte.
      </p>
      <p>
        <a className="text-blue-600 underline" href="/">
          Gå tilbake til forsiden
        </a>
      </p>
    </div>
  );
}
