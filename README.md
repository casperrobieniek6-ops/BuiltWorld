# Built World

Built World is a five-round daily quiz about architecture, infrastructure, and urban planning. A new edition begins at midnight Eastern. Each run keeps the edition it opened with.

## Play locally

Run `python3 -m http.server 8000` from this repository root, then open [localhost:8000](http://localhost:8000). In the hosted-site checkout, serve the `dist` directory instead. The checked-in game includes a compiled content snapshot. The high-speed rail scene uses Three.js under its bundled MIT license, with an animated Canvas fallback.

## Build and schedule content

- Run `python3 tools/daily_content.py build` to compile both large answer banks. The first build downloads open source tables and caches them locally. Use `--refresh` to fetch new snapshots, or `--airports PATH --rail PATH` to compile from archived CSVs.
- The default rotation mixes two core rounds, a rail special, an infrastructure topic, and one large airport or British National Rail round. Editions before November 11, 2026 use the previous rotation. The editorial banks live in `editorial-banks.js`. Date overrides in [content/schedule.json](content/schedule.json) take exactly five distinct bank IDs. The built-in IDs are `homes`, `tunnels`, `stormwater`, `planning`, `bridges`, `airports`, and `rail`.
- To add new banks in bulk, copy the [bank definitions](content/banks.example.json) and [answer CSV](content/answers.example.csv). Run `python3 tools/daily_content.py build --banks path/to/banks.json --csv path/to/answers.csv`. Repeat `--csv` for more files. Each row has a bank ID, a canonical answer, pipe-separated aliases, and 10, 20, or 40 points. Duplicate canonical rows fail the build, and aliases shared by multiple answers are removed from the accepted alias list. Use a date override to put a custom bank into the rotation.
- Review imported answer scope and sample answers before scheduling a new bank. The compiler scales with the CSV input. The starter rotation reuses published banks on different dates. It does not invent new answers for each day.

## Queue Adobe Stock photos

1. Run `python3 tools/daily_content.py adobe-brief YYYY-MM-DD` for one Adobe Stock search link per cover and round slot. Pass the same `--schedule` and `--banks` options as the build if you use custom content.
2. Sign into Adobe through Penn State. Review the asset license and intended use, then license and download the approved image in Adobe. The search brief can also reopen a selected asset by ID.
3. Keep the working schedule and license records in a private location such as `.private/`. See [the photo schedule example](content/photo-schedule.example.json). Store the web-sized photo under `photos/YYYY-MM-DD/` relative to the served directory. Record the asset ID, alt text, confirmed credit, path, and licensing approval. Build the private site with `--schedule .private/schedule.json --include-photos`. The compiler verifies that the local file is present and the record is marked licensed.
4. Upload approved web copies only through the private hosting workflow. For the existing private Sites source workflow, explicitly stage only those approved files under `dist/photos/` so they enter the private deployment package. Keep the public GitHub build generated without `--include-photos`; never sync private manifests, images, or license receipts to that repository.

Adobe search links require no integration. Direct programmatic Adobe Stock API licensing requires Stock for Enterprise access and authenticated credentials. The editor workflow leaves licensing and credit use with the Adobe account holder.

## Data and release

- Airport data from [OurAirports](https://ourairports.com/data/), public domain. Eligible rows are scheduled land airports with unique IATA codes.
- Rail entries use the [Office of Rail and Road, Table 1410, April 2024 to March 2025](https://dataportal.orr.gov.uk/station-usage), published by ORR. Points are based on reported station usage, and names and codes are transformed for game scoring. See the [Open Government Licence](https://www.nationalarchives.gov.uk/doc/open-government-licence/).
- Footer placeholders reserve space for donations, support, feedback, privacy, terms, accessibility, and licensing/credits. These are labels until the corresponding pages or destinations are ready.

## Rail Pass preview

Unlimited reshuffles five question banks per run. Archive reconstructs the last 14 dates from the current daily rotation and dated overrides. The hosted preview allows both modes. Paid release requires checkout and server-verified account access.

## Place coverage and corrections

The place catalog is built from snapshots and shipped as a static file. Guesses are checked locally. A spelling shared by multiple entities is ambiguous and needs a fuller name or code. Players can search names and aliases after a round, follow source links, and open a public GitHub issue draft for an unmatched guess. A draft never changes a score.

- Metro city and system records are adapted from the [Wikipedia list of metro systems](https://en.wikipedia.org/wiki/List_of_metro_systems), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), with previously curated cities retained in the city bank. The metro-derived records in the catalog are available under the same license. The list focuses on systems and their primary cities and can miss suburbs or newer service.
- Amtrak data is from the [BTS National Transportation Atlas Database](https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/NTAD_Amtrak_Stations/FeatureServer/0). The game uses records tagged TRAIN and omits bus-only stops.
- Install the `lxml` Python package to rebuild. Save the metro list as HTML and the BTS layer query response as JSON (`where=1=1`, `outFields=*`, `returnGeometry=false`, `f=json`). Run `python3 tools/place_sources.py --metro metro.html --amtrak amtrak.json --date YYYY-MM-DD`.
- For reviewed corrections, pass `--reviewed verified.json`. The file maps a bank ID to rows of `[name, [aliases], points, {"label": "Source label", "url": "https://..."}]`. Use the exact canonical answer name when adding an alias to an existing record. Verify the source supports the round's criteria before merging a correction.

## Player tracker and free turns

The hosted Worker uses D1 for anonymous browser IDs, runs, submitted guesses, and answer suggestions. Each browser gets five run starts in Unlimited and five in Archive. Daily play has no quota. Checkout and paid entitlements are pending. Client scores are retained as playtest telemetry, not a verified leaderboard.

Run `python3 tools/build_worker.py` to embed the existing client in the Worker artifact. Apply the SQL in `drizzle/` through the deployment pipeline. The tracker dialog shows the current browser's activity. For aggregate answers and suggestions, configure `TRACKER_ADMIN_KEY` as a server-only environment secret and request `GET /api/admin` with a bearer token. No admin data is exposed without that key.
