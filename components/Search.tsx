export default function Search(props: { defaultValue: string | null }) {
  return (
    <form className="flex flex-col w-full lg:w-2/3 mx-auto my-4">
      <label className="sr-only" htmlFor="query">Program</label>
      <input
        type="search"
        placeholder="NRK-podcast"
        className="border-2 rounded-md px-2"
        name="query"
        id="query"
        defaultValue={props.defaultValue ?? ""}
      />
      <button type="submit" className="my-2 bg-gray-100 border-2 border-gray-400 rounded-md">
        Søk
      </button>
    </form>
  );
}
