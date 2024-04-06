import * as datetime from "datetime"
import { Series } from "./storage.ts"

const UPDATE_INTERVAL_HOURS = 1;
function getAction(options: {
    existingSeries: Series | null,
}) {
    const { existingSeries } = options;
    if (existingSeries === null) {
        return "INITIAL_FETCH";
    }

    const timeSinceLastFetch = datetime.difference(
        new Date(),
        existingSeries.lastFetched,
        {
            units: ["hours"],
        }
    )

    if (timeSinceLastFetch.hours &&
        timeSinceLastFetch.hours > UPDATE_INTERVAL_HOURS) {
        return "UPDATE";
    }

    return "RETURN_AS_IS";
}

