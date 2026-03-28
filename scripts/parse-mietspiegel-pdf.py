#!/usr/bin/env python3
"""
Parse the Berliner Mietspiegeltabelle 2024 PDF and extract rent values.
Output: JSON file with all rent data by Wohnlage × Baualtersklasse × Wohnfläche.
"""
import json
import re
import pdfplumber

PDF_PATH = "../.github/skills/mietpreisbremse-check/references/raw/mietspiegeltabelle2024.pdf"
OUT_PATH = "../.github/skills/mietpreisbremse-check/references/raw/mietspiegeltabelle2024.json"

# Parse a euro value like "7,19 €" -> 7.19
def parse_eur(s):
    return float(s.replace("€", "").replace(",", ".").strip())

# Parse line like: "1 bis 1918 bis unter 35 m² 7,19 € 9,87 € 14,19 €"
ROW_RE = re.compile(
    r'^(\d+)\s+'           # Zeile (line number)
    r'(.*?)\s+'            # Bezugsfertigkeit + Wohnfläche description
    r'(\d+[,.]\d+)\s*€\s+' # untere Spanne
    r'(\d+[,.]\d+)\s*€\s+' # Mittelwert
    r'(\d+[,.]\d+)\s*€'    # obere Spanne
)

WOHNLAGE_RANGES = {
    "einfach": (1, 49),
    "mittel": (50, 117),
    "gut": (118, 163),
}

def parse_size_range(desc):
    """Parse size description, return (min_m2, max_m2) where None means unbounded."""
    desc = desc.strip()
    # "alle Wohnflächen"
    if "alle" in desc.lower():
        return (0, None)
    # "bis unter 35 m²"
    m = re.search(r'bis unter\s+(\d+)\s*m', desc)
    if m and not re.search(r'(\d+)\s*m.*bis unter', desc):
        return (0, int(m.group(1)))
    # "40 m² bis unter 60 m²"
    m = re.search(r'(\d+)\s*m²?\s*bis unter\s+(\d+)\s*m', desc)
    if m:
        return (int(m.group(1)), int(m.group(2)))
    # "ab 105 m²"
    m = re.search(r'ab\s+(\d+)\s*m', desc)
    if m:
        return (int(m.group(1)), None)
    return (0, None)

def parse_bezugsfertigkeit(desc):
    """Extract building age class from description."""
    desc = desc.strip()
    patterns = [
        (r'bis 1918', 'bis 1918'),
        (r'1919\s*(bis|–)\s*1949', '1919 bis 1949'),
        (r'1950\s*(bis|–)\s*1964', '1950 bis 1964'),
        (r'1965\s*(bis|–)\s*1972', '1965 bis 1972'),
        (r'1973\s*(bis|–)\s*1985\s*West', '1973 bis 1985 West'),
        (r'1986\s*(bis|–)\s*1990\s*West', '1986 bis 1990 West'),
        (r'1973\s*(bis|–)\s*1990\s*Ost', '1973 bis 1990 Ost'),
        (r'1991\s*(bis|–)\s*2001', '1991 bis 2001'),
        (r'2002\s*(bis|–)\s*2009', '2002 bis 2009'),
        (r'2010\s*(bis|–)\s*2015', '2010 bis 2015'),
        (r'2016\s*(bis|–)\s*2022', '2016 bis 2022'),
    ]
    for pattern, label in patterns:
        if re.search(pattern, desc):
            return label
    return None

def main():
    all_text = ""
    with pdfplumber.open(PDF_PATH) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                all_text += text + "\n"

    rows = []
    current_bezug = None

    for line in all_text.split("\n"):
        m = ROW_RE.match(line.strip())
        if not m:
            continue
        zeile = int(m.group(1))
        desc = m.group(2)
        lower = parse_eur(m.group(3))
        mid = parse_eur(m.group(4))
        upper = parse_eur(m.group(5))

        # Determine Wohnlage from line number
        wohnlage = None
        for wl, (lo, hi) in WOHNLAGE_RANGES.items():
            if lo <= zeile <= hi:
                wohnlage = wl
                break

        # Extract Bezugsfertigkeit (may be in this line or carried from previous)
        bezug = parse_bezugsfertigkeit(desc)
        if bezug:
            current_bezug = bezug
        # Remove bezugsfertigkeit text to get size description
        size_desc = desc
        for pattern in [r'bis 1918', r'1919\s*(bis|–)\s*1949', r'1950\s*(bis|–)\s*1964',
                        r'1965\s*(bis|–)\s*1972', r'1973\s*(bis|–)\s*1985\s*West',
                        r'1986\s*(bis|–)\s*1990\s*West', r'1973\s*(bis|–)\s*1990\s*Ost\*?',
                        r'1991\s*(bis|–)\s*2001\*?\*?', r'2002\s*(bis|–)\s*2009',
                        r'2010\s*(bis|–)\s*2015', r'2016\s*(bis|–)\s*2022']:
            size_desc = re.sub(pattern, '', size_desc).strip()

        min_m2, max_m2 = parse_size_range(size_desc)

        rows.append({
            "zeile": zeile,
            "wohnlage": wohnlage,
            "bezugsfertigkeit": current_bezug,
            "sizeDescription": size_desc.strip(),
            "minM2": min_m2,
            "maxM2": max_m2,
            "lower": lower,
            "mid": mid,
            "upper": upper,
        })

    # Output
    print(f"Parsed {len(rows)} rows")
    for wl in ["einfach", "mittel", "gut"]:
        wl_rows = [r for r in rows if r["wohnlage"] == wl]
        print(f"  {wl}: {len(wl_rows)} rows")
        bezugs = sorted(set(r["bezugsfertigkeit"] for r in wl_rows))
        for b in bezugs:
            b_rows = [r for r in wl_rows if r["bezugsfertigkeit"] == b]
            print(f"    {b}: {len(b_rows)} size categories")

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)
    print(f"\nWritten to {OUT_PATH}")

if __name__ == "__main__":
    main()
