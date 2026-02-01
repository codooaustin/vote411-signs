"use client";

import {
  createAdoptASignSubmission,
  getAdoptASignSubmissions,
  getSignsPublic,
  getSignSuggestions,
} from "@/lib/actions/signs";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { CrosshairIcon, HeartHandshake } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

const DONATE_URL = "https://lwvbayareatx.org/content.aspx?page_id=301&club_id=279524";

export default function AdoptASignModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
  const [contextAdopted, setContextAdopted] = useState<
    Array<{ id: string; latitude: number; longitude: number }>
  >([]);

  useEffect(() => {
    if (!open) return;
    Promise.all([
      getSignsPublic("up"),
      getSignSuggestions(),
      getAdoptASignSubmissions(),
    ]).then(([signsData, suggestionsData, adoptedData]) => {
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
      setContextAdopted(
        adoptedData.map((s) => ({
          id: s.id,
          latitude: s.latitude,
          longitude: s.longitude,
        }))
      );
    });
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
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required");
      return;
    }
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedEmail && !trimmedPhone) {
      setError("Email or phone is required");
      return;
    }
    if (!position) {
      setError("Please set a location on the map first");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await createAdoptASignSubmission({
      name: trimmedName,
      email: trimmedEmail || undefined,
      phone: trimmedPhone || undefined,
      latitude: position[0],
      longitude: position[1],
      notes: notes.trim() || undefined,
    });
    setLoading(false);
    if (result.ok) {
      onSuccess();
      onClose();
      setName("");
      setEmail("");
      setPhone("");
      setPosition(null);
      setNotes("");
    } else {
      setError(result.error);
    }
  };

  const handleDonate = () => {
    window.open(DONATE_URL, "_blank", "noopener,noreferrer");
  };

  const buttonClass = cn(
    "flex-1 min-h-[44px] touch-manipulation text-xs sm:text-sm px-2 sm:px-3",
    "bg-[#bb29bb] border-2 border-[#bb29bb] text-white",
    "hover:bg-[#0a3a5a] hover:border-[#bb29bb] hover:text-white"
  );

  const isValid = name.trim() && (email.trim() || phone.trim()) && position;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="flex flex-col overflow-y-auto max-h-[90dvh] sm:max-w-2xl bg-[#eef4f8] text-foreground border-border p-4"
      >
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2">
            <HeartHandshake className="size-5" aria-hidden />
            Adopt a sign
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Commit to managing a Vote411 sign at a location you choose: put it up, take it down,
          and maintain it during elections and in between. We will contact you to coordinate.
        </p>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="space-y-2">
          <label htmlFor="adopt-name" className="text-sm font-medium">
            Name <span className="text-destructive">*</span>
          </label>
          <input
            id="adopt-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label htmlFor="adopt-email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="adopt-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="adopt-phone" className="text-sm font-medium">
              Phone
            </label>
            <input
              id="adopt-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 555-5555"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              disabled={loading}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">At least one of email or phone is required.</p>

        <div>
          <label className="text-sm font-medium">Suggested sign location</label>
          <div className="mt-1 h-[220px] sm:h-[280px] shrink-0">
            <MapPicker
              position={position}
              onPositionChange={(lat, lng) => setPosition([lat, lng])}
              signs={contextSigns}
              suggestions={contextSuggestions}
              adoptSubmissions={contextAdopted}
              className="h-full w-full rounded-lg"
            />
          </div>
        </div>

        <div>
          <label htmlFor="adopt-notes" className="text-sm font-medium">
            Notes (optional)
          </label>
          <textarea
            id="adopt-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Why is this a good spot? Any special instructions?"
            className="mt-1 w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            disabled={loading}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleUseMyLocation}
            disabled={loading}
            className={buttonClass}
          >
            <CrosshairIcon className="size-4 shrink-0" aria-hidden />
            Use My Location
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSubmit}
            disabled={loading || !isValid}
            className={cn(buttonClass, !isValid && "opacity-50")}
          >
            {loading ? "Submitting…" : "Adopt this sign"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDonate}
            className="flex-1 min-h-[44px] touch-manipulation text-xs sm:text-sm px-2 sm:px-3 bg-[#6e6da9] border-2 border-[#6e6da9] text-white hover:bg-[#6e6da9]/90 hover:border-[#6e6da9]"
          >
            Donate instead
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
