import { PageProps } from "$fresh/server.ts";
import { getAgreement } from "../lib/vipps/vipps.ts";

export const handler: Handlers<Props> = {
  async GET(request, ctx) {
    // TODO: somehow get the agreement ID
    // TODO: implement cancel page

    const agreementId = "123";
    const agreement = await getAgreement(agreementId);
    if (agreement instanceof Error) {
      console.error("Failed to get Vipps agreement", agreement);
      return ctx.redirect("/donations-error");
    }

    return ctx.render({ agreement });
  },
};

export default function ({ data }: PageProps<{
  // TODO: confirm interface when you know it
  agreement: {
    status: string;
    id: string;
  };

  status: string;
}>) {
  return (
    <div className="my-16 text-center flex flex-col items-center  min-h-screen ">
      <h1 className="text-6xl mb-8">
        🙏🌟😊💖
      </h1>
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
