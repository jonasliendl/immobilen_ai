#!/usr/bin/env python3
"""
Parse the Berliner Mietspiegel 2024 Straßenverzeichnis PDF.
Extract street entries with their Wohnlage (e/m/g) and Ost/West designation.
Output: JSON file mapping streets to their Wohnlage segments.

Format per entry (from PDF):
  StreetName Bezirk [O|W] (K | HausnrRange) [F|G|U] (einfach|mittel|gut)
"""
import json
import re
import pdfplumber

PDF_PATH = "../.github/skills/mietpreisbremse-check/references/raw/strassenverzeichnis2024.pdf"
OUT_PATH = "../.github/skills/mietpreisbremse-check/references/raw/strassenverzeichnis2024.json"

BEZIRKE = {"ChWi", "FrKr", "Lich", "MaHe", "Mitt", "Neuk", "Pank", "Rein", "Span", "StZe", "TrKö", "TSch"}
WOHNLAGEN = {"einfach", "mittel", "gut"}

# Regex to match one entry. The entry ends with einfach|mittel|gut.
# StreetName (may include spaces, parens) + Bezirk + O/W + Hausnr info + WL
ENTRY_RE = re.compile(
    r'(?P<street>.+?)\s+'
    r'(?P<bezirk>' + '|'.join(BEZIRKE) + r')\s+'
    r'(?P<gebiet>[OW])?\s*'
    r'(?P<hausnr>K|[\d][\d\s\-–ABCDa-d]*)\s+'
    r'(?P<numtype>[FGUK])?\s*'
    r'(?P<wohnlage>einfach|mittel|gut)'
)

def split_line_into_entries(line):
    """Split a line that may contain two side-by-side entries."""
    entries = []
    remaining = line.strip()
    while remaining:
        m = ENTRY_RE.search(remaining)
        if not m:
            break
        entries.append(m)
        remaining = remaining[m.end():].strip()
    return entries

def parse_hausnr(s):
    """Parse house number range string."""
    s = s.strip()
    if s == "K":
        return {"type": "K", "from": None, "to": None}
    # Try to parse "1 - 43", "1 - 4 A", "28 A - 28 C", etc.
    parts = re.split(r'\s*[-–]\s*', s, maxsplit=1)
    if len(parts) == 2:
        return {"type": "range", "from": parts[0].strip(), "to": parts[1].strip()}
    elif len(parts) == 1:
        return {"type": "single", "from": parts[0].strip(), "to": parts[0].strip()}
    return {"type": "unknown", "raw": s}

def main():
    all_entries = []

    with pdfplumber.open(PDF_PATH) as pdf:
        print(f"Total pages: {len(pdf.pages)}")
        # Data starts on page 4 (index 3), first 3 pages are explanations
        for i in range(3, len(pdf.pages)):
            text = pdf.pages[i].extract_text()
            if not text:
                continue
            for line in text.split("\n"):
                line = line.strip()
                # Skip headers and footers
                if not line or "STRASSENVERZEICHNIS" in line or "Straßenname" in line or line.isdigit():
                    continue

                matches = split_line_into_entries(line)
                for m in matches:
                    street = m.group("street").strip()
                    bezirk = m.group("bezirk")
                    gebiet = m.group("gebiet") or ""
                    hausnr_raw = m.group("hausnr").strip()
                    numtype = (m.group("numtype") or "").strip()
                    wohnlage = m.group("wohnlage")

                    # Clean up street name (remove leading numbers that might be page artifacts)
                    street = re.sub(r'^\d+\s+', '', street).strip()
                    # Remove trailing district abbreviation if duplicated
                    street = street.strip()

                    hausnr = parse_hausnr(hausnr_raw)

                    entry = {
                        "street": street,
                        "bezirk": bezirk,
                        "gebiet": gebiet,
                        "hausnr": hausnr,
                        "numType": numtype or hausnr.get("type", ""),
                        "wohnlage": wohnlage,
                    }
                    all_entries.append(entry)

    print(f"Parsed {len(all_entries)} entries")

    # Stats
    wl_counts = {}
    for e in all_entries:
        wl = e["wohnlage"]
        wl_counts[wl] = wl_counts.get(wl, 0) + 1
    for wl, count in sorted(wl_counts.items()):
        print(f"  {wl}: {count}")

    bezirk_counts = {}
    for e in all_entries:
        b = e["bezirk"]
        bezirk_counts[b] = bezirk_counts.get(b, 0) + 1
    print("\nBy Bezirk:")
    for b, count in sorted(bezirk_counts.items(), key=lambda x: -x[1]):
        print(f"  {b}: {count}")

    unique_streets = len(set(e["street"] for e in all_entries))
    print(f"\nUnique street names: {unique_streets}")

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(all_entries, f, ensure_ascii=False, indent=2)
    print(f"\nWritten to {OUT_PATH}")

if __name__ == "__main__":
    main()
