#!/usr/bin/env python3
"""Compile answer banks and approved photo slots for Built World."""
import argparse
from collections import Counter, defaultdict
import csv
from datetime import date
import json
from pathlib import Path
import re
import unicodedata
from urllib.parse import urlencode
from urllib.request import urlretrieve

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist" if (ROOT / "dist").is_dir() else ROOT
AIRPORT_URL = "https://davidmegginson.github.io/ourairports-data/airports.csv"
RAIL_URL = "https://dataportal.orr.gov.uk/media/1909/table-1410-passenger-entries-and-exits-and-interchanges-by-station.csv"
CURATED = {
    "homes": "North American residential architecture historic houses street",
    "tunnels": "underwater road tunnel entrance highway infrastructure",
    "stormwater": "urban rain garden bioswale stormwater infrastructure",
    "planning": "postwar planned housing estate aerial modernist architecture",
    "bridges": "steel truss bridge engineering structure",
}
def editorial_searches():
    path = DIST / "editorial-banks.js"
    if not path.is_file():
        return {}
    text = path.read_text(encoding="utf-8").strip()
    return {key: bank["photoSearch"] for key, bank in json.loads(text.removeprefix("window.builtWorldEditorial = ").removesuffix(";")).items()}


RAIL_TOPICS = ["high-speed", "shinkansen", "tgv", "acela"]
COVER_SEARCH = "Golden Gate Bridge aerial sunset San Francisco"
DATASETS = {
    "airports": {
        "label": "Airports",
        "prompt": "Name an airport with scheduled flights and a three-letter IATA code.",
        "rule": "Airport names, common abbreviations, and IATA codes count. Based on the OurAirports snapshot.",
        "source": "https://ourairports.com/data/",
        "sourceLabel": "OurAirports open data",
        "photoSearch": "commercial airport terminal runway aerial scheduled passenger aircraft",
    },
    "rail": {
        "label": "British railway stations",
        "prompt": "Name a National Rail station in Great Britain.",
        "rule": "Station names and three-letter CRS codes count. Uses ORR’s 2024–25 station usage snapshot.",
        "source": "https://dataportal.orr.gov.uk/station-usage",
        "sourceLabel": "Office of Rail and Road, Table 1410 (2024–25)",
        "photoSearch": "Great Britain National Rail passenger station platforms British railway architecture",
    },
}


def normalize(value):
    plain = "".join(c for c in unicodedata.normalize("NFD", value.lower()) if not unicodedata.combining(c))
    return re.sub("[^a-z0-9]", "", plain)


def read_csv(path, header=None):
    with path.open(encoding="utf-8-sig", newline="") as handle:
        if header:
            reader = csv.reader(handle)
            fieldnames = next((row for row in reader if row and row[0] == header), None)
            if fieldnames is None:
                raise ValueError(f"{path}: missing {header} header")
            yield from (dict(zip(fieldnames, row)) for row in reader)
        else:
            yield from csv.DictReader(handle)


def download(label, url, explicit, refresh):
    if explicit:
        return explicit
    cache = ROOT / ".content-cache" / f"{label}.csv"
    if refresh or not cache.is_file():
        cache.parent.mkdir(exist_ok=True)
        temp = cache.with_suffix(".tmp")
        urlretrieve(url, temp)
        temp.replace(cache)
    return cache


def unique_aliases(rows):
    owners = defaultdict(set)
    for name, aliases, _ in rows:
        for alias in [name, *aliases]:
            if key := normalize(alias):
                owners[key].add(name)
    return [[name, list(dict.fromkeys(alias for alias in aliases
             if normalize(alias) and len(owners[normalize(alias)]) == 1)), points]
            for name, aliases, points in rows]


