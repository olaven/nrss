import config from "../deno.json" with { type: "json" };

export default function Footer() {
  return (
    <div className={"p-4 mx-auto max-w-screen-md"}>
      <div className="mt-4 border-t-2 pt-4">
        <a class="text-blue-600 hover:underline" href={config.source}>Kildekode</a>
        <p>
          Krets AS - 922 739 625
        </p>
      </div>
    </div>
  );
}
