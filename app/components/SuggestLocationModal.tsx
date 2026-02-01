"use client";

import {
  createSignSuggestion,
  getSignsPublic,
  getSignSuggestions,
} from "@/lib/actions/signs";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { CrosshairIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

export default function SuggestLocationModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contextSigns, setContextSigns] = useState<
    Array<{ id: string; latitude: number; longitude: number }>
  >([]);
  const [contextSuggestions, setContextSuggestions] = useState<
    Array<{ id: string; latitude: number; longitude: number }>
  >([]);

  useEffect(() => {
    if (!open) return;
    Promise.all([getSignsPublic("up"), getSignSuggestions()]).then(
      ([signsData, suggestionsData]) => {
        setContextSigns(
          signsData.map((s) => ({
            id: s.id,
            latitude: s.latitude,
            longitude: s.longitude,
          }))
        );
        setContextSuggestions(
          suggestionsData.map((s) => ({
            id: s.id,
            latitude: s.latitude,
            longitude: s.longitude,
          }))
        );
      }
    );
  }, [open]);

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setLoading(false);
      },
      () => {
        setError("Could not get location");
        setLoading(false);
      }
    );
  }, []);

  const handleSubmit = async () => {
    if (!position) {
      setError("Please set a location on the map first");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await createSignSuggestion({
      latitude: position[0],
      longitude: position[1],
      notes: notes.trim() || undefined,
    });
    setLoading(false);
    if (result.ok) {
      onSuccess();
      onClose();
      setPosition(null);
      setNotes("");
    } else {
      setError(result.error);
    }
  };

  const buttonClass = cn(
    "flex-1 min-h-[44px] touch-manipulation text-xs sm:text-sm px-2 sm:px-3",
    "bg-[#bb29bb] border-2 border-[#bb29bb] text-white",
    "hover:bg-[#0a3a5a] hover:border-[#bb29bb] hover:text-white"
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="flex flex-col overflow-y-auto max-h-[90dvh] sm:max-w-2xl bg-[#eef4f8] text-foreground border-border p-4"
      >
        <DialogHeader className="pb-2">
          <DialogTitle>Suggest a location</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Tap the map or use your location to suggest a spot for a Vote411 sign.
        </p>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="h-[220px] sm:h-[380px] shrink-0">
          <MapPicker
            position={position}
            onPositionChange={(lat, lng) => setPosition([lat, lng])}
            signs={contextSigns}
            suggestions={contextSuggestions}
            className="h-full w-full rounded-lg"
          />
        </div>

        <div>
          <textarea
            id="suggest-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Why is this a good spot for a sign?"
            className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            disabled={loading}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleUseMyLocation}
            disabled={loading}
            className={buttonClass}
          >
            <CrosshairIcon className="size-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Use My Location</span>
            <span className="sm:hidden">Location</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSubmit}
            disabled={loading || !position}
            className={cn(buttonClass, !position && "opacity-50")}
          >
            {loading ? "Submitting…" : "Suggest location"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 min-h-[44px] touch-manipulation text-xs sm:text-sm px-2 sm:px-3 bg-transparent border-2 border-[#0a3a5a] text-[#0a3a5a] hover:bg-[#0a3a5a]/10"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