def airports(path):
    candidates = [r for r in read_csv(path) if r["scheduled_service"] == "yes"
                  and r["type"] in {"small_airport", "medium_airport", "large_airport"}
                  and re.fullmatch("[A-Z]{3}", r["iata_code"])]
    codes = Counter(row["iata_code"] for row in candidates)
    result = []
    for row in sorted(candidates, key=lambda r: (r["type"], r["name"], r["iata_code"])):
        code = row["iata_code"]
        if codes[code] > 1:
            continue
        name = row["name"].strip()
        short = re.sub(r"\s+(?:International Airport|Regional Airport|Airport)$", "", name, flags=re.I)
        aliases = [code, name, short]
        if row["icao_code"]:
            aliases.append(row["icao_code"])
        points = {"large_airport": 10, "medium_airport": 20, "small_airport": 40}[row["type"]]
        result.append((f"{name} ({code})", aliases, points))
    known = {"JFK": ["JFK Airport", "Kennedy Airport"], "LAX": ["Los Angeles International", "LAX Airport"],
             "LHR": ["London Heathrow", "Heathrow"], "CDG": ["Paris Charles de Gaulle", "Charles de Gaulle"],
             "SFO": ["San Francisco International", "SFO Airport"], "ATL": ["Atlanta Airport", "Hartsfield Jackson"]}
    for name, aliases, _ in result:
        aliases.extend(known.get(aliases[0], []))
    return unique_aliases(result)


def rail(path):
    result = []
    for row in read_csv(path, "Station name"):
        columns = {" ".join(key.lower().split()): value for key, value in row.items() if key and value}
        name = next((columns[key] for key in ("station name", "station") if key in columns), "").strip()
        code = next((columns[key] for key in ("three letter code (tlc)", "crs code", "crs") if key in columns), "").strip()
        if not name or not re.fullmatch("[A-Z0-9]{3}", code):
            continue
        usage = columns.get("entries and exits: all tickets", "0")
        volume = int(re.sub(r"[^0-9]", "", usage) or 0)
        points = 10 if volume >= 5_000_000 else 20 if volume >= 250_000 else 40
        result.append((f"{name} ({code})", [code, name, f"{name} station"], points))
    return unique_aliases(result)


