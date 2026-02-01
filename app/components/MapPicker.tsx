"use client";

import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { markerIcon, suggestionIcon, adoptedIcon } from "@/lib/mapMarker";
import { LEAGUE_CITY_CENTER, DEFAULT_ZOOM } from "./Map";

function MapClickHandler({
  onPositionChange,
}: {
  onPositionChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({
  position,
  onPositionChange,
  signs = [],
  suggestions = [],
  adoptSubmissions = [],
  className = "h-48 w-full rounded-lg",
}: {
  position: [number, number] | null;
  onPositionChange: (lat: number, lng: number) => void;
  signs?: Array<{ id: string; latitude: number; longitude: number }>;
  suggestions?: Array<{ id: string; latitude: number; longitude: number }>;
  adoptSubmissions?: Array<{ id: string; latitude: number; longitude: number }>;
  className?: string;
}) {
  return (
    <div className={className}>
      <MapContainer
        center={position ?? LEAGUE_CITY_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full rounded-lg"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onPositionChange={onPositionChange} />
        {signs.map((s) => (
          <Marker
            key={s.id}
            position={[s.latitude, s.longitude]}
            icon={markerIcon}
          />
        ))}
        {suggestions.map((s) => (
          <Marker
            key={s.id}
            position={[s.latitude, s.longitude]}
            icon={suggestionIcon}
          />
        ))}
        {adoptSubmissions.map((s) => (
          <Marker
            key={s.id}
            position={[s.latitude, s.longitude]}
            icon={adoptedIcon}
          />
        ))}
        {position && <Marker position={position} icon={markerIcon} />}
      </MapContainer>
    </div>
  );
}
