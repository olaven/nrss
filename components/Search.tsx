export default function Search(props: {defaultValue: string}) {
    return (
        <form className="flex flex-col w-1/2 mx-auto my-4">
            <label className="sr-only" htmlFor="query">Program</label>
            <input placeholder="NRK-podcast" className="border-2" name="query" id="query" defaultValue={props.defaultValue} />
            <button type="submit" className="my-2 bg-gray-100">Søk</button>
        </form>
    );
}