def load_schedule(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    return data.get("dates", {})


def round_ids(day, override, known):
    if "rounds" in override:
        selected = override["rounds"]
        if len(selected) != 5 or len(set(selected)) != 5 or set(selected) - known:
            raise ValueError(f"{day}: provide exactly five distinct existing bank IDs")
        return selected
    ordinal = (day - date(1970, 1, 1)).days
    built = list(CURATED)
    editorial = editorial_searches()
    city = [key for key in editorial if key not in RAIL_TOPICS]
    if city and day >= date(2026, 11, 11):
        chosen = [built[ordinal % len(built)], built[(ordinal + 2) % len(built)],
                  RAIL_TOPICS[ordinal % len(RAIL_TOPICS)], city[(ordinal + ordinal // 4) % len(city)]]
    else:
        omitted = ordinal % len(built)
        chosen = built[:omitted] + built[omitted + 1:]
    large = list(DATASETS)[ordinal % len(DATASETS)]
    chosen.insert(ordinal % 4, large)
    return chosen


def bank_config(path):
    if not path:
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    for key, meta in data.items():
        if not re.fullmatch(r"[a-z][a-z0-9-]+", key) or key in CURATED or key in DATASETS or key in editorial_searches():
            raise ValueError(f"Invalid or reserved bank ID: {key}")
        if any(not isinstance(meta.get(field), str) or not meta[field].strip()
               for field in ("label", "prompt", "rule", "source", "sourceLabel", "photoSearch")):
            raise ValueError(f"{key}: incomplete bank metadata")
    return data


def import_csv(paths, banks):
    rows = defaultdict(list)
    names = defaultdict(set)
    for path in paths:
        for line, row in enumerate(read_csv(path), 2):
            key = row.get("bank", "").strip()
            name = row.get("answer", "").strip()
            if key not in banks or not normalize(name):
                raise ValueError(f"{path}:{line}: unknown bank or empty answer")
            if normalize(name) in names[key]:
                raise ValueError(f"{path}:{line}: duplicate answer {name}")
            names[key].add(normalize(name))
            points = int(row.get("points") or 20)
            if points not in (10, 20, 40):
                raise ValueError(f"{path}:{line}: points must be 10, 20, or 40")
            aliases = [value.strip() for value in row.get("aliases", "").split("|") if value.strip()]
            rows[key].append((name, aliases, points))
    return {key: unique_aliases(values) for key, values in rows.items()}


def photo_record(record):
    fields = ("assetId", "file", "alt", "credit")
    if any(not isinstance(record.get(field), str) or not record[field].strip() for field in fields):
        raise ValueError("Photo requires assetId, file, alt, and credit")
    if not record["assetId"].isdigit() or record.get("licensed") is not True:
        raise ValueError("Photo requires its Adobe Stock ID and licensed: true")
    if not re.fullmatch(r"photos/[a-zA-Z0-9/_-]+\.(webp|jpe?g|png|avif)", record["file"]):
        raise ValueError("Photo file must be under photos/ in the site directory")
    if not (DIST / record["file"]).is_file():
        raise ValueError(f"Missing licensed photo: {record['file']}")
    return {field: record[field] for field in fields}


def compile_content(args):
    custom = bank_config(args.banks)
    rows = import_csv(args.csv, custom)
    airports_rows = airports(download("airports", AIRPORT_URL, args.airports, args.refresh))
    rail_rows = rail(download("rail", RAIL_URL, args.rail, args.refresh))
    if len(airports_rows) < 3000 or len(rail_rows) < 2000:
        raise ValueError(f"Unexpected source counts: {len(airports_rows)} airports, {len(rail_rows)} stations")
    rows.update(airports=airports_rows, rail=rail_rows)
    metadata = {**DATASETS, **custom}
    missing = set(custom) - rows.keys()
    if missing:
        raise ValueError(f"Missing CSV answers for: {', '.join(sorted(missing))}")
    dates = {}
    for key, entry in load_schedule(args.schedule).items():
        day = date.fromisoformat(key)
        selected = round_ids(day, entry, set(metadata) | set(CURATED) | set(editorial_searches()))
        photos = entry.get("photos", {})
        if set(photos) - {"cover", *selected}:
            raise ValueError(f"{day}: photo slot does not belong to this edition")
        dates[key] = {"rounds": selected}
        if args.include_photos:
            dates[key]["photos"] = {slot: photo_record(record) for slot, record in photos.items()}
    payload = {"banks": {key: {**meta, "answers": rows[key]} for key, meta in metadata.items()}, "dates": dates}
    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    output = DIST / "daily-content.js"
    temporary = output.with_suffix(".tmp")
    temporary.write_text("window.builtWorldContent = " + encoded + ";\n", encoding="utf-8")
    temporary.replace(output)
    print(", ".join(f"{key}: {len(values):,}" for key, values in rows.items()))


def photo_brief(args):
    day = date.fromisoformat(args.date)
    override = load_schedule(args.schedule).get(args.date, {})
    custom = bank_config(args.banks)
    searches = {**CURATED, **editorial_searches(), **{key: value["photoSearch"] for key, value in {**DATASETS, **custom}.items()}}
    selected = round_ids(day, override, set(searches))
    for key, search in [("cover", COVER_SEARCH), *((key, searches[key]) for key in selected)]:
        record = override.get("photos", {}).get(key, {})
        query = {"k": search, "search_type": "usertyped"}
        if record.get("assetId"):
            query["asset_id"] = record["assetId"]
        print(f"{key}\t https://stock.adobe.com/search/images?{urlencode(query)}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--schedule", type=Path, default=ROOT / "content/schedule.json")
    common.add_argument("--banks", type=Path, help="Optional JSON definitions for CSV answer banks")
    actions = parser.add_subparsers(dest="action", required=True)
    build = actions.add_parser("build", parents=[common])
    build.add_argument("--airports", type=Path)
    build.add_argument("--rail", type=Path)
    build.add_argument("--refresh", action="store_true")
    build.add_argument("--csv", type=Path, action="append", default=[])
    build.add_argument("--include-photos", action="store_true", help="Include licensed files in a private build")
    brief = actions.add_parser("adobe-brief", parents=[common])
    brief.add_argument("date")
    args = parser.parse_args()
    try:
        (compile_content if args.action == "build" else photo_brief)(args)
    except (OSError, ValueError, KeyError) as error:
        parser.exit(1, f"{error}\n")


if __name__ == "__main__":
    main()
