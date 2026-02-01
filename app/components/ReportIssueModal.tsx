"use client";

import { createSignReport } from "@/lib/actions/signs";
import type { SignWithPlacer } from "@/lib/db/types";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ReportIssueModal({
  open,
  onClose,
  sign,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  sign: SignWithPlacer | null;
  onSuccess: () => void;
}) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!sign) return;
    const trimmed = comment.trim();
    if (!trimmed) {
      setError("Please enter a comment");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await createSignReport(sign.id, trimmed);
    setLoading(false);
    if (result.ok) {
      onSuccess();
      onClose();
      setComment("");
    } else {
      setError(result.error);
    }
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      onClose();
      setComment("");
      setError(null);
    }
  };

  const buttonClass = cn(
    "flex-1 min-h-[44px] touch-manipulation text-xs sm:text-sm px-2 sm:px-3",
    "bg-[#bb29bb] border-2 border-[#bb29bb] text-white",
    "hover:bg-[#0a3a5a] hover:border-[#bb29bb] hover:text-white"
  );

  return (
    <Dialog open={open && !!sign} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#eef4f8] text-foreground border-border p-4">
        <DialogHeader>
          <DialogTitle>Report issue</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Describe what needs attention (e.g. repair, damage, missing).
        </p>
        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Sign needs repair..."
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          disabled={loading}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSubmit}
            disabled={loading || !comment.trim()}
            className={buttonClass}
          >
            {loading ? "Submitting…" : "Submit"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="flex-1 min-h-[44px] touch-manipulation text-xs sm:text-sm px-2 sm:px-3 bg-transparent border-2 border-[#0a3a5a] text-[#0a3a5a] hover:bg-[#0a3a5a]/10"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
