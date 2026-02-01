"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import AddSignModal from "./AddSignModal";
import { cn } from "@/lib/utils";

export default function AddSignButton({ onSuccess, className }: { onSuccess?: () => void; className?: string }) {
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
        Add sign
      </Button>
      <AddSignModal
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
