#!/usr/bin/env python3
"""
Generate static TypeScript data files for the Budenfinder frontend
from parsed Mietspiegel PDF data.

Outputs:
  frontend/lib/mietspiegel-table.ts   — Rent values by Wohnlage × Baualtersklasse × Wohnfläche
  frontend/lib/mietspiegel-streets.ts — Street → Wohnlage + Ost/West mapping
"""
import json
import re

RENT_JSON = "../.github/skills/mietpreisbremse-check/references/raw/mietspiegeltabelle2024.json"
STREET_JSON = "../.github/skills/mietpreisbremse-check/references/raw/strassenverzeichnis2024.json"
RENT_TS = "../frontend/lib/mietspiegel-table.ts"
STREET_TS = "../frontend/lib/mietspiegel-streets.ts"

def clean_street_name(name):
    """Remove single-letter section headers that got merged with street names."""
    # Pattern: single letter + space + capitalized word (section header artifact)
    m = re.match(r'^([A-ZÄÖÜ])\s+([A-ZÄÖÜ][a-zäöüß])', name)
    if m and len(m.group(1)) == 1:
        # Check if the single letter is just a section header (A, B, C, etc.)
        return name[2:].strip()
    return name

def generate_rent_table():
    with open(RENT_JSON, encoding="utf-8") as f:
        rows = json.load(f)

    lines = [
        '/**',
        ' * Berliner Mietspiegeltabelle 2024 — Official rent values.',
        ' * Source: Berliner Mietspiegel 2024 vom 30. Mai 2024 (ABl. Nr. 22 / 30.05.2024)',
        ' * PDF: https://mietspiegel.berlin.de/wp-content/uploads/2024/11/mietspiegeltabelle2024.pdf',
        ' *',
        ' * All values are Nettokaltmiete in €/m²/month (net cold rent, excluding operating costs).',
        ' * Auto-generated — do not edit manually.',
        ' */',
        '',
        'export type Wohnlage = "einfach" | "mittel" | "gut";',
        '',
        'export type Bezugsfertigkeit =',
        '  | "bis 1918"',
        '  | "1919 bis 1949"',
        '  | "1950 bis 1964"',
        '  | "1965 bis 1972"',
        '  | "1973 bis 1985 West"',
        '  | "1986 bis 1990 West"',
        '  | "1973 bis 1990 Ost"',
        '  | "1991 bis 2001"',
        '  | "2002 bis 2009"',
        '  | "2010 bis 2015"',
        '  | "2016 bis 2022";',
        '',
        'export interface MietspiegelEntry {',
        '  /** Official row number (Zeile) in the Mietspiegeltabelle */',
        '  readonly zeile: number;',
        '  readonly wohnlage: Wohnlage;',
        '  readonly bezugsfertigkeit: Bezugsfertigkeit;',
        '  /** Minimum apartment size in m² (inclusive). 0 means no lower bound. */',
        '  readonly minM2: number;',
        '  /** Maximum apartment size in m² (exclusive). null means no upper bound. */',
        '  readonly maxM2: number | null;',
        '  /** Lower bound of the rent range (untere Spanne) in €/m²/month */',
        '  readonly lower: number;',
        '  /** Median rent (Mittelwert) in €/m²/month */',
        '  readonly mid: number;',
        '  /** Upper bound of the rent range (obere Spanne) in €/m²/month */',
        '  readonly upper: number;',
        '}',
        '',
        '/**',
        ' * All 163 rows of the Berliner Mietspiegeltabelle 2024.',
        ' * Sections 9.1 (einfach), 9.2 (mittel), 9.3 (gut).',
        ' */',
        'export const MIETSPIEGEL_TABLE: readonly MietspiegelEntry[] = [',
    ]

    for row in rows:
        max_m2 = 'null' if row['maxM2'] is None else str(row['maxM2'])
        lines.append(
            f'  {{ zeile: {row["zeile"]}, wohnlage: "{row["wohnlage"]}", '
            f'bezugsfertigkeit: "{row["bezugsfertigkeit"]}", '
            f'minM2: {row["minM2"]}, maxM2: {max_m2}, '
            f'lower: {row["lower"]}, mid: {row["mid"]}, upper: {row["upper"]} }},'
        )

    lines.append('] as const;')
    lines.append('')

    # Add the Bezugsfertigkeit mapping function
    lines.extend([
        '/** Map a construction year to its Baualtersklasse. Returns null if exempt (ab 2023). */',
        'export function getBezugsfertigkeit(',
        '  year: number,',
        '  isOst: boolean,',
        '): Bezugsfertigkeit | null {',
        '  if (year >= 2023) return null; // Neubau — exempt from Mietspiegel',
        '  if (year >= 2016) return "2016 bis 2022";',
        '  if (year >= 2010) return "2010 bis 2015";',
        '  if (year >= 2002) return "2002 bis 2009";',
        '  if (year >= 1991) return "1991 bis 2001";',
        '  if (year >= 1973 && isOst) return "1973 bis 1990 Ost";',
        '  if (year >= 1986) return "1986 bis 1990 West";',
        '  if (year >= 1973) return "1973 bis 1985 West";',
        '  if (year >= 1965) return "1965 bis 1972";',
        '  if (year >= 1950) return "1950 bis 1964";',
        '  if (year >= 1919) return "1919 bis 1949";',
        '  return "bis 1918";',
        '}',
        '',
        '/**',
        ' * Look up the Mietspiegel entry for a given Wohnlage, building age, and apartment size.',
        ' * Returns the matching entry or null if no match found.',
        ' */',
        'export function lookupMietspiegel(',
        '  wohnlage: Wohnlage,',
        '  bezugsfertigkeit: Bezugsfertigkeit,',
        '  areaM2: number,',
        '): MietspiegelEntry | null {',
        '  return (',
        '    MIETSPIEGEL_TABLE.find(',
        '      (e) =>',
        '        e.wohnlage === wohnlage &&',
        '        e.bezugsfertigkeit === bezugsfertigkeit &&',
        '        areaM2 >= e.minM2 &&',
        '        (e.maxM2 === null || areaM2 < e.maxM2),',
        '    ) ?? null',
        '  );',
        '}',
        '',
        '/**',
        ' * Calculate the maximum legal Nettokaltmiete per m² under Mietpreisbremse.',
        ' * max = Mittelwert × 1.10 (ortsübliche Vergleichsmiete + 10%)',
        ' */',
        'export function maxLegalRentPerM2(entry: MietspiegelEntry): number {',
        '  return Math.round(entry.mid * 1.1 * 100) / 100;',
        '}',
        '',
        '/**',
        ' * Deductions for apartments with lower equipment standard (§9.4).',
        ' * Applies only to buildings bezugsfertig bis 1964.',
        ' */',
        'export const MINDERAUSSTATTUNG_ABSCHLAG = {',
        '  /** Without Sammelheizung, without Bad, with WC in apartment */',
        '  ohneHeizungOhneBad: 0.45,',
        '  /** With Sammelheizung, without Bad, with WC in apartment */',
        '  mitHeizungOhneBad: 0.29,',
        '} as const;',
        '',
    ])

    with open(RENT_TS, "w", encoding="utf-8") as f:
        f.write('\n'.join(lines))
    print(f"Written {len(rows)} rent entries to {RENT_TS}")

