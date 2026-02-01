"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import SuggestLocationModal from "./SuggestLocationModal";
import { cn } from "@/lib/utils";

export default function SuggestLocationButton({
  onSuccess,
  className,
}: {
  onSuccess?: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="default"
        onClick={() => setOpen(true)}
        className={cn("font-medium", className)}
      >
        Suggest location
      </Button>
      <SuggestLocationModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => {
          onSuccess?.();
          setOpen(false);
        }}
      />
    </>
  );
}
