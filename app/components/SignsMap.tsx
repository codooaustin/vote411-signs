"use client";

import { MapContainer, Marker, TileLayer, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { markerIcon, suggestionIcon, adoptedIcon } from "@/lib/mapMarker";
import { LEAGUE_CITY_CENTER, DEFAULT_ZOOM } from "./Map";
import type { AdoptASignSubmission, MapClusterConfig, SignSuggestion, SignWithPlacer } from "@/lib/db/types";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/utils/compressImage";
import { updateSignPhoto, deleteSign, deleteSignSuggestion } from "@/lib/actions/signs";
import { Button } from "@/components/ui/button";
import { AlertCircle, CameraIcon, Trash2Icon } from "lucide-react";

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

export default function SignsMap({
  signs,
  suggestions = [],
  adoptSubmissions = [],
  onSignClick,
  centerOn = null,
  showSuggestionNotes = false,
  canEditSigns = false,
  onRefresh,
  onReportIssue,
  clusterConfig,
}: {
  signs: SignWithPlacer[];
  suggestions?: SignSuggestion[];
  adoptSubmissions?: AdoptASignSubmission[];
  onSignClick?: (sign: SignWithPlacer) => void;
  centerOn?: { lat: number; lng: number } | null;
  showSuggestionNotes?: boolean;
  canEditSigns?: boolean;
  onRefresh?: () => void;
  onReportIssue?: (sign: SignWithPlacer) => void;
  clusterConfig?: MapClusterConfig;
}) {
  const stillUp = signs.filter((s) => !s.taken_down_at);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingForSignId, setUploadingForSignId] = useState<string | null>(null);

  const handleAddPhotoClick = useCallback((signId: string) => {
    setUploadingForSignId(signId);
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      const signId = uploadingForSignId;
      setUploadingForSignId(null);
      if (!file || !signId) return;
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.alert("Not signed in");
        return;
      }
      try {
        const blob = await compressImage(file);
        const path = `${user.id}/${Date.now()}.jpg`;
        const { error: uploadErr } = await supabase.storage
          .from("sign-photos")
          .upload(path, blob, { contentType: "image/jpeg", upsert: false });
        if (uploadErr) {
          window.alert(uploadErr.message);
          return;
        }
        const { data: { publicUrl } } = supabase.storage.from("sign-photos").getPublicUrl(path);
        const result = await updateSignPhoto(signId, publicUrl);
        if (result.ok) onRefresh?.();
        else window.alert(result.error);
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "Failed to add photo");
      }
    },
    [uploadingForSignId, onRefresh]
  );

  const handleDeleteClick = useCallback(
    async (signId: string) => {
      if (!window.confirm("Delete this sign?")) return;
      const result = await deleteSign(signId);
      if (result.ok) onRefresh?.();
      else window.alert(result.error);
    },
    [onRefresh]
  );

  const handleDeleteSuggestionClick = useCallback(
    async (suggestionId: string) => {
      if (!window.confirm("Delete this suggestion?")) return;
      const result = await deleteSignSuggestion(suggestionId);
      if (result.ok) onRefresh?.();
      else window.alert(result.error);
    },
    [onRefresh]
  );

  const signMarkers = stillUp.map((sign) => (
    <Marker
      key={sign.id}
      position={[sign.latitude, sign.longitude]}
      icon={markerIcon}
      eventHandlers={{
        click: () => onSignClick?.(sign),
      }}
    >
      <Popup>
        <div className="min-w-[200px]" onClick={(e) => e.stopPropagation()}>
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
          {sign.photo_url && (
            <a
              href={sign.photo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block w-full rounded border border-border overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={sign.photo_url}
                alt="Sign"
                className="w-full h-auto object-contain"
              />
            </a>
          )}
          <div className="mt-2 flex flex-wrap gap-1">
            {onReportIssue && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onReportIssue(sign);
                }}
                className="h-6 px-1.5 text-[11px] text-foreground border-foreground/30"
              >
                <AlertCircle className="size-2.5" aria-hidden />
                <span className="ml-0.5">Report issue</span>
              </Button>
            )}
            {canEditSigns && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddPhotoClick(sign.id);
                  }}
                  className="h-7 px-2 text-xs"
                >
                  <CameraIcon className="size-3" aria-hidden />
                  <span className="ml-1">Add photo</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(sign.id);
                  }}
                  className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                >
                  <Trash2Icon className="size-3" aria-hidden />
                  <span className="ml-1">Delete</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  ));

  return (
    <MapContainer
      center={LEAGUE_CITY_CENTER}
      zoom={clusterConfig?.defaultMapZoom ?? DEFAULT_ZOOM}
      className="h-full w-full min-h-[400px]"
      scrollWheelZoom
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden
      />
      <MapCenterController centerOn={centerOn} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {clusterConfig?.clusteringEnabled === false ? (
        <Fragment>{signMarkers}</Fragment>
      ) : (
        <MarkerClusterGroup
          maxClusterRadius={clusterConfig?.maxClusterRadius ?? 40}
          disableClusteringAtZoom={clusterConfig?.disableClusteringAtZoom ?? 15}
        >
          {signMarkers}
        </MarkerClusterGroup>
      )}
      {suggestions.map((s) => (
        <Marker
          key={s.id}
          position={[s.latitude, s.longitude]}
          icon={suggestionIcon}
        >
          <Popup>
            <div className="min-w-[160px]" onClick={(e) => e.stopPropagation()}>
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
              {canEditSigns && (
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSuggestionClick(s.id);
                    }}
                    className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2Icon className="size-3" aria-hidden />
                    <span className="ml-1">Delete</span>
                  </Button>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
      {adoptSubmissions.map((a) => (
        <Marker
          key={a.id}
          position={[a.latitude, a.longitude]}
          icon={adoptedIcon}
        >
          <Popup>
            <div className="min-w-[160px]" onClick={(e) => e.stopPropagation()}>
              <div className="font-medium text-zinc-900 dark:text-zinc-100">
                <p className="text-xs text-zinc-500 mb-1">Adopted</p>
                {(a.zipcode || a.county || a.nearest_intersection) ? (
                  <>
                    {(a.zipcode || a.county) && (
                      <p>
                        {[a.zipcode, a.county].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {a.nearest_intersection && (
                      <p className={a.zipcode || a.county ? "mt-0.5" : ""}>
                        {a.nearest_intersection}
                      </p>
                    )}
                  </>
                ) : (
                  <p>Adopted location</p>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
