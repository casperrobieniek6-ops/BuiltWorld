"""Build a local, auditable place catalog from two public source snapshots."""
import argparse
from datetime import date
import json
from pathlib import Path
import re
import unicodedata
from urllib.parse import urljoin

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "dist" if (ROOT / "dist").is_dir() else ROOT
METRO = "https://en.wikipedia.org/wiki/List_of_metro_systems"
BTS = "https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/NTAD_Amtrak_Stations/FeatureServer/0"


def key(value):
    value = value.lower().translate(str.maketrans({"ø": "o", "ł": "l", "đ": "d", "ð": "d", "æ": "ae", "œ": "oe", "ß": "ss"}))
    return re.sub("[^a-z0-9]", "", unicodedata.normalize("NFD", value))


def text(cell):
    return " ".join("".join(cell.xpath(".//text()[not(ancestor::sup) and not(ancestor::style)]")).split())


def metro_records(path):
    document = html.parse(str(path))
    for table in document.xpath('//table[contains(@class,"wikitable")]'):
        rows = table.xpath("./tbody/tr|./tr")
        if rows and [text(cell) for cell in rows[0].xpath("./th|./td")][:3] == ["Name", "City", "Country"]:
            break
    else:
        raise ValueError("Metro source table not found")
    span = {}
    for row in rows[1:]:
        cells = {}
        for col, (cell, remaining) in list(span.items()):
            cells[col] = cell
            if remaining == 1:
                del span[col]
            else:
                span[col] = (cell, remaining - 1)
        col = 0
        for cell in row.xpath("./th|./td"):
            while col in cells:
                col += 1
            cells[col] = cell
            count = int(cell.get("rowspan", "1"))
            if count > 1:
                span[col] = (cell, count - 1)
            col += 1
        if not all(i in cells for i in (0, 1, 2)):
            continue
        names = [text(cells[i]) for i in (0, 1, 2)]
        links = cells[0].xpath(".//a[not(ancestor::sup)]/@href")
        source = urljoin(METRO, links[0]) if links else METRO
        if all(names) and key(names[1]):
            yield (*names, source)


def read_assignment(path, prefix):
    return json.loads(path.read_text(encoding="utf-8").strip().removeprefix(prefix).removesuffix(";"))


def build_metro(path):
    records = list(metro_records(path))
    if len(records) < 210 or not any(row[1] == "London" for row in records):
        raise ValueError("Metro snapshot appears incomplete")
    editorial = read_assignment(WEB / "editorial-banks.js", "window.builtWorldEditorial = ")["metro-cities"]
    cities = {key(row[0]): [*row, None] for row in editorial["answers"]}
    labels = {key(alias): ident for ident, row in cities.items() for alias in [row[0], *row[1]]}
    systems = {}
    for system, city, country, source in records:
        systems.setdefault(key(system), [system, [], 20, {"label": f"{city}, {country}", "url": source}])
        if city.endswith(" Prefecture"):
            continue
        if city == "San Francisco (Bay Area)":
            city = "San Francisco"
        ident = labels.get(key(city), key(city))
        evidence = {"label": f"{system} · {country}", "url": source}
        row = cities.setdefault(ident, [city, [], 20, None])
        if not row[3]:
            row[3] = evidence
        row[1] = list(dict.fromkeys([*row[1], city, f"{city}, {country}"]))
    return {
        "metro-cities": {**editorial, "source": METRO, "sourceLabel": "Wikipedia metro systems list and editorial additions", "answers": list(cities.values())},
        "metro-systems": {"label": "Metro networks", "prompt": "Name a metro or subway system.",
                          "rule": "Give the name of an operating system. A city name alone is outside this round.",
                          "photoSearch": editorial["photoSearch"], "source": METRO, "sourceLabel": "Wikipedia metro systems list",
                          "answers": list(systems.values())}
    }


def build_amtrak(path):
    payload = json.loads(path.read_text())
    if payload.get("exceededTransferLimit"):
        raise ValueError("BTS query was truncated")
    records = [f["attributes"] for f in payload["features"] if f["attributes"]["StnType"] == "TRAIN"]
    if len(records) < 500:
        raise ValueError("BTS snapshot appears incomplete")
    rows = {}
    for record in records:
        code = record["Code"].strip()
        city = record["City"].strip()
        state = record["State"].strip()
        facility = record["StationFacilityName"].strip()
        if not re.fullmatch("[A-Z]{3}", code) or not city:
            continue
        name = f"{city} – {facility}" if facility and key(city) not in key(facility) else facility or f"{city}, {state}"
        aliases = [code, city, f"{city} {state}", record["StationName"].strip(), facility]
        aliases.extend([f"{city} {facility}"] if facility else [])
        if code in {"NYP", "PHL", "CHI", "WAS", "LAX"}:
            aliases.extend({"NYP": ["New York Penn Station", "Moynihan Train Hall", "NYC"], "PHL": ["30th Street Station", "Philadelphia 30th Street"], "CHI": ["Chicago Union Station"], "WAS": ["Washington Union Station", "DC Union Station"], "LAX": ["Los Angeles Union Station", "LA Union Station"]}[code])
        rows[code] = [f"{name} ({code})", list(dict.fromkeys(a for a in aliases if a)), 20,
                      {"label": f"{city}, {state} · {code}", "url": f"https://www.amtrak.com/stations/{code.lower()}"}]
    return {"label": "Amtrak stops", "prompt": "Name a passenger rail station served by Amtrak.",
            "rule": "Give the station name, an unambiguous city, or its three-letter code. Bus-only stops are excluded.",
            "photoSearch": "Amtrak passenger train station United States railway platform",
            "source": BTS, "sourceLabel": "Amtrak / U.S. Bureau of Transportation Statistics", "answers": list(rows.values())}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--metro", type=Path, required=True, help="Saved Wikipedia metro systems list HTML")
    parser.add_argument("--amtrak", type=Path, required=True, help="Saved BTS feature layer query JSON")
    parser.add_argument("--date", required=True, type=date.fromisoformat)
    parser.add_argument("--reviewed", type=Path, help="JSON object mapping bank IDs to verified answer rows")
    args = parser.parse_args()
    banks = build_metro(args.metro)
    banks["amtrak-stations"] = build_amtrak(args.amtrak)
    if args.reviewed:
        for bank_id, additions in json.loads(args.reviewed.read_text(encoding="utf-8")).items():
            rows = {key(row[0]): row for row in banks[bank_id]["answers"]}
            for name, aliases, points, evidence in additions:
                if not key(name) or not isinstance(aliases, list) or not all(isinstance(a, str) for a in aliases) or points not in (10, 20, 40) or not evidence.get("label") or not evidence.get("url", "").startswith("https://"):
                    raise ValueError(f"{bank_id}: reviewed row must include a name, aliases, points, and an HTTPS source")
                if key(name) in rows:
                    existing = rows[key(name)]
                    existing[1] = list(dict.fromkeys([*existing[1], *aliases]))
                    existing[3] = evidence
                else:
                    row = [name, aliases, points, evidence]
                    rows[key(name)] = row
                    banks[bank_id]["answers"].append(row)
    data = {"snapshotDate": args.date.isoformat(), "banks": banks}
    output = WEB / "place-catalog.js"
    output.write_text("window.builtWorldPlaces = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    print({key: len(value["answers"]) for key, value in banks.items()})


if __name__ == "__main__":
    main()
