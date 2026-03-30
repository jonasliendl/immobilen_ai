/**
 * Berliner Mietspiegeltabelle 2024 — Official rent values.
 * Source: Berliner Mietspiegel 2024 vom 30. Mai 2024 (ABl. Nr. 22 / 30.05.2024)
 * PDF: https://mietspiegel.berlin.de/wp-content/uploads/2024/11/mietspiegeltabelle2024.pdf
 *
 * All values are Nettokaltmiete in EUR/m2/month (net cold rent, excluding operating costs).
 */

export type Wohnlage = 'einfach' | 'mittel' | 'gut';

export type Bezugsfertigkeit =
    | 'bis 1918'
    | '1919 bis 1949'
    | '1950 bis 1964'
    | '1965 bis 1972'
    | '1973 bis 1985 West'
    | '1986 bis 1990 West'
    | '1973 bis 1990 Ost'
    | '1991 bis 2001'
    | '2002 bis 2009'
    | '2010 bis 2015'
    | '2016 bis 2022';

export interface MietspiegelEntry {
    readonly zeile: number;
    readonly wohnlage: Wohnlage;
    readonly bezugsfertigkeit: Bezugsfertigkeit;
    readonly minM2: number;
    readonly maxM2: number | null;
    readonly lower: number;
    readonly mid: number;
    readonly upper: number;
}

