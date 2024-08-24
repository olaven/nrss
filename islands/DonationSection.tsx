import { useEffect, useState } from "preact/hooks";
import { Input } from "../components/Input.tsx";
import { validateEmail } from "../lib/utils.ts";

export const DonationSection = function () {
  const [emailInput, setEmailInput] = useState<string>("");
  const [emailValid, setEmailValid] = useState(false);

  useEffect(() => {
    const valid = validateEmail(emailInput);
    setEmailValid(!!valid);
  }, [emailInput]);

  return (
    <>
      <script
        async
        type="text/javascript"
        src="https://checkout.vipps.no/checkout-button/v1/vipps-checkout-button.js"
      >
      </script>
      <div className="max-w mx-auto py-4">
        <h2 className="text-2xl font-semibold mb-4">
          Økonomisk Støtte
        </h2>
        <p>
          Jeg ønsker at NRSS skal være gratis tilgjengelig for alle. Imidlertid koster det penger og tid å drifte og
          vedlikeholde en nettside. Dersom du har råd til det (og bare da!) setter jeg stor pris på om du vil støtte
          prosjektet med et valgfritt, månedlig beløp via Vipps.
        </p>

        <div className="justify-center my-8">
          <form className={"flex"}>
            <Input
              type={"email"}
              placeholder={"din@epost.no"}
              required
              onInput={(e) => {
                setEmailInput(e.currentTarget.value);
              }}
            >
            </Input>
            <a
              // don't navigate if email is not valid
              href={emailInput ? `/api/trigger-donation/vipps?email=${emailInput}` : undefined}
              onClick={(e) => {
                if (!emailValid) {
                  e.preventDefault();
                }
              }}
            >
              {/* @ts-ignore */}
              <vipps-mobilepay-button
                type="submit"
                brand="vipps"
                language="no"
                variant="primary"
                rounded="false"
                verb="pay"
                stretched="true"
                branded="true"
                loading="false"
              >
                {/* @ts-ignore */}
              </vipps-mobilepay-button>
            </a>
          </form>
          <p
            className={"text-sm text-gray-500"}
          >
            Eposten brukes utelukkende som referanse dersom du ønsker å avslutte støtten. Du kommer ikke til å motta
            noen eposter.
          </p>
        </div>

        <p>
          <b>
            Du kan når som helst avslutte støtten fra{" "}
            <a className="text-blue-600 underline" href="/donations-cancel">
              denne siden
            </a>.
          </b>
        </p>

        <p className="mt-4">
          Opplever du problemer med betalingen, eller har du andre spørsmål? Ta{" "}
          <a className="text-blue-600 underline" href="mailto:olav@sundfoer.com">
            kontakt på mail
          </a>.
        </p>
      </div>
    </>
  );
};
