"use client";

import { createSign } from "@/lib/actions/signs";
import { getOrCreateDefaultCampaignForUser } from "@/lib/actions/campaigns";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/utils/compressImage";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { CameraIcon, CrosshairIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

export default function AddSignModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleTakePhoto = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!position) {
      setError("Please set a location on the map first");
      return;
    }
    setLoading(true);
    setError(null);
    const defaultResult = await getOrCreateDefaultCampaignForUser();
    const effectiveCampaignId = defaultResult.ok ? defaultResult.campaignId : null;
    if (!effectiveCampaignId) {
      setError(defaultResult.ok ? "No campaign" : defaultResult.error);
      setLoading(false);
      return;
    }
    let photoUrl: string | undefined;
    if (photoFile) {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Not signed in");
        setLoading(false);
        return;
      }
      try {
        const blob = await compressImage(photoFile);
        const path = `${user.id}/${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("sign-photos")
          .upload(path, blob, { contentType: "image/jpeg", upsert: false });
        if (uploadError) {
          setError(uploadError.message);
          setLoading(false);
          return;
        }
        const {
          data: { publicUrl },
        } = supabase.storage.from("sign-photos").getPublicUrl(path);
        photoUrl = publicUrl;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to compress photo");
        setLoading(false);
        return;
      }
    }
    const result = await createSign({
      campaignId: effectiveCampaignId,
      latitude: position[0],
      longitude: position[1],
      placedAt: new Date().toISOString(),
      photoUrl,
    });
    setLoading(false);
    if (result.ok) {
      onSuccess();
      onClose();
      setPosition(null);
      setPhotoFile(null);
      setPhotoPreview(null);
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
      <DialogContent className="flex flex-col h-[95vh] sm:max-w-2xl bg-[#eef4f8] text-foreground border-border p-4">
        <DialogHeader className="pb-2">
          <DialogTitle>Add sign</DialogTitle>
        </DialogHeader>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {/* Large map - takes most of the space */}
        <div className="flex-1 min-h-[500px] sm:min-h-[600px]">
          <MapPicker
            position={position}
            onPositionChange={(lat, lng) => setPosition([lat, lng])}
            className="h-full w-full rounded-lg"
          />
        </div>

        {/* Photo preview if taken */}
        {photoPreview && (
          <div className="flex items-center gap-2 py-2">
            <img
              src={photoPreview}
              alt="Preview"
              className="h-12 w-12 rounded border border-border object-cover"
            />
            <span className="text-sm text-muted-foreground">Photo attached</span>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
          className="hidden"
        />

        {/* 4 compact buttons in a row */}
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
            onClick={handleTakePhoto}
            disabled={loading}
            className={buttonClass}
          >
            <CameraIcon className="size-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Take Photo</span>
            <span className="sm:hidden">Photo</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSubmit}
            disabled={loading || !position}
            className={cn(buttonClass, !position && "opacity-50")}
          >
            {loading ? "Saving…" : "Add Sign"}
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
