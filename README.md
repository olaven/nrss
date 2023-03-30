# NRSS - RSS Feeds for NRK sin podcaster  

https://nrss.deno.dev/

## Local devlopment
install Deno
https://deno.land/manual/getting_started/installation

### Run the application
``` shell
deno task start
```
Open http://localhost:8000/ to view it in the browser


## Known Problems 
- Some clients may not accept a feed hosted over HTTPS only. See @steinarb's workaround [here](https://github.com/olaven/NRSS/issues/5#issuecomment-1488840679) for a possible solution. 
- The feeds only provide the latest episodes for a podcast, not the entire archive. I've not yet found any acceptable method of fetching all episodes without getting rate limited by NRK or introducing a storage layer. This is tracked in https://github.com/olaven/NRSS/issues/8.
