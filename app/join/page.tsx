"use client";

import { joinCampaignByInviteCode } from "@/lib/actions/campaigns";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
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

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get("code");
  const [code, setCode] = useState(codeFromUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joiningFromUrl, setJoiningFromUrl] = useState(!!codeFromUrl);

  useEffect(() => {
    if (codeFromUrl && !loading && !error) {
      setJoiningFromUrl(true);
      setLoading(true);
      setError(null);
      joinCampaignByInviteCode(codeFromUrl).then((result) => {
        setLoading(false);
        if (result.ok) {
          router.push("/");
          router.refresh();
        } else {
          setError(result.error);
        }
      });
    }
  }, [codeFromUrl, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    const result = await joinCampaignByInviteCode(code.trim());
    setLoading(false);
    if (result.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm border-border bg-card shadow-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-xl text-foreground">Join a campaign</CardTitle>
          <CardDescription>
            Enter the invite code shared with you, or use the invite link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {joiningFromUrl && codeFromUrl ? (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {loading ? "Joining…" : error ? error : "Redirecting…"}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="code" className="sr-only">
                  Invite code
                </Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Invite code"
                  autoFocus
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading || !code.trim()} className="w-full">
                {loading ? "Joining…" : "Join campaign"}
              </Button>
            </form>
          )}
          <p className="mt-6 text-center">
            <Button variant="link" asChild className="text-muted-foreground">
              <Link href="/">Back to map</Link>
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>}>
      <JoinForm />
    </Suspense>
  );
}
