# Berliner Mietspiegel 2024 — Static Data

Source: Berliner Mietspiegel 2024 vom 30. Mai 2024
PDF: https://mietspiegel.berlin.de/wp-content/uploads/2024/11/mietspiegeltabelle2024.pdf

## Static Data Files (use these instead of web lookups)

All Mietspiegel data is now embedded as static TypeScript files in the codebase:

- **`frontend/lib/mietspiegel-table.ts`** — All 163 rows of the Mietspiegeltabelle 2024 with exact lower/mid/upper rent values in €/m²/month, plus lookup functions (`lookupMietspiegel`, `getBezugsfertigkeit`, `maxLegalRentPerM2`)
- **`frontend/lib/mietspiegel-streets.ts`** — 9,771 streets with 13,895 segments from the Straßenverzeichnis, including Wohnlage and Ost/West designation, plus lookup functions (`lookupAddress`, `lookupStreet`)

## Key Types and Functions

```typescript
// Types
type Wohnlage = "einfach" | "mittel" | "gut";
type Bezugsfertigkeit = "bis 1918" | "1919 bis 1949" | ... | "2016 bis 2022";

// Lookup: street name + house number → Wohnlage + Ost/West
lookupAddress("Torstraße", 100) → { wohnlage: "gut", gebiet: "O" }

// Map construction year → Baualtersklasse
getBezugsfertigkeit(1905, true) → "bis 1918"

// Lookup: rent values for Wohnlage × Baualtersklasse × area
lookupMietspiegel("gut", "bis 1918", 65) → { lower: 6.09, mid: 8.45, upper: 12.55 }

// Calculate max legal rent under Mietpreisbremse
maxLegalRentPerM2(entry) → 9.30 // Mittelwert × 1.10
```

## Mietpreisbremse Calculation

```
Max legal Nettokaltmiete per m² = Mietspiegel Mittelwert × 1.10

If listing Nettokaltmiete per m² > Max legal rent:
  → Listing EXCEEDS the Mietpreisbremse by (actual - max_legal) €/m²
  → Monthly overpayment = difference × apartment_area_m²
```

## Straßenverzeichnis

The official street-level Wohnlage lookup is in `frontend/lib/mietspiegel-streets.ts` (9,771 streets, 13,895 segments).

Original PDF: https://mietspiegel.berlin.de/wp-content/uploads/2024/11/strassenverzeichnis-zum-mietspiegel-2024-1.pdf

## Data Generation

The static files were generated from the official PDFs using Python scripts in `scripts/`:
- `scripts/parse-mietspiegel-pdf.py` — Extracts rent table from Mietspiegeltabelle PDF
- `scripts/parse-strassenverzeichnis-pdf.py` — Extracts street directory from Straßenverzeichnis PDF
- `scripts/generate-mietspiegel-ts.py` — Generates the TypeScript files from parsed JSON

To regenerate (e.g., when a new Mietspiegel is published):
```sh
cd scripts
python3 parse-mietspiegel-pdf.py
python3 parse-strassenverzeichnis-pdf.py
python3 generate-mietspiegel-ts.py
```