export const MIETSPIEGEL_TABLE: readonly MietspiegelEntry[] = [
    { zeile: 1, wohnlage: 'einfach', bezugsfertigkeit: 'bis 1918', minM2: 0, maxM2: 35, lower: 7.19, mid: 9.87, upper: 14.19 },
    { zeile: 2, wohnlage: 'einfach', bezugsfertigkeit: 'bis 1918', minM2: 35, maxM2: 40, lower: 6.83, mid: 9.08, upper: 13.08 },
    { zeile: 3, wohnlage: 'einfach', bezugsfertigkeit: 'bis 1918', minM2: 40, maxM2: 45, lower: 6.15, mid: 8.52, upper: 12.54 },
    { zeile: 4, wohnlage: 'einfach', bezugsfertigkeit: 'bis 1918', minM2: 45, maxM2: 55, lower: 6.1, mid: 8.02, upper: 11.19 },
    { zeile: 5, wohnlage: 'einfach', bezugsfertigkeit: 'bis 1918', minM2: 55, maxM2: 60, lower: 6.07, mid: 8.42, upper: 11.0 },
    { zeile: 6, wohnlage: 'einfach', bezugsfertigkeit: 'bis 1918', minM2: 60, maxM2: 90, lower: 5.29, mid: 6.96, upper: 10.39 },
    { zeile: 7, wohnlage: 'einfach', bezugsfertigkeit: 'bis 1918', minM2: 90, maxM2: 105, lower: 4.93, mid: 6.33, upper: 9.97 },
    { zeile: 8, wohnlage: 'einfach', bezugsfertigkeit: 'bis 1918', minM2: 105, maxM2: null, lower: 5.34, mid: 6.61, upper: 9.02 },
    { zeile: 9, wohnlage: 'einfach', bezugsfertigkeit: '1919 bis 1949', minM2: 0, maxM2: 40, lower: 6.5, mid: 7.96, upper: 10.74 },
    { zeile: 10, wohnlage: 'einfach', bezugsfertigkeit: '1919 bis 1949', minM2: 40, maxM2: 60, lower: 5.99, mid: 7.03, upper: 9.35 },
    { zeile: 11, wohnlage: 'einfach', bezugsfertigkeit: '1919 bis 1949', minM2: 60, maxM2: 90, lower: 5.55, mid: 6.54, upper: 8.82 },
    { zeile: 12, wohnlage: 'einfach', bezugsfertigkeit: '1919 bis 1949', minM2: 90, maxM2: 105, lower: 4.93, mid: 6.33, upper: 9.97 },
    { zeile: 13, wohnlage: 'einfach', bezugsfertigkeit: '1919 bis 1949', minM2: 105, maxM2: null, lower: 5.34, mid: 6.61, upper: 9.02 },
    { zeile: 14, wohnlage: 'einfach', bezugsfertigkeit: '1950 bis 1964', minM2: 0, maxM2: 40, lower: 6.5, mid: 7.96, upper: 10.74 },
    { zeile: 15, wohnlage: 'einfach', bezugsfertigkeit: '1950 bis 1964', minM2: 40, maxM2: 60, lower: 5.99, mid: 7.03, upper: 9.35 },
    { zeile: 16, wohnlage: 'einfach', bezugsfertigkeit: '1950 bis 1964', minM2: 60, maxM2: null, lower: 5.23, mid: 6.2, upper: 8.0 },
    { zeile: 17, wohnlage: 'einfach', bezugsfertigkeit: '1965 bis 1972', minM2: 0, maxM2: 55, lower: 5.68, mid: 6.76, upper: 8.58 },
    { zeile: 18, wohnlage: 'einfach', bezugsfertigkeit: '1965 bis 1972', minM2: 55, maxM2: 60, lower: 5.37, mid: 6.1, upper: 7.72 },
    { zeile: 19, wohnlage: 'einfach', bezugsfertigkeit: '1965 bis 1972', minM2: 60, maxM2: null, lower: 5.22, mid: 5.87, upper: 7.18 },
    { zeile: 20, wohnlage: 'einfach', bezugsfertigkeit: '1973 bis 1985 West', minM2: 0, maxM2: 55, lower: 5.68, mid: 6.76, upper: 8.58 },
    { zeile: 21, wohnlage: 'einfach', bezugsfertigkeit: '1973 bis 1985 West', minM2: 55, maxM2: 60, lower: 5.37, mid: 6.1, upper: 7.72 },
    { zeile: 22, wohnlage: 'einfach', bezugsfertigkeit: '1973 bis 1985 West', minM2: 60, maxM2: 90, lower: 5.77, mid: 6.54, upper: 8.51 },
    { zeile: 23, wohnlage: 'einfach', bezugsfertigkeit: '1973 bis 1985 West', minM2: 90, maxM2: null, lower: 5.24, mid: 7.35, upper: 9.08 },
    { zeile: 24, wohnlage: 'einfach', bezugsfertigkeit: '1986 bis 1990 West', minM2: 0, maxM2: 55, lower: 6.47, mid: 8.19, upper: 10.49 },
    { zeile: 25, wohnlage: 'einfach', bezugsfertigkeit: '1986 bis 1990 West', minM2: 55, maxM2: 60, lower: 6.48, mid: 8.56, upper: 11.14 },
    { zeile: 26, wohnlage: 'einfach', bezugsfertigkeit: '1986 bis 1990 West', minM2: 60, maxM2: 75, lower: 6.27, mid: 7.92, upper: 9.59 },
    { zeile: 27, wohnlage: 'einfach', bezugsfertigkeit: '1986 bis 1990 West', minM2: 75, maxM2: 80, lower: 6.89, mid: 8.13, upper: 9.28 },
    { zeile: 28, wohnlage: 'einfach', bezugsfertigkeit: '1986 bis 1990 West', minM2: 80, maxM2: 95, lower: 6.67, mid: 8.06, upper: 9.99 },
    { zeile: 29, wohnlage: 'einfach', bezugsfertigkeit: '1986 bis 1990 West', minM2: 95, maxM2: null, lower: 6.59, mid: 8.38, upper: 9.96 },
    { zeile: 30, wohnlage: 'einfach', bezugsfertigkeit: '1973 bis 1990 Ost', minM2: 0, maxM2: 40, lower: 6.66, mid: 7.16, upper: 8.89 },
    { zeile: 31, wohnlage: 'einfach', bezugsfertigkeit: '1973 bis 1990 Ost', minM2: 40, maxM2: 60, lower: 5.74, mid: 6.25, upper: 7.28 },
    { zeile: 32, wohnlage: 'einfach', bezugsfertigkeit: '1973 bis 1990 Ost', minM2: 60, maxM2: 70, lower: 5.07, mid: 5.37, upper: 6.06 },
    { zeile: 33, wohnlage: 'einfach', bezugsfertigkeit: '1973 bis 1990 Ost', minM2: 70, maxM2: null, lower: 5.03, mid: 5.44, upper: 6.11 },
    { zeile: 34, wohnlage: 'einfach', bezugsfertigkeit: '1991 bis 2001', minM2: 0, maxM2: 55, lower: 6.47, mid: 8.19, upper: 10.49 },
    { zeile: 35, wohnlage: 'einfach', bezugsfertigkeit: '1991 bis 2001', minM2: 55, maxM2: 60, lower: 6.48, mid: 8.56, upper: 11.14 },
    { zeile: 36, wohnlage: 'einfach', bezugsfertigkeit: '1991 bis 2001', minM2: 60, maxM2: 75, lower: 6.27, mid: 7.92, upper: 9.59 },
    { zeile: 37, wohnlage: 'einfach', bezugsfertigkeit: '1991 bis 2001', minM2: 75, maxM2: 80, lower: 6.89, mid: 8.13, upper: 9.28 },
    { zeile: 38, wohnlage: 'einfach', bezugsfertigkeit: '1991 bis 2001', minM2: 80, maxM2: 95, lower: 6.67, mid: 8.06, upper: 9.99 },
    { zeile: 39, wohnlage: 'einfach', bezugsfertigkeit: '1991 bis 2001', minM2: 95, maxM2: null, lower: 6.59, mid: 8.38, upper: 9.96 },
    { zeile: 40, wohnlage: 'einfach', bezugsfertigkeit: '2002 bis 2009', minM2: 0, maxM2: 55, lower: 6.47, mid: 8.19, upper: 10.49 },
    { zeile: 41, wohnlage: 'einfach', bezugsfertigkeit: '2002 bis 2009', minM2: 55, maxM2: 60, lower: 6.48, mid: 8.56, upper: 11.14 },
    { zeile: 42, wohnlage: 'einfach', bezugsfertigkeit: '2002 bis 2009', minM2: 60, maxM2: 75, lower: 6.27, mid: 7.92, upper: 9.59 },
    { zeile: 43, wohnlage: 'einfach', bezugsfertigkeit: '2002 bis 2009', minM2: 75, maxM2: 80, lower: 6.89, mid: 8.13, upper: 9.28 },
    { zeile: 44, wohnlage: 'einfach', bezugsfertigkeit: '2002 bis 2009', minM2: 80, maxM2: 95, lower: 6.67, mid: 8.06, upper: 9.99 },
    { zeile: 45, wohnlage: 'einfach', bezugsfertigkeit: '2002 bis 2009', minM2: 95, maxM2: null, lower: 6.59, mid: 8.38, upper: 9.96 },
    { zeile: 46, wohnlage: 'einfach', bezugsfertigkeit: '2010 bis 2015', minM2: 0, maxM2: null, lower: 7.24, mid: 9.98, upper: 14.48 },
    { zeile: 47, wohnlage: 'einfach', bezugsfertigkeit: '2016 bis 2022', minM2: 0, maxM2: 60, lower: 7.62, mid: 12.41, upper: 16.66 },
    { zeile: 48, wohnlage: 'einfach', bezugsfertigkeit: '2016 bis 2022', minM2: 60, maxM2: 80, lower: 9.0, mid: 11.12, upper: 17.43 },
    { zeile: 49, wohnlage: 'einfach', bezugsfertigkeit: '2016 bis 2022', minM2: 80, maxM2: null, lower: 9.99, mid: 12.48, upper: 16.55 },
    { zeile: 50, wohnlage: 'mittel', bezugsfertigkeit: 'bis 1918', minM2: 0, maxM2: 35, lower: 7.68, mid: 10.12, upper: 12.76 },
    { zeile: 51, wohnlage: 'mittel', bezugsfertigkeit: 'bis 1918', minM2: 35, maxM2: 40, lower: 7.05, mid: 8.98, upper: 13.75 },
    { zeile: 52, wohnlage: 'mittel', bezugsfertigkeit: 'bis 1918', minM2: 40, maxM2: 45, lower: 6.81, mid: 9.37, upper: 12.64 },
    { zeile: 53, wohnlage: 'mittel', bezugsfertigkeit: 'bis 1918', minM2: 45, maxM2: 50, lower: 6.33, mid: 7.48, upper: 12.63 },
    { zeile: 54, wohnlage: 'mittel', bezugsfertigkeit: 'bis 1918', minM2: 50, maxM2: 55, lower: 5.85, mid: 7.45, upper: 10.26 },
    { zeile: 55, wohnlage: 'mittel', bezugsfertigkeit: 'bis 1918', minM2: 55, maxM2: 80, lower: 5.79, mid: 7.91, upper: 11.5 },
    { zeile: 56, wohnlage: 'mittel', bezugsfertigkeit: 'bis 1918', minM2: 80, maxM2: 120, lower: 5.74, mid: 7.57, upper: 11.05 },
    { zeile: 57, wohnlage: 'mittel', bezugsfertigkeit: 'bis 1918', minM2: 120, maxM2: 130, lower: 5.44, mid: 7.25, upper: 11.09 },
    { zeile: 58, wohnlage: 'mittel', bezugsfertigkeit: 'bis 1918', minM2: 130, maxM2: null, lower: 5.03, mid: 6.98, upper: 10.57 },
    { zeile: 59, wohnlage: 'mittel', bezugsfertigkeit: '1919 bis 1949', minM2: 0, maxM2: 35, lower: 6.11, mid: 7.94, upper: 11.49 },
    { zeile: 60, wohnlage: 'mittel', bezugsfertigkeit: '1919 bis 1949', minM2: 35, maxM2: 40, lower: 6.25, mid: 7.53, upper: 9.56 },
    { zeile: 61, wohnlage: 'mittel', bezugsfertigkeit: '1919 bis 1949', minM2: 40, maxM2: 45, lower: 6.44, mid: 7.4, upper: 8.8 },
    { zeile: 62, wohnlage: 'mittel', bezugsfertigkeit: '1919 bis 1949', minM2: 45, maxM2: 50, lower: 6.26, mid: 7.42, upper: 9.28 },
    { zeile: 63, wohnlage: 'mittel', bezugsfertigkeit: '1919 bis 1949', minM2: 50, maxM2: 65, lower: 6.02, mid: 7.12, upper: 9.19 },
    { zeile: 64, wohnlage: 'mittel', bezugsfertigkeit: '1919 bis 1949', minM2: 65, maxM2: 75, lower: 5.69, mid: 6.65, upper: 8.41 },
    { zeile: 65, wohnlage: 'mittel', bezugsfertigkeit: '1919 bis 1949', minM2: 75, maxM2: null, lower: 5.79, mid: 6.96, upper: 10.0 },
    { zeile: 66, wohnlage: 'mittel', bezugsfertigkeit: '1950 bis 1964', minM2: 0, maxM2: 35, lower: 6.11, mid: 7.94, upper: 11.49 },
    { zeile: 67, wohnlage: 'mittel', bezugsfertigkeit: '1950 bis 1964', minM2: 35, maxM2: 40, lower: 6.25, mid: 7.53, upper: 9.56 },
    { zeile: 68, wohnlage: 'mittel', bezugsfertigkeit: '1950 bis 1964', minM2: 40, maxM2: 45, lower: 5.88, mid: 7.07, upper: 9.06 },
    { zeile: 69, wohnlage: 'mittel', bezugsfertigkeit: '1950 bis 1964', minM2: 45, maxM2: null, lower: 5.73, mid: 6.6, upper: 8.86 },
    { zeile: 70, wohnlage: 'mittel', bezugsfertigkeit: '1965 bis 1972', minM2: 0, maxM2: 35, lower: 6.57, mid: 7.36, upper: 14.03 },
    { zeile: 71, wohnlage: 'mittel', bezugsfertigkeit: '1965 bis 1972', minM2: 35, maxM2: 40, lower: 6.45, mid: 7.21, upper: 9.73 },
    { zeile: 72, wohnlage: 'mittel', bezugsfertigkeit: '1965 bis 1972', minM2: 40, maxM2: 45, lower: 5.88, mid: 7.07, upper: 9.06 },
    { zeile: 73, wohnlage: 'mittel', bezugsfertigkeit: '1965 bis 1972', minM2: 45, maxM2: null, lower: 5.36, mid: 6.13, upper: 8.41 },
    { zeile: 74, wohnlage: 'mittel', bezugsfertigkeit: '1973 bis 1985 West', minM2: 0, maxM2: 35, lower: 6.57, mid: 7.36, upper: 14.03 },
    { zeile: 75, wohnlage: 'mittel', bezugsfertigkeit: '1973 bis 1985 West', minM2: 35, maxM2: 40, lower: 6.45, mid: 7.21, upper: 9.73 },
    { zeile: 76, wohnlage: 'mittel', bezugsfertigkeit: '1973 bis 1985 West', minM2: 40, maxM2: 45, lower: 5.88, mid: 7.07, upper: 9.06 },
    { zeile: 77, wohnlage: 'mittel', bezugsfertigkeit: '1973 bis 1985 West', minM2: 45, maxM2: 75, lower: 6.32, mid: 8.18, upper: 10.64 },
    { zeile: 78, wohnlage: 'mittel', bezugsfertigkeit: '1973 bis 1985 West', minM2: 75, maxM2: null, lower: 6.44, mid: 7.85, upper: 10.1 },
    { zeile: 79, wohnlage: 'mittel', bezugsfertigkeit: '1986 bis 1990 West', minM2: 0, maxM2: 50, lower: 8.0, mid: 9.26, upper: 12.34 },
    { zeile: 80, wohnlage: 'mittel', bezugsfertigkeit: '1986 bis 1990 West', minM2: 50, maxM2: 55, lower: 7.17, mid: 8.87, upper: 10.69 },
    { zeile: 81, wohnlage: 'mittel', bezugsfertigkeit: '1986 bis 1990 West', minM2: 55, maxM2: 60, lower: 8.0, mid: 9.27, upper: 11.05 },
    { zeile: 82, wohnlage: 'mittel', bezugsfertigkeit: '1986 bis 1990 West', minM2: 60, maxM2: 70, lower: 7.87, mid: 9.11, upper: 11.46 },
    { zeile: 83, wohnlage: 'mittel', bezugsfertigkeit: '1986 bis 1990 West', minM2: 70, maxM2: 75, lower: 6.89, mid: 8.57, upper: 9.98 },
    { zeile: 84, wohnlage: 'mittel', bezugsfertigkeit: '1986 bis 1990 West', minM2: 75, maxM2: 85, lower: 7.52, mid: 8.86, upper: 10.04 },
    { zeile: 85, wohnlage: 'mittel', bezugsfertigkeit: '1986 bis 1990 West', minM2: 85, maxM2: 90, lower: 6.55, mid: 8.68, upper: 10.43 },
    { zeile: 86, wohnlage: 'mittel', bezugsfertigkeit: '1986 bis 1990 West', minM2: 90, maxM2: 100, lower: 6.24, mid: 8.99, upper: 9.94 },
    { zeile: 87, wohnlage: 'mittel', bezugsfertigkeit: '1986 bis 1990 West', minM2: 100, maxM2: null, lower: 7.21, mid: 9.12, upper: 11.28 },
    { zeile: 88, wohnlage: 'mittel', bezugsfertigkeit: '1973 bis 1990 Ost', minM2: 0, maxM2: 40, lower: 6.41, mid: 7.13, upper: 8.6 },
    { zeile: 89, wohnlage: 'mittel', bezugsfertigkeit: '1973 bis 1990 Ost', minM2: 40, maxM2: 60, lower: 5.59, mid: 6.09, upper: 6.82 },
    { zeile: 90, wohnlage: 'mittel', bezugsfertigkeit: '1973 bis 1990 Ost', minM2: 60, maxM2: 65, lower: 4.99, mid: 5.37, upper: 6.44 },
    { zeile: 91, wohnlage: 'mittel', bezugsfertigkeit: '1973 bis 1990 Ost', minM2: 65, maxM2: null, lower: 4.95, mid: 5.43, upper: 6.35 },
    { zeile: 92, wohnlage: 'mittel', bezugsfertigkeit: '1991 bis 2001', minM2: 0, maxM2: 50, lower: 8.0, mid: 9.26, upper: 12.34 },
    { zeile: 93, wohnlage: 'mittel', bezugsfertigkeit: '1991 bis 2001', minM2: 50, maxM2: 55, lower: 7.17, mid: 8.87, upper: 10.69 },
    { zeile: 94, wohnlage: 'mittel', bezugsfertigkeit: '1991 bis 2001', minM2: 55, maxM2: 60, lower: 8.0, mid: 9.27, upper: 11.05 },
    { zeile: 95, wohnlage: 'mittel', bezugsfertigkeit: '1991 bis 2001', minM2: 60, maxM2: 70, lower: 7.87, mid: 9.11, upper: 11.46 },
    { zeile: 96, wohnlage: 'mittel', bezugsfertigkeit: '1991 bis 2001', minM2: 70, maxM2: 75, lower: 6.89, mid: 8.57, upper: 9.98 },
    { zeile: 97, wohnlage: 'mittel', bezugsfertigkeit: '1991 bis 2001', minM2: 75, maxM2: 85, lower: 7.52, mid: 8.86, upper: 10.04 },
    { zeile: 98, wohnlage: 'mittel', bezugsfertigkeit: '1991 bis 2001', minM2: 85, maxM2: 90, lower: 6.55, mid: 8.68, upper: 10.43 },
    { zeile: 99, wohnlage: 'mittel', bezugsfertigkeit: '1991 bis 2001', minM2: 90, maxM2: 100, lower: 6.24, mid: 8.99, upper: 9.94 },
    { zeile: 100, wohnlage: 'mittel', bezugsfertigkeit: '1991 bis 2001', minM2: 100, maxM2: null, lower: 7.21, mid: 9.12, upper: 11.28 },
    { zeile: 101, wohnlage: 'mittel', bezugsfertigkeit: '2002 bis 2009', minM2: 0, maxM2: 50, lower: 8.0, mid: 9.26, upper: 12.34 },
    { zeile: 102, wohnlage: 'mittel', bezugsfertigkeit: '2002 bis 2009', minM2: 50, maxM2: 55, lower: 7.17, mid: 8.87, upper: 10.69 },
    { zeile: 103, wohnlage: 'mittel', bezugsfertigkeit: '2002 bis 2009', minM2: 55, maxM2: 60, lower: 8.0, mid: 9.27, upper: 11.05 },
    { zeile: 104, wohnlage: 'mittel', bezugsfertigkeit: '2002 bis 2009', minM2: 60, maxM2: 70, lower: 7.87, mid: 9.11, upper: 11.46 },
    { zeile: 105, wohnlage: 'mittel', bezugsfertigkeit: '2002 bis 2009', minM2: 70, maxM2: 75, lower: 6.89, mid: 8.57, upper: 9.98 },
    { zeile: 106, wohnlage: 'mittel', bezugsfertigkeit: '2002 bis 2009', minM2: 75, maxM2: 85, lower: 7.52, mid: 8.86, upper: 10.04 },
    { zeile: 107, wohnlage: 'mittel', bezugsfertigkeit: '2002 bis 2009', minM2: 85, maxM2: 90, lower: 6.55, mid: 8.68, upper: 10.43 },
    { zeile: 108, wohnlage: 'mittel', bezugsfertigkeit: '2002 bis 2009', minM2: 90, maxM2: 100, lower: 6.24, mid: 8.99, upper: 9.94 },
    { zeile: 109, wohnlage: 'mittel', bezugsfertigkeit: '2002 bis 2009', minM2: 100, maxM2: null, lower: 7.21, mid: 9.12, upper: 11.28 },
    { zeile: 110, wohnlage: 'mittel', bezugsfertigkeit: '2010 bis 2015', minM2: 0, maxM2: 70, lower: 8.18, mid: 10.76, upper: 16.75 },
    { zeile: 111, wohnlage: 'mittel', bezugsfertigkeit: '2010 bis 2015', minM2: 70, maxM2: 95, lower: 8.92, mid: 12.05, upper: 16.11 },
    { zeile: 112, wohnlage: 'mittel', bezugsfertigkeit: '2010 bis 2015', minM2: 95, maxM2: null, lower: 9.2, mid: 12.77, upper: 15.19 },
    { zeile: 113, wohnlage: 'mittel', bezugsfertigkeit: '2016 bis 2022', minM2: 0, maxM2: 55, lower: 10.22, mid: 14.44, upper: 21.93 },
    { zeile: 114, wohnlage: 'mittel', bezugsfertigkeit: '2016 bis 2022', minM2: 55, maxM2: 65, lower: 10.07, mid: 12.97, upper: 19.24 },
    { zeile: 115, wohnlage: 'mittel', bezugsfertigkeit: '2016 bis 2022', minM2: 65, maxM2: 75, lower: 9.77, mid: 12.1, upper: 17.75 },
    { zeile: 116, wohnlage: 'mittel', bezugsfertigkeit: '2016 bis 2022', minM2: 75, maxM2: 90, lower: 10.06, mid: 13.82, upper: 18.55 },
    { zeile: 117, wohnlage: 'mittel', bezugsfertigkeit: '2016 bis 2022', minM2: 90, maxM2: null, lower: 10.07, mid: 14.41, upper: 18.04 },
    { zeile: 118, wohnlage: 'gut', bezugsfertigkeit: 'bis 1918', minM2: 0, maxM2: 35, lower: 7.39, mid: 10.65, upper: 15.32 },
    { zeile: 119, wohnlage: 'gut', bezugsfertigkeit: 'bis 1918', minM2: 35, maxM2: 40, lower: 6.85, mid: 11.09, upper: 15.31 },
    { zeile: 120, wohnlage: 'gut', bezugsfertigkeit: 'bis 1918', minM2: 40, maxM2: 45, lower: 6.26, mid: 9.2, upper: 13.46 },
    { zeile: 121, wohnlage: 'gut', bezugsfertigkeit: 'bis 1918', minM2: 45, maxM2: 65, lower: 6.52, mid: 8.8, upper: 12.78 },
    { zeile: 122, wohnlage: 'gut', bezugsfertigkeit: 'bis 1918', minM2: 65, maxM2: 115, lower: 6.09, mid: 8.45, upper: 12.55 },
    { zeile: 123, wohnlage: 'gut', bezugsfertigkeit: 'bis 1918', minM2: 115, maxM2: null, lower: 6.14, mid: 8.13, upper: 11.97 },
    { zeile: 124, wohnlage: 'gut', bezugsfertigkeit: '1919 bis 1949', minM2: 0, maxM2: 35, lower: 7.03, mid: 9.45, upper: 14.21 },
    { zeile: 125, wohnlage: 'gut', bezugsfertigkeit: '1919 bis 1949', minM2: 35, maxM2: 40, lower: 6.84, mid: 8.5, upper: 11.45 },
    { zeile: 126, wohnlage: 'gut', bezugsfertigkeit: '1919 bis 1949', minM2: 40, maxM2: 65, lower: 6.47, mid: 8.24, upper: 11.16 },
    { zeile: 127, wohnlage: 'gut', bezugsfertigkeit: '1919 bis 1949', minM2: 65, maxM2: null, lower: 6.05, mid: 7.46, upper: 10.36 },
    { zeile: 128, wohnlage: 'gut', bezugsfertigkeit: '1950 bis 1964', minM2: 0, maxM2: 35, lower: 7.03, mid: 9.45, upper: 14.21 },
    { zeile: 129, wohnlage: 'gut', bezugsfertigkeit: '1950 bis 1964', minM2: 35, maxM2: 40, lower: 6.84, mid: 8.5, upper: 11.45 },
    { zeile: 130, wohnlage: 'gut', bezugsfertigkeit: '1950 bis 1964', minM2: 40, maxM2: 90, lower: 5.82, mid: 7.14, upper: 10.13 },
    { zeile: 131, wohnlage: 'gut', bezugsfertigkeit: '1950 bis 1964', minM2: 90, maxM2: null, lower: 6.32, mid: 8.99, upper: 11.58 },
    { zeile: 132, wohnlage: 'gut', bezugsfertigkeit: '1965 bis 1972', minM2: 0, maxM2: 35, lower: 7.03, mid: 9.45, upper: 14.21 },
    { zeile: 133, wohnlage: 'gut', bezugsfertigkeit: '1965 bis 1972', minM2: 35, maxM2: 40, lower: 6.84, mid: 8.5, upper: 11.45 },
    { zeile: 134, wohnlage: 'gut', bezugsfertigkeit: '1965 bis 1972', minM2: 40, maxM2: 90, lower: 5.82, mid: 7.14, upper: 10.13 },
    { zeile: 135, wohnlage: 'gut', bezugsfertigkeit: '1965 bis 1972', minM2: 90, maxM2: null, lower: 6.32, mid: 8.99, upper: 11.58 },
    { zeile: 136, wohnlage: 'gut', bezugsfertigkeit: '1973 bis 1985 West', minM2: 0, maxM2: 75, lower: 7.27, mid: 9.42, upper: 11.98 },
    { zeile: 137, wohnlage: 'gut', bezugsfertigkeit: '1973 bis 1985 West', minM2: 75, maxM2: 85, lower: 7.51, mid: 9.25, upper: 11.79 },
    { zeile: 138, wohnlage: 'gut', bezugsfertigkeit: '1973 bis 1985 West', minM2: 85, maxM2: 105, lower: 7.94, mid: 9.79, upper: 13.32 },
    { zeile: 139, wohnlage: 'gut', bezugsfertigkeit: '1973 bis 1985 West', minM2: 105, maxM2: 120, lower: 8.55, mid: 10.65, upper: 13.41 },
    { zeile: 140, wohnlage: 'gut', bezugsfertigkeit: '1973 bis 1985 West', minM2: 120, maxM2: null, lower: 6.95, mid: 10.08, upper: 13.02 },
    { zeile: 141, wohnlage: 'gut', bezugsfertigkeit: '1986 bis 1990 West', minM2: 0, maxM2: 75, lower: 8.35, mid: 10.15, upper: 12.91 },
    { zeile: 142, wohnlage: 'gut', bezugsfertigkeit: '1986 bis 1990 West', minM2: 75, maxM2: 85, lower: 7.51, mid: 9.25, upper: 11.79 },
    { zeile: 143, wohnlage: 'gut', bezugsfertigkeit: '1986 bis 1990 West', minM2: 85, maxM2: 105, lower: 7.94, mid: 9.79, upper: 13.32 },
    { zeile: 144, wohnlage: 'gut', bezugsfertigkeit: '1986 bis 1990 West', minM2: 105, maxM2: 120, lower: 8.55, mid: 10.65, upper: 13.41 },
    { zeile: 145, wohnlage: 'gut', bezugsfertigkeit: '1986 bis 1990 West', minM2: 120, maxM2: null, lower: 6.95, mid: 10.08, upper: 13.02 },
    { zeile: 146, wohnlage: 'gut', bezugsfertigkeit: '1973 bis 1990 Ost', minM2: 0, maxM2: 45, lower: 6.11, mid: 6.97, upper: 8.48 },
    { zeile: 147, wohnlage: 'gut', bezugsfertigkeit: '1973 bis 1990 Ost', minM2: 45, maxM2: 60, lower: 5.83, mid: 6.46, upper: 8.54 },
    { zeile: 148, wohnlage: 'gut', bezugsfertigkeit: '1973 bis 1990 Ost', minM2: 60, maxM2: 75, lower: 5.16, mid: 5.68, upper: 8.51 },
    { zeile: 149, wohnlage: 'gut', bezugsfertigkeit: '1973 bis 1990 Ost', minM2: 75, maxM2: null, lower: 5.08, mid: 5.72, upper: 6.47 },
    { zeile: 150, wohnlage: 'gut', bezugsfertigkeit: '1991 bis 2001', minM2: 0, maxM2: 75, lower: 8.35, mid: 10.15, upper: 12.91 },
    { zeile: 151, wohnlage: 'gut', bezugsfertigkeit: '1991 bis 2001', minM2: 75, maxM2: 85, lower: 7.51, mid: 9.25, upper: 11.79 },
    { zeile: 152, wohnlage: 'gut', bezugsfertigkeit: '1991 bis 2001', minM2: 85, maxM2: 105, lower: 7.94, mid: 9.79, upper: 13.32 },
    { zeile: 153, wohnlage: 'gut', bezugsfertigkeit: '1991 bis 2001', minM2: 105, maxM2: 120, lower: 8.55, mid: 10.65, upper: 13.41 },
    { zeile: 154, wohnlage: 'gut', bezugsfertigkeit: '1991 bis 2001', minM2: 120, maxM2: null, lower: 6.95, mid: 10.08, upper: 13.02 },
    { zeile: 155, wohnlage: 'gut', bezugsfertigkeit: '2002 bis 2009', minM2: 0, maxM2: 105, lower: 7.97, mid: 11.04, upper: 15.5 },
    { zeile: 156, wohnlage: 'gut', bezugsfertigkeit: '2002 bis 2009', minM2: 105, maxM2: null, lower: 9.58, mid: 12.12, upper: 15.34 },
    { zeile: 157, wohnlage: 'gut', bezugsfertigkeit: '2010 bis 2015', minM2: 0, maxM2: 85, lower: 10.24, mid: 13.79, upper: 17.56 },
    { zeile: 158, wohnlage: 'gut', bezugsfertigkeit: '2010 bis 2015', minM2: 85, maxM2: null, lower: 11.89, mid: 14.4, upper: 17.34 },
    { zeile: 159, wohnlage: 'gut', bezugsfertigkeit: '2016 bis 2022', minM2: 0, maxM2: 50, lower: 11.41, mid: 17.72, upper: 24.74 },
    { zeile: 160, wohnlage: 'gut', bezugsfertigkeit: '2016 bis 2022', minM2: 50, maxM2: 65, lower: 10.5, mid: 16.8, upper: 23.84 },
    { zeile: 161, wohnlage: 'gut', bezugsfertigkeit: '2016 bis 2022', minM2: 65, maxM2: 85, lower: 11.21, mid: 15.58, upper: 19.93 },
    { zeile: 162, wohnlage: 'gut', bezugsfertigkeit: '2016 bis 2022', minM2: 85, maxM2: 100, lower: 13.69, mid: 17.51, upper: 20.74 },
    { zeile: 163, wohnlage: 'gut', bezugsfertigkeit: '2016 bis 2022', minM2: 100, maxM2: null, lower: 12.22, mid: 16.07, upper: 18.47 },
] as const;

