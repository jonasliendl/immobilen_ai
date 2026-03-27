import {
    NeighborhoodCommuteCorridor,
    NeighborhoodMapResponse,
    NeighborhoodMetrics,
    NeighborhoodOverlayArea,
} from "@/lib/types";

const berlinCenter: [number, number] = [13.405, 52.52];

const fallbackDistrictShapes: Record<
    string,
    {
        lorName: string;
        center: [number, number];
        polygon: [number, number][];
    }
> = {
    "Prenzlauer Berg": {
        lorName: "Prenzlauer Berg Nord",
        center: [13.4275, 52.5416],
        polygon: [
            [13.407, 52.549],
            [13.447, 52.549],
            [13.447, 52.529],
            [13.407, 52.529],
            [13.407, 52.549],
        ],
    },
    Lichtenberg: {
        lorName: "Lichtenberg Mitte",
        center: [13.49, 52.514],
        polygon: [
            [13.462, 52.526],
            [13.528, 52.526],
            [13.528, 52.496],
            [13.462, 52.496],
            [13.462, 52.526],
        ],
    },
    Pankow: {
        lorName: "Pankow Zentrum",
        center: [13.404, 52.57],
        polygon: [
            [13.372, 52.585],
            [13.442, 52.585],
            [13.442, 52.552],
            [13.372, 52.552],
            [13.372, 52.585],
        ],
    },
    Neukoelln: {
        lorName: "Neukoelln Nord",
        center: [13.431, 52.481],
        polygon: [
            [13.396, 52.495],
            [13.468, 52.495],
            [13.468, 52.462],
            [13.396, 52.462],
            [13.396, 52.495],
        ],
    },
    Moabit: {
        lorName: "Moabit West",
        center: [13.342, 52.53],
        polygon: [
            [13.314, 52.54],
            [13.367, 52.54],
            [13.367, 52.517],
            [13.314, 52.517],
            [13.314, 52.54],
        ],
    },
};

type UnknownFeature = {
    type: string;
    properties?: Record<string, unknown>;
    geometry?: {
        type?: string;
        coordinates?: unknown;
    };
};

type UnknownFeatureCollection = {
    type?: string;
    features?: UnknownFeature[];
};

function normalize(input: string) {
    return input.toLowerCase().replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ä/g, "ae");
}

function serializeProperties(properties: Record<string, unknown> | undefined) {
    if (!properties) return "";

    return Object.values(properties)
        .filter((value) => typeof value === "string")
        .join(" ")
        .toLowerCase();
}

function buildFallbackAreas(metrics: NeighborhoodMetrics[]): NeighborhoodOverlayArea[] {
    const areas: NeighborhoodOverlayArea[] = [];

    for (const metric of metrics) {
        const shape = fallbackDistrictShapes[metric.district];
        if (!shape) continue;

        areas.push({
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [shape.polygon],
            },
            properties: {
                district: metric.district,
                lorName: shape.lorName,
                source: "fallback",
                avgNoiseScore: metric.avgNoiseScore,
                commuteMinutesToCenter: metric.commuteMinutesToCenter,
                safetyScore: metric.safetyScore,
                greenSpaceScore: metric.greenSpaceScore,
                schoolAccessScore: metric.schoolAccessScore,
                foodAndCultureScore: metric.foodAndCultureScore,
                vibeTags: metric.vibeTags,
                developmentAlertCount: metric.developmentAlerts.length,
            },
        });
    }

    return areas;
}

function buildCommuteCorridors(areas: NeighborhoodOverlayArea[]): NeighborhoodCommuteCorridor[] {
    const corridors: NeighborhoodCommuteCorridor[] = [];

    for (const area of areas) {
        const shape = fallbackDistrictShapes[area.properties.district];
        if (!shape) continue;

        corridors.push({
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [shape.center, berlinCenter],
            },
            properties: {
                district: area.properties.district,
                source: area.properties.source,
                commuteMinutesToCenter: area.properties.commuteMinutesToCenter,
            },
        });
    }

    return corridors;
}

async function fetchOfficialLorAreas(metrics: NeighborhoodMetrics[]) {
    const url = process.env.BERLIN_LOR_GEOJSON_URL;
    if (!url) return null;

    try {
        const response = await fetch(url, {
            next: { revalidate: 60 * 60 * 24 },
            headers: { accept: "application/geo+json, application/json" },
        });

        if (!response.ok) return null;

        const data = (await response.json()) as UnknownFeatureCollection;
        if (!Array.isArray(data.features)) return null;

        const areas: NeighborhoodOverlayArea[] = [];

        for (const feature of data.features) {
            if (!feature.geometry?.type || !feature.geometry.coordinates) {
                continue;
            }

            const serialized = serializeProperties(feature.properties);
            const matchedMetric = metrics.find((metric) => serialized.includes(normalize(metric.district)));

            if (!matchedMetric) continue;

            const lorName =
                (feature.properties?.PLRNAME as string | undefined) ??
                (feature.properties?.name as string | undefined) ??
                matchedMetric.district;

            areas.push({
                type: "Feature",
                geometry: {
                    type: feature.geometry.type as NeighborhoodOverlayArea["geometry"]["type"],
                    coordinates: feature.geometry.coordinates as NeighborhoodOverlayArea["geometry"]["coordinates"],
                },
                properties: {
                    district: matchedMetric.district,
                    lorName,
                    source: "berlin-open-data",
                    avgNoiseScore: matchedMetric.avgNoiseScore,
                    commuteMinutesToCenter: matchedMetric.commuteMinutesToCenter,
                    safetyScore: matchedMetric.safetyScore,
                    greenSpaceScore: matchedMetric.greenSpaceScore,
                    schoolAccessScore: matchedMetric.schoolAccessScore,
                    foodAndCultureScore: matchedMetric.foodAndCultureScore,
                    vibeTags: matchedMetric.vibeTags,
                    developmentAlertCount: matchedMetric.developmentAlerts.length,
                },
            });
        }

        if (areas.length === 0) return null;

        return areas;
    } catch {
        return null;
    }
}

export async function getNeighborhoodMapOverlay(
    metrics: NeighborhoodMetrics[],
): Promise<NeighborhoodMapResponse> {
    const officialAreas = await fetchOfficialLorAreas(metrics);
    const areas = officialAreas ?? buildFallbackAreas(metrics);

    return {
        generatedAtIso: new Date().toISOString(),
        source: officialAreas ? "berlin-open-data" : "fallback",
        areas,
        commuteCorridors: buildCommuteCorridors(areas),
    };
}