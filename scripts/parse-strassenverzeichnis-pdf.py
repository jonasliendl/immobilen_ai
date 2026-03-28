#!/usr/bin/env python3
"""
Parse the Berliner Mietspiegel 2024 Straßenverzeichnis PDF.
Extract street entries with their Wohnlage (e/m/g) and Ost/West designation.
Output: JSON file mapping streets to their Wohnlage segments.
"""
import json
import re
import pdfplumber

PDF_PATH = "../.github/skills/mietpreisbremse-check/references/raw/strassenverzeichnis2024.pdf"
OUT_PATH = "../.github/skills/mietpreisbremse-check/references/raw/strassenverzeichnis2024.json"

def main():
    with pdfplumber.open(PDF_PATH) as pdf:
        print(f"Total pages: {len(pdf.pages)}")
        # Print first few pages to understand structure
        for i in [0, 1, 2]:
            if i < len(pdf.pages):
                text = pdf.pages[i].extract_text()
                if text:
                    print(f"\n--- Page {i+1} ---")
                    print(text[:3000])

if __name__ == "__main__":
    main()
