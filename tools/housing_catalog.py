"""Build the planned-housing answer supplement from the NYCHA Data Book."""
import argparse
import csv
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "dist" if (ROOT / "dist").is_dir() else ROOT
NYCHA = "https://data.cityofnewyork.us/Housing-Development/NYCHA-Development-Data-Book/evjd-dqpz"
HACLA = "https://www.hacla.org/sites/default/files/Documents/DataDashboard/HACLAProperties/PHDevelopments/Public-Housing-Properties.pdf"
GARDEN = "https://www.laconservancy.org/save-places/issues/garden-apartments/"
PARKCHESTER = "https://www.lehman.edu/public-art-bronx/Parkchester-Apartment-Development-Bound/"

# Named developments frequently entered under short, historic, or local names.
LOS_ANGELES = [
    ("Nickerson Gardens", ["Nickerson", "Nickerson Garden", "Nickerson Gardens Watts"]),
    ("Mar Vista Gardens", ["Mar Vista", "Mar Vista Garden"]),
    ("Jordan Downs", ["Jordan Downs Houses", "Jordan Downs Watts", "Jordan Downs Redevelopment"]),
    ("Imperial Courts", ["Imperial Court", "Imperial Courts Watts"]),
    ("Estrada Courts", ["Estrada Court", "Estrada Courts Boyle Heights"]),
    ("Pico Gardens", ["Pico Garden", "Pico Gardens Las Casitas", "Pico Gardens/Las Casitas", "Las Casitas"]),
    ("Ramona Gardens", ["Ramona Garden", "Ramona Gardens Boyle Heights"]),
    ("Gonzaque Village", ["Gonzaque", "Hacienda Village"]),
    ("Avalon Gardens", ["Avalon Garden", "Avalon Gardens Housing"]),
    ("William Mead Homes", ["William Mead", "Mead Homes"]),
    ("Pueblo del Rio", ["Pueblo Del Río", "Pueblo Del Rio Housing"]),
    ("San Fernando Gardens", ["San Fernando Garden", "San Fernando Gardens Pacoima"]),
    ("Rose Hill Courts", ["Rose Hill Court", "Rose Hills Courts"]),
    ("Rancho San Pedro", ["Rancho San Pedro Housing", "Rancho San Pedro Houses"]),
]
LA_GARDENS = [
    ("Village Green", ["The Village Green", "Baldwin Hills Village", "Village Green Baldwin Hills", "Baldwin Hills Village Green"]),
    ("Wyvernwood Garden Apartments", ["Wyvernwood", "Wyvernwood Gardens", "Wyvernwood Apartments", "Wyvernwood Garden"]),
    ("Lincoln Place Garden Apartments", ["Lincoln Place", "Lincoln Place Apartments", "Lincoln Place Venice"]),
    ("Chase Knolls", ["Chase Knolls Garden Apartments", "Chase Knolls Apartments", "Chase Knolls Sherman Oaks"]),
]


def row(name, aliases, points, label, url):
    return [name, list(dict.fromkeys(aliases)), points, {"label": label, "url": url}]


def clean_title(value):
    return re.sub(r"\b(?:Ii|Iii|Iv|Vi|Vii|Viii|Ix|Xi)\b", lambda match: match[0].upper(), value.title())


def compile_catalog(path):
    result = [
        row("Queensbridge Houses", ["Queensbridge", "Queens Bridge", "Queens Bridge Houses", "Queensbridge Projects",
            "Queensbridge North", "Queensbridge South", "Queensbridge North Houses", "Queensbridge South Houses", "QB"], 10, "NYCHA Development Data Book", NYCHA),
        row("Parkchester", ["Park Chester", "Parkchester Houses", "Parkchester Apartments", "Parkchester Bronx",
            "Parkchester Apartment Development", "Parkchester South", "Parkchester North"], 10, "Lehman College · Parkchester", PARKCHESTER)
    ]
    for name, aliases in LOS_ANGELES:
        result.append(row(name, [*aliases, f"{name} LA", f"{name} in LA", f"{name} Los Angeles", f"{name} in Los Angeles"], 20, "Housing Authority of the City of Los Angeles", HACLA))
    for name, aliases in LA_GARDENS:
        result.append(row(name, [*aliases, f"{name} LA", f"{name} Los Angeles"], 20, "Los Angeles Conservancy · Garden Apartments", GARDEN))
    used = {item[0].casefold() for item in result}
    with path.open(encoding="utf-8-sig", newline="") as source:
        for item in csv.DictReader(source):
            official = item["development"].strip()
            units = int(re.sub(r"[^0-9]", "", item["total_number_of_apartments"]) or "0")
            if not item["type"].startswith("NEW CONST") or units < 100 or official.startswith("QUEENSBRIDGE "):
                continue
            name = clean_title(official)
            if not name or name.casefold() in used:
                continue
            used.add(name.casefold())
            borough = clean_title(item["borough"].strip())
            aliases = [f"{name} {borough}", f"{name} NYCHA"]
            if not name.endswith(("Houses", "Homes", "Gardens", "Apartments")):
                aliases.append(f"{name} Houses")
                aliases.append(f"{name} Projects")
            result.append(row(name, aliases, 20 if units >= 750 else 40, f"NYCHA Development Data Book · {borough}", NYCHA))
    if len(result) < 200:
        raise ValueError("The NYCHA snapshot appears incomplete")
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv", type=Path)
    args = parser.parse_args()
    rows = compile_catalog(args.csv)
    (WEB / "housing-catalog.js").write_text("window.builtWorldHousing = " + json.dumps(rows, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"{len(rows)} housing records")
