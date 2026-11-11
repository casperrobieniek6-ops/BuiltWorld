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
