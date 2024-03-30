import config from "../deno.json" with { type: "json" };

export default function Footer() {
  return (
    <div className="mt-4 border-t-2 pt-4">
      <a class="text-blue-500 hover:underline" href={config.source}>Kildekode</a>
    </div>
  );
}