export function getBezugsfertigkeit(year: number, isOst: boolean): Bezugsfertigkeit | null {
    if (year >= 2023) return null;
    if (year >= 2016) return '2016 bis 2022';
    if (year >= 2010) return '2010 bis 2015';
    if (year >= 2002) return '2002 bis 2009';
    if (year >= 1991) return '1991 bis 2001';
    if (year >= 1973 && isOst) return '1973 bis 1990 Ost';
    if (year >= 1986) return '1986 bis 1990 West';
    if (year >= 1973) return '1973 bis 1985 West';
    if (year >= 1965) return '1965 bis 1972';
    if (year >= 1950) return '1950 bis 1964';
    if (year >= 1919) return '1919 bis 1949';
    return 'bis 1918';
}

export function lookupMietspiegel(
    wohnlage: Wohnlage,
    bezugsfertigkeit: Bezugsfertigkeit,
    areaM2: number,
): MietspiegelEntry | null {
    return (
        MIETSPIEGEL_TABLE.find(
            (e) =>
                e.wohnlage === wohnlage &&
                e.bezugsfertigkeit === bezugsfertigkeit &&
                areaM2 >= e.minM2 &&
                (e.maxM2 === null || areaM2 < e.maxM2),
        ) ?? null
    );
}

export function maxLegalRentPerM2(entry: MietspiegelEntry): number {
    return Math.round(entry.mid * 1.1 * 100) / 100;
}
