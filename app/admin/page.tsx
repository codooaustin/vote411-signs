"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAppConfig, updateMapClusterConfig } from "@/lib/actions/config";
import type { MapClusterConfig } from "@/lib/db/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminPage() {
  const [config, setConfig] = useState<MapClusterConfig | null>(null);
  const [clusteringEnabled, setClusteringEnabled] = useState(true);
  const [maxClusterRadius, setMaxClusterRadius] = useState("");
  const [disableClusteringAtZoom, setDisableClusteringAtZoom] = useState("");
  const [defaultMapZoom, setDefaultMapZoom] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    getAppConfig().then((c) => {
      setConfig(c);
      setClusteringEnabled(c.clusteringEnabled);
      setMaxClusterRadius(String(c.maxClusterRadius));
      setDisableClusteringAtZoom(String(c.disableClusteringAtZoom));
      setDefaultMapZoom(String(c.defaultMapZoom));
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    const result = await updateMapClusterConfig({
      clusteringEnabled,
      maxClusterRadius: parseInt(maxClusterRadius, 10),
      disableClusteringAtZoom: parseInt(disableClusteringAtZoom, 10),
      defaultMapZoom: parseInt(defaultMapZoom, 10),
    });
    setSaving(false);
    if (result.ok) {
      setConfig({
        clusteringEnabled,
        maxClusterRadius: parseInt(maxClusterRadius, 10),
        disableClusteringAtZoom: parseInt(disableClusteringAtZoom, 10),
        defaultMapZoom: parseInt(defaultMapZoom, 10),
      });
      setMessage({ type: "success", text: "Settings saved." });
    } else {
      setMessage({ type: "error", text: result.error });
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#eef4f8] font-sans">
        <main className="flex flex-1 items-center justify-center p-4">
          <p className="text-muted-foreground">Loading…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#eef4f8] font-sans">
      <main className="flex flex-1 flex-col p-4">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-4 inline-block text-sm text-primary hover:underline"
          >
            ← Back to map
          </Link>
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="font-rift">Map clustering</CardTitle>
              <CardDescription>
                Configure how markers are clustered on the map. Changes apply for
                all users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    id="clusteringEnabled"
                    type="checkbox"
                    checked={clusteringEnabled}
                    onChange={(e) => setClusteringEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="clusteringEnabled" className="cursor-pointer">
                    Enable clustering
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxClusterRadius">Max cluster radius (px)</Label>
                  <Input
                    id="maxClusterRadius"
                    type="number"
                    min={20}
                    max={120}
                    value={maxClusterRadius}
                    onChange={(e) => setMaxClusterRadius(e.target.value)}
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Valid range: 20–120. Default 40.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="disableClusteringAtZoom">
                    Disable clustering at zoom
                  </Label>
                  <Input
                    id="disableClusteringAtZoom"
                    type="number"
                    min={10}
                    max={18}
                    value={disableClusteringAtZoom}
                    onChange={(e) =>
                      setDisableClusteringAtZoom(e.target.value)
                    }
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Valid range: 10–18. At this zoom and above, markers show
                    individually. Default 15.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultMapZoom">Default map zoom</Label>
                  <Input
                    id="defaultMapZoom"
                    type="number"
                    min={8}
                    max={18}
                    value={defaultMapZoom}
                    onChange={(e) => setDefaultMapZoom(e.target.value)}
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Valid range: 8–18. Higher = more zoomed in (e.g. 12 for League
                    City). Default 12.
                  </p>
                </div>
                {message && (
                  <p
                    className={
                      message.type === "error"
                        ? "text-sm text-destructive"
                        : "text-sm text-green-600 dark:text-green-400"
                    }
                  >
                    {message.text}
                  </p>
                )}
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
