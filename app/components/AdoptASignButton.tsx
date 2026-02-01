"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import AdoptASignModal from "./AdoptASignModal";
import { cn } from "@/lib/utils";

export default function AdoptASignButton({
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
        Adopt a sign
      </Button>
      <AdoptASignModal
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