def generate_street_data():
    with open(STREET_JSON, encoding="utf-8") as f:
        raw_entries = json.load(f)

    # Clean and group by street name
    # Build a compact structure: street -> [{bezirk, gebiet, hausnr, numType, wohnlage}]
    street_map = {}
    for entry in raw_entries:
        street = clean_street_name(entry["street"])
        if not street:
            continue
        key = street
        if key not in street_map:
            street_map[key] = []
        segment = {
            "bezirk": entry["bezirk"],
            "gebiet": entry["gebiet"],
            "wohnlage": entry["wohnlage"],
        }
        hausnr = entry["hausnr"]
        if hausnr["type"] == "K":
            segment["hausnr"] = "K"
        elif hausnr["type"] == "range":
            segment["hausnr"] = f'{hausnr["from"]}-{hausnr["to"]}'
        elif hausnr["type"] == "single":
            segment["hausnr"] = hausnr["from"]
        else:
            segment["hausnr"] = "K"

        if entry["numType"] and entry["numType"] != "K":
            segment["numType"] = entry["numType"]

        street_map[key].append(segment)

    # Sort streets alphabetically
    sorted_streets = sorted(street_map.keys())

    lines = [
        '/**',
        ' * Straßenverzeichnis zum Berliner Mietspiegel 2024 — Street-to-Wohnlage mapping.',
        ' * Source: https://mietspiegel.berlin.de/wp-content/uploads/2024/11/strassenverzeichnis-zum-mietspiegel-2024-1.pdf',
        ' *',
        ' * Each street has one or more segments with:',
        ' *   - bezirk: District abbreviation',
        ' *   - gebiet: "O" (Ost) or "W" (West) — relevant for 1973-1990 buildings',
        ' *   - wohnlage: "einfach" | "mittel" | "gut"',
        ' *   - hausnr: "K" (whole street) or house number range like "1-43"',
        ' *   - numType: "F" (consecutive), "G" (even), "U" (odd) — only when not "K"',
        ' *',
        ' * Auto-generated — do not edit manually.',
        ' */',
        '',
        'import type { Wohnlage } from "./mietspiegel-table";',
        '',
        'export interface StreetSegment {',
        '  readonly bezirk: string;',
        '  readonly gebiet: "O" | "W" | "";',
        '  readonly wohnlage: Wohnlage;',
        '  /** "K" = whole street, or house number range like "1-43", "2-88" */',
        '  readonly hausnr: string;',
        '  /** "F" = consecutive, "G" = even, "U" = odd. Absent for "K" streets. */',
        '  readonly numType?: "F" | "G" | "U";',
        '}',
        '',
        'export type StreetDirectory = Record<string, readonly StreetSegment[]>;',
        '',
        '/**',
        f' * {len(sorted_streets)} streets with {len(raw_entries)} segments.',
        ' * Lookup: STREET_DIRECTORY["Torstraße"] → segments with Wohnlage per house number range.',
        ' */',
        'export const STREET_DIRECTORY: StreetDirectory = {',
    ]

    for street in sorted_streets:
        segments = street_map[street]
        # Escape the street name for use as a JS key
        escaped = street.replace('\\', '\\\\').replace('"', '\\"')
        lines.append(f'  "{escaped}": [')
        for seg in segments:
            parts = [f'bezirk: "{seg["bezirk"]}"']
            parts.append(f'gebiet: "{seg["gebiet"]}"')
            parts.append(f'wohnlage: "{seg["wohnlage"]}"')
            parts.append(f'hausnr: "{seg["hausnr"]}"')
            if "numType" in seg:
                parts.append(f'numType: "{seg["numType"]}"')
            lines.append(f'    {{ {", ".join(parts)} }},')
        lines.append('  ],')

    lines.append('};')
    lines.append('')

    # Add the lookup function
    lines.extend([
        '/** Normalize a street name for lookup (lowercase, trim, remove common abbreviations). */',
        'function normalizeStreet(name: string): string {',
        '  return name',
        '    .trim()',
        '    .replace(/\\bstr\\.?\\s*$/i, "straße")',
        '    .replace(/\\bpl\\.?\\s*$/i, "platz")',
        '    .toLowerCase();',
        '}',
        '',
        '// Pre-built lowercase index for fast lookups',
        'const streetIndex = new Map<string, readonly StreetSegment[]>();',
        'for (const [key, value] of Object.entries(STREET_DIRECTORY)) {',
        '  streetIndex.set(key.toLowerCase(), value);',
        '}',
        '',
        '/**',
        ' * Look up Wohnlage for a Berlin street address.',
        ' * Returns all matching segments (may differ by house number range).',
        ' */',
        'export function lookupStreet(streetName: string): readonly StreetSegment[] | null {',
        '  const normalized = normalizeStreet(streetName);',
        '  return streetIndex.get(normalized) ?? null;',
        '}',
        '',
        '/**',
        ' * Look up the specific Wohnlage and Gebiet for a street + house number.',
        ' * Returns the best match or null.',
        ' */',
        'export function lookupAddress(',
        '  streetName: string,',
        '  houseNumber: number,',
        '  bezirk?: string,',
        '): { wohnlage: Wohnlage; gebiet: "O" | "W" | "" } | null {',
        '  const segments = lookupStreet(streetName);',
        '  if (!segments) return null;',
        '',
        '  // Filter by bezirk if provided',
        '  const filtered = bezirk',
        '    ? segments.filter((s) => s.bezirk === bezirk)',
        '    : segments;',
        '  if (filtered.length === 0) return null;',
        '',
        '  // If whole street ("K"), return first match',
        '  const complete = filtered.find((s) => s.hausnr === "K");',
        '  if (complete) return { wohnlage: complete.wohnlage, gebiet: complete.gebiet };',
        '',
        '  // Search ranges',
        '  for (const seg of filtered) {',
        '    if (seg.hausnr === "K") continue;',
        '    const rangeMatch = seg.hausnr.match(/^(\\d+)\\s*[A-Da-d]?\\s*-\\s*(\\d+)/);',
        '    if (!rangeMatch) continue;',
        '    const from = parseInt(rangeMatch[1], 10);',
        '    const to = parseInt(rangeMatch[2], 10);',
        '',
        '    // Check numType (G=even, U=odd, F=consecutive)',
        '    if (seg.numType === "G" && houseNumber % 2 !== 0) continue;',
        '    if (seg.numType === "U" && houseNumber % 2 !== 1) continue;',
        '',
        '    if (houseNumber >= from && houseNumber <= to) {',
        '      return { wohnlage: seg.wohnlage, gebiet: seg.gebiet };',
        '    }',
        '  }',
        '',
        '  // Fallback: return the most common Wohnlage for this street',
        '  if (filtered.length > 0) {',
        '    return { wohnlage: filtered[0].wohnlage, gebiet: filtered[0].gebiet };',
        '  }',
        '  return null;',
        '}',
        '',
        '/** District abbreviation mapping */',
        'export const BEZIRK_NAMES: Record<string, string> = {',
        '  ChWi: "Charlottenburg-Wilmersdorf",',
        '  FrKr: "Friedrichshain-Kreuzberg",',
        '  Lich: "Lichtenberg",',
        '  MaHe: "Marzahn-Hellersdorf",',
        '  Mitt: "Mitte",',
        '  Neuk: "Neukölln",',
        '  Pank: "Pankow",',
        '  Rein: "Reinickendorf",',
        '  Span: "Spandau",',
        '  StZe: "Steglitz-Zehlendorf",',
        '  TrKö: "Treptow-Köpenick",',
        '  TSch: "Tempelhof-Schöneberg",',
        '};',
        '',
    ])

    with open(STREET_TS, "w", encoding="utf-8") as f:
        f.write('\n'.join(lines))
    print(f"Written {len(sorted_streets)} streets ({len(raw_entries)} segments) to {STREET_TS}")

if __name__ == "__main__":
    generate_rent_table()
    generate_street_data()
