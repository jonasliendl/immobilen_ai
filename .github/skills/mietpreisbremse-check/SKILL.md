---
name: mietpreisbremse-check
description: 'Perform a Mietpreisbremse (rent brake) check for a Berlin rental listing using the official Berliner Mietspiegel 2024 data. Use when user asks to check if rent is legal, verify Mietpreisbremse compliance, compare rent to Mietspiegel, assess overpricing, or evaluate a listing price against Berlin rent caps.'
argument-hint: 'Listing ID, address, or rent details to check'
---

# Mietpreisbremse Check

Verify whether a Berlin rental listing complies with Germany's Mietpreisbremse (rent brake) law using the official Berliner Mietspiegel 2024 from https://mietspiegel.berlin.de/.

## When to Use

- User asks "is this rent legal?", "is this overpriced?", "check Mietpreisbremse"
- User wants to compare a listing's rent against the Mietspiegel
- User asks about ortsübliche Vergleichsmiete (standard local comparable rent)
- Evaluating a listing for price fairness on the Intelligence or Search pages
- User asks about maximum legal rent for an address

## Legal Background

The **Mietpreisbremse** (§§ 556d–556g BGB) limits rent at the start of a new tenancy:

- **Maximum legal rent** = ortsübliche Vergleichsmiete + 10%
- The **ortsübliche Vergleichsmiete** (standard local comparable rent) is determined by the **Berliner Mietspiegel 2024** (qualifizierter Mietspiegel gemäß § 558d BGB)
- The Mietspiegel expresses rent as **Nettokaltmiete** (net cold rent) in **€/m²/month** — excluding all Betriebskosten (operating costs), heating, and warm water
- Berlin is a designated Mietpreisbremse area (Mietpreisbremsenverordnung)

### Exceptions (Mietpreisbremse does NOT apply when)

- The apartment was **first occupied after October 1, 2014** (Neubau)
- The apartment underwent **comprehensive modernization** (umfassende Modernisierung)
- The previous tenant already paid more than Mietspiegel + 10% (Vormieter-Ausnahme)
- The apartment is **preisgebundener Wohnraum** (publicly subsidized housing)

## Data Source: Berliner Mietspiegel 2024

Source: Berliner Mietspiegel 2024 vom 30. Mai 2024 (ABl. Nr. 22 / 30.05.2024)
Website: https://mietspiegel.berlin.de/

The Mietspiegel table is organized by three dimensions:
1. **Wohnlage** (residential location quality): einfach / mittel / gut
2. **Baualtersklasse** (building age class / Bezugsfertigkeit)
3. **Wohnfläche** (apartment size in m²)

Each cell contains a **Spanne** (range): lower bound – **Mittelwert** (median) – upper bound of Nettokaltmiete in €/m²/month.

## Procedure

### Step 1: Gather Listing Data

Extract from the listing (database, user input, or listing page):
- **Address** (Straße + Hausnummer) — required for Wohnlage lookup
- **Wohnfläche** (apartment area in m²) — required
- **Bezugsfertigkeit** (year the building was first occupied) — required
- **Kaltmiete** or **Warmmiete** (cold or warm rent) — required
- **Zimmer** (rooms) — helpful context

If the listing only has Warmmiete, note that the Mietspiegel uses Nettokaltmiete. Estimate by subtracting ~2.50–3.50 €/m² for Betriebskosten + heating.

### Step 2: Look Up Wohnlage via Mietspiegel Abfrage-Service

Use the `web` tool to fetch the Mietspiegel Abfrage-Service:

```
Fetch https://mietspiegel.berlin.de/berliner-mietspiegel/mietspiegelabfrage/
with query: "Wohnlage for [street name]"
```

The form accepts a street name (4+ characters) and returns the Wohnlage classification. If the web tool cannot interact with the form, use the reference data in [./references/mietspiegel-table.md](./references/mietspiegel-table.md) and make a best-effort Wohnlage estimate based on district:

| District Pattern | Typical Wohnlage |
|---|---|
| Charlottenburg, Wilmersdorf, Zehlendorf, Steglitz (quiet streets) | gut |
| Prenzlauer Berg, Friedrichshain, Kreuzberg, Mitte, Schöneberg | mittel to gut |
| Wedding, Moabit, Neukölln, Reinickendorf, Spandau | einfach to mittel |
| Marzahn, Hellersdorf, Lichtenberg (Plattenbau areas) | einfach |

