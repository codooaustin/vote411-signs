"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "vote411-add-to-home-dismissed";

export default function AddToHomeScreenHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    const dismissed = localStorage.getItem(STORAGE_KEY) === "true";
    if (isMobile && !isStandalone && !dismissed) {
      setShow(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="flex items-center justify-between gap-2 border-b border-border bg-accent px-4 py-2 text-sm text-accent-foreground">
      <span>
        Add this app to your home screen for quick access: use your browser&apos;s menu and choose
        &quot;Add to Home Screen&quot;.
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={dismiss}
        className="shrink-0 text-accent-foreground hover:bg-accent-foreground/10"
        aria-label="Dismiss"
      >
        Dismiss
      </Button>
    </div>
  );
}
