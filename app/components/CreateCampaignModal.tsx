"use client";

import { createCampaign } from "@/lib/actions/campaigns";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateCampaignModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    const result = await createCampaign(name.trim());
    setLoading(false);
    if (result.ok) {
      const base = typeof window !== "undefined" ? window.location.origin : "";
      setInviteCode(result.inviteCode);
      setInviteLink(`${base}/join?code=${result.inviteCode}`);
      onSuccess();
    } else {
      setError(result.error);
    }
  }

  function handleClose() {
    onClose();
    setName("");
    setError(null);
    setInviteCode(null);
    setInviteLink(null);
  }

  async function copyLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {inviteLink ? "Campaign created" : "Create campaign"}
          </DialogTitle>
        </DialogHeader>
        {inviteLink ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Share this link or code with volunteers so they can join the campaign.
            </p>
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <p className="break-all text-sm font-mono text-foreground">
                {inviteLink}
              </p>
              {inviteCode && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Code: <strong>{inviteCode}</strong>
                </p>
              )}
            </div>
            <Button type="button" variant="outline" onClick={copyLink} className="w-full">
              Copy link
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign name</Label>
              <Input
                id="campaign-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. League City Vote411"
                required
                disabled={loading}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !name.trim()}>
                {loading ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
