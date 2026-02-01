"use client";

import { MapContainer, Marker, TileLayer, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { markerIcon, suggestionIcon } from "@/lib/mapMarker";
import { LEAGUE_CITY_CENTER, DEFAULT_ZOOM } from "./Map";
import type { SignSuggestion, SignWithPlacer } from "@/lib/db/types";
import { useEffect } from "react";

function MapCenterController({
  centerOn,
}: {
  centerOn: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (centerOn) {
      map.flyTo([centerOn.lat, centerOn.lng], 16, { duration: 0.5 });
    }
  }, [map, centerOn?.lat, centerOn?.lng]);
  return null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SignsMap({
  signs,
  suggestions = [],
  onSignClick,
  centerOn = null,
  showSuggestionNotes = false,
}: {
  signs: SignWithPlacer[];
  suggestions?: SignSuggestion[];
  onSignClick?: (sign: SignWithPlacer) => void;
  centerOn?: { lat: number; lng: number } | null;
  showSuggestionNotes?: boolean;
}) {
  const stillUp = signs.filter((s) => !s.taken_down_at);

  return (
    <MapContainer
      center={LEAGUE_CITY_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full min-h-[400px]"
      scrollWheelZoom
    >
      <MapCenterController centerOn={centerOn} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup>
        {stillUp.map((sign) => (
          <Marker
            key={sign.id}
            position={[sign.latitude, sign.longitude]}
            icon={markerIcon}
            eventHandlers={{
              click: () => onSignClick?.(sign),
            }}
          >
            <Popup>
              <div className="min-w-[160px]">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {formatDate(sign.placed_at)}
                </p>
                {sign.notes && (
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {sign.notes}
                  </p>
                )}
                {sign.placed_by_email && (
                  <p className="mt-1 text-xs text-zinc-500">
                    Placed by {sign.placed_by_email}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
      {suggestions.map((s) => (
        <Marker
          key={s.id}
          position={[s.latitude, s.longitude]}
          icon={suggestionIcon}
        >
          <Popup>
            <div className="min-w-[160px]">
              <div className="font-medium text-zinc-900 dark:text-zinc-100">
                {(s.zipcode || s.county || s.nearest_intersection) ? (
                  <>
                    {(s.zipcode || s.county) && (
                      <p>
                        {[s.zipcode, s.county].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {s.nearest_intersection && (
                      <p
                        className={
                          s.zipcode || s.county ? "mt-0.5" : ""
                        }
                      >
                        {s.nearest_intersection}
                      </p>
                    )}
                  </>
                ) : (
                  <p>Suggested location</p>
                )}
              </div>
              {showSuggestionNotes && s.notes && (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {s.notes}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
