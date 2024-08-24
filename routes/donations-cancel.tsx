import { Handlers, PageProps } from "$fresh/server.ts";
import { Button } from "../components/Button.tsx";
import { Input } from "../components/Input.tsx";
import { storage } from "../lib/storage.ts";
import * as vipps from "../lib/vipps/vipps.ts";
import { validateEmail } from "../lib/utils.ts";

type Props = {
  email: string;
  error: string | null;
  cancelled: boolean;
};

export const handler: Handlers<Props> = {
  async GET(request, ctx) {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return ctx.render({ email: null, error: null, cancelled: false });
    }

    if (!validateEmail(email)) {
      console.error("Ugyldig e-post server-side", email);
      return ctx.render({ email: null, error: "Ugyldig e-post", cancelled: false });
    }

    const agreement = await storage.readVippsAgreement({ id: email });
    if (!agreement) {
      console.error("Mangler avtale for e-post", email);
      return ctx.render({ email: null, error: `Ingen abonnement funnet for "${email}"`, cancelled: false });
    }

    const vippsResponse = await vipps.cancelAgreement(agreement.agreementId);
    if (vippsResponse instanceof Error) {
      return ctx.render({ email, error: "Kunne ikke kansellere Vipps-abonnement", cancelled: false });
    }
    await storage.writeVippsAgreement({
      ...agreement,
      revokedAt: new Date(),
    });

    return ctx.render({ email, error: null, cancelled: true });
  },
};

export default function ({ data }: PageProps<Props>) {
  return (
    <div
      className={"p-4 mx-auto max-w-screen-md text-center"}
    >
      <h1
        className={"text-4xl"}
      >
        Avslutt støtte til NRSS
      </h1>
      {data.error && (
        <p className={"text-red-500"}>
          En feil oppsto: "{data.error}". Ta gjerne{" "}
          <a className="text-blue-600 underline" href="mailto:olav@sundfoer.com">
            kontakt på mail
          </a>.
        </p>
      )}
      {data.cancelled && (
        <p>
          Støtten er nå avsluttet. Tusen takk for at du har støttet NRSS!
        </p>
      )}
      {!data.cancelled && (
        <form>
          <Input
            type={"email"}
            placeholder={"din@epost.no"}
            required
            name={"email"}
            id={"email"}
          >
          </Input>
          <Button
            type={"submit"}
          >
            Avslutt
          </Button>
        </form>
      )}
    </div>
  );
}
