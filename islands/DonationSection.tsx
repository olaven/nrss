import { useEffect, useState } from "preact/hooks";
import { Input } from "../components/Input.tsx";

export const DonationSection = function () {
  const [emailInput, setEmailInput] = useState<string>("");
  const [emailValid, setEmailValid] = useState(false);

  useEffect(() => {
    const valid = emailInput.match(
      // https://emailregex.com/
      // deno-lint-ignore no-control-regex
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
    );
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
              href={emailInput ? "/api/trigger-donation/vipps" : undefined}
              onClick={(e) => {
                if (!emailValid) {
                  e.preventDefault();
                }
              }}
            >
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
              </vipps-mobilepay-button>
            </a>
            valid: {emailValid.toString()}
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
