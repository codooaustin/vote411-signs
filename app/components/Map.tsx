"use client";

import { MapContainer, TileLayer } from "react-leaflet";

// League City, TX and surrounding area (wider: Friendswood, Dickinson, Clear Lake)
export const LEAGUE_CITY_CENTER: [number, number] = [29.5074, -95.0949];
export const DEFAULT_ZOOM = 10;

export default function Map() {
  return (
    <MapContainer
      center={LEAGUE_CITY_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full min-h-[400px]"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
}