**Important**: These are rough defaults. The actual Wohnlage is street-level specific and determined by the Straßenverzeichnis. Always try the Abfrage-Service first.

### Step 3: Determine Baualtersklasse

Map the building year to a Baualtersklasse:

| Bezugsfertigkeit | Baualtersklasse |
|---|---|
| bis 1918 | Altbau bis 1918 |
| 1919–1949 | Altbau 1919–1949 |
| 1950–1964 | Neubau 1950–1964 |
| 1965–1972 | Neubau 1965–1972 |
| 1973–1985 (West) | Neubau 1973–1985 West |
| 1986–1990 (West) | Neubau 1986–1990 West |
| 1973–1990 (Ost + Wendewohnungen) | Neubau 1973–1990 Ost |
| 1991–2001 | Neubau 1991–2001 |
| 2002–2009 | Neubau 2002–2009 |
| 2010–2015 | Neubau 2010–2015 |
| 2016–2022 | Neubau 2016–2022 |
| ab 2023 | NOT IN MIETSPIEGEL (Neubau exempt) |

For 1973–1990, the East/West distinction matters:
- **Östliche Bezirke**: Friedrichshain, Hellersdorf, Hohenschönhausen, Köpenick, Lichtenberg, Marzahn, Mitte (alt), Pankow, Prenzlauer Berg, Treptow, Weißensee + West-Staaken
- **Westliche Bezirke**: Charlottenburg, Kreuzberg, Neukölln, Reinickendorf, Schöneberg, Spandau (ohne West-Staaken), Steglitz, Tempelhof, Tiergarten, Wedding, Wilmersdorf, Zehlendorf

### Step 4: Look Up Mietspiegel Value

Use the Mietspiegel table from [./references/mietspiegel-table.md](./references/mietspiegel-table.md) to find the rent range for the combination of:
- Wohnlage (einfach / mittel / gut)
- Baualtersklasse
- Wohnfläche category

If the exact table is not available, use the `web` tool to fetch the Abfrage-Service result or the Mietspiegeltabelle PDF:
```
https://mietspiegel.berlin.de/wp-content/uploads/2024/11/mietspiegeltabelle2024.pdf
```

### Step 5: Calculate and Assess

```
Nettokaltmiete_per_m2 = Kaltmiete / Wohnfläche_m2

Mietspiegel_Mittelwert = [from table lookup]
Mietspiegel_Oberwert = [upper span value from table]

Max_legal_rent_per_m2 = Mietspiegel_Mittelwert * 1.10  (Mietpreisbremse: +10%)

Difference = Nettokaltmiete_per_m2 - Max_legal_rent_per_m2
Overpayment_monthly = Difference * Wohnfläche_m2
```

### Step 6: Present Results

Provide a clear assessment with these sections:

**Listing Summary**:
- Address, area, building year, listed rent

**Mietspiegel Lookup**:
- Wohnlage, Baualtersklasse, apartment size category
- Mietspiegel range: [lower] – [Mittelwert] – [upper] €/m²

**Mietpreisbremse Assessment**:
- Nettokaltmiete per m²: X.XX €/m²
- Mietspiegel Mittelwert: X.XX €/m²
- Maximum legal rent (+10%): X.XX €/m²
- **Verdict**: ✅ COMPLIANT / ⚠️ BORDERLINE / ❌ EXCEEDS RENT CAP
- Monthly overpayment (if any): X.XX €

**Tenant Advice** (if non-compliant):
- Right to demand rent reduction (§ 556g BGB)
- Right to reclaim overpaid rent (Rüge within 30 months)
- Recommend contacting Berliner Mieterverein or Mieterschutzbund

## Important Disclaimers

Always include:
1. "This check is for informational purposes and is not legally binding. The official Abfrageservice at mietspiegel.berlin.de is also not rechtsverbindlich."
2. "For legally binding assessment, consult the Berliner Mieterverein (berliner-mieterverein.de) or a Fachanwalt für Mietrecht."
3. "The Mietspiegel applies to Nettokaltmiete (net cold rent excluding all operating costs)."
4. If data is incomplete, clearly state which assumptions were made.
