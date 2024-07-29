import { ButtonLink } from "../components/Button.tsx";
import { Button } from "../components/Button.tsx";
import Header from "../components/Header.tsx";
import { Input } from "../components/Input.tsx";

export default () => {
  return (
    <div className="p-4 mx-auto max-w-screen-md">
      <h1
        className={"bg-orange-200 text-white text-2xl font-semibold p-4 text-center"}
      >
        DEMOSIDE - FUNGERER IKKE
      </h1>
      <Header></Header>

      <div
        className={"max-w-2xl mx-auto px-4 py-8"}
      >
        <h2
          className={"text-2xl font-semibold mb-4"}
        >
          Økonomisk støtte til NRSS
        </h2>
        <p>
          Jeg ønsker at NRSS skal være gratis tilgjengelig for alle. Imidlertid koster det penger og tid å drifte og
          vedlikeholde en nettside. Dersom du har råd til det (og bare da!) setter jeg stor pris på om du vil støtte
          prosjektet med et valgfritt beløp via Vipps.
        </p>

        <form
          className={"mt-6"}
        >
          <Input
            type={"tel"}
            placeholder={"Ditt telefonnummer."}
          >
          </Input>
          <div className={"flex"}>
            <Button
              type={"submit"}
            >
              Støtt NRSS
            </Button>
            <Button
              type={"button"}
            >
              Avslutt eksisterende abonnement
            </Button>
          </div>
          <p
            className={"text-sm"}
          >
            Epost blir utelukkende brukt til å knytte deg til en donasjon, slik at du kan kansellere den senere.
          </p>
        </form>

        <p
          className={"mt-4 font-semibold"}
        >
          Du kan når som helst avslutte abonnementet fra denne siden.
        </p>
        <p
          className={"mt-4"}
        >
          Opplever du problemer med betalingen, eller har du andre spørsmål? Ta{" "}
          <a
            className={"text-blue-600 underline"}
            href={"mailto:olav@sundfoer.com"}
          >
            kontakt på mail
          </a>.
        </p>
      </div>
    </div>
  );
};
