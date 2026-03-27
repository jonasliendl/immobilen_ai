"use client";

import {
    GeoJSON,
    LayersControl,
    MapContainer,
    TileLayer,
    Tooltip,
} from "react-leaflet";
import { NeighborhoodMapResponse } from "@/lib/types";

type BerlinNeighborhoodMapProps = {
    overlay: NeighborhoodMapResponse;
    heightClassName?: string;
    selectedDistrict?: string;
};

const berlinCenter: [number, number] = [52.52, 13.405];

function noiseColor(score: number) {
    if (score <= 35) return "#1f7a5b";
    if (score <= 45) return "#c9972f";
    return "#cb4d3e";
}

export function BerlinNeighborhoodMap({
    overlay,
    heightClassName = "h-[420px]",
    selectedDistrict,
}: BerlinNeighborhoodMapProps) {
    const areaCollection = {
        type: "FeatureCollection" as const,
        features: overlay.areas,
    };

    const corridorCollection = {
        type: "FeatureCollection" as const,
        features: overlay.commuteCorridors,
    };

    return (
        <div className={`overflow-hidden rounded-2xl border border-black/10 ${heightClassName}`}>
            <MapContainer
                center={berlinCenter}
                zoom={11}
                scrollWheelZoom={false}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <LayersControl position="topright">
                    <LayersControl.Overlay checked name="Noise overlay">
                        <GeoJSON
                            data={areaCollection}
                            style={(feature) => {
                                const properties = feature?.properties as NeighborhoodMapResponse["areas"][number]["properties"] | undefined;
                                const isSelected = selectedDistrict === properties?.district;

                                return {
                                    color: isSelected ? "#111111" : "#ffffff",
                                    weight: isSelected ? 3 : 1.5,
                                    fillColor: properties ? noiseColor(properties.avgNoiseScore) : "#666666",
                                    fillOpacity: 0.45,
                                };
                            }}
                            onEachFeature={(feature, layer) => {
                                const properties = feature.properties as NeighborhoodMapResponse["areas"][number]["properties"];
                                layer.bindTooltip(
                                    `${properties.lorName}\nNoise ${properties.avgNoiseScore}/100\nCommute ${properties.commuteMinutesToCenter} min`,
                                );
                            }}
                        />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay checked name="Commute corridors">
                        <GeoJSON
                            data={corridorCollection}
                            style={(feature) => {
                                const properties = feature?.properties as NeighborhoodMapResponse["commuteCorridors"][number]["properties"] | undefined;
                                const opacity = properties
                                    ? Math.min(0.95, Math.max(0.3, properties.commuteMinutesToCenter / 35))
                                    : 0.4;

                                return {
                                    color: "#0f4c81",
                                    weight: 2,
                                    opacity,
                                    dashArray: "6 6",
                                };
                            }}
                        />
                    </LayersControl.Overlay>
                </LayersControl>

                {overlay.areas.map((feature) => {
                    const shape = feature.geometry;
                    if (shape.type !== "Polygon") return null;

                    const ring = shape.coordinates[0];
                    if (!Array.isArray(ring) || !Array.isArray(ring[0])) return null;

                    const firstPoint = ring[0] as [number, number];

                    return (
                        <Tooltip
                            key={`${feature.properties.district}-label`}
                            position={[firstPoint[1], firstPoint[0]]}
                            permanent
                            direction="center"
                            className="border-none bg-transparent shadow-none"
                        >
                            <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-black shadow-sm">
                                {feature.properties.district}
                            </span>
                        </Tooltip>
                    );
                })}
            </MapContainer>
        </div>
    );
}