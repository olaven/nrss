import { Input } from "../components/Input.tsx";

export default function () {
  return (
    <div
      className={"p-4 mx-auto max-w-screen-md text-center"}
    >
      <h1
        className={"text-4xl"}
      >
        Avslutt støtte til NRSS
      </h1>
      <Input
        placeholder={"ditt mobillnummer"}
      >
      </Input>
    </div>
  );
}
