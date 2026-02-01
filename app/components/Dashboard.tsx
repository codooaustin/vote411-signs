"use client";

import { useCallback, useEffect, useState } from "react";
import { getSignsPublic, getSignSuggestions } from "@/lib/actions/signs";
import type { SignSuggestion, SignWithPlacer } from "@/lib/db/types";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Header from "./Header";
import SignsList from "./SignsList";
import AddToHomeScreenHint from "./AddToHomeScreenHint";

const SignsMap = dynamic(() => import("./SignsMap"), { ssr: false });

export default function Dashboard() {
  const [signs, setSigns] = useState<SignWithPlacer[]>([]);
  const [suggestions, setSuggestions] = useState<SignSuggestion[]>([]);
  const [showInstalled, setShowInstalled] = useState(true);
  const [showSuggested, setShowSuggested] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [centerOnSign, setCenterOnSign] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [signsData, suggestionsData] = await Promise.all([
      getSignsPublic("up"),
      getSignSuggestions(),
    ]);
    setSigns(signsData);
    setSuggestions(suggestionsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => setIsAuthenticated(!!user));
  }, []);

  const signsStillUp = signs.filter((s) => !s.taken_down_at);
  const filteredSigns = showInstalled ? signsStillUp : [];
  const filteredSuggestions = showSuggested ? suggestions : [];

  return (
    <div className="flex min-h-screen flex-col bg-[#eef4f8] font-sans">
      <AddToHomeScreenHint />
      <Header
        onAddSignSuccess={loadData}
        onSuggestSuccess={loadData}
        isAuthenticated={isAuthenticated}
      />
      <main className="flex min-h-0 flex-1 flex-col p-4">
        <div className="grid flex-1 min-h-0 gap-6 lg:grid-cols-[1fr_340px] lg:grid-rows-[1fr]">
          <div className="flex min-h-0 flex-col">
            <div className="min-h-[300px] flex-1 overflow-hidden rounded-xl border border-border bg-card sm:min-h-[400px]">
            {loading ? (
              <div className="flex h-full min-h-[300px] items-center justify-center text-muted-foreground">
                Loading map…
              </div>
            ) : (
              <SignsMap
                signs={signsStillUp}
                suggestions={suggestions}
                centerOn={centerOnSign}
                showSuggestionNotes={isAuthenticated}
              />
            )}
            </div>
          </div>
          <div className="flex min-h-0 flex-col">
            <div className="mb-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant={showInstalled ? "default" : "outline"}
                size="default"
                onClick={() => setShowInstalled(!showInstalled)}
                className="min-h-[44px] touch-manipulation"
              >
                Installed ({signsStillUp.length})
              </Button>
              <Button
                type="button"
                variant={showSuggested ? "default" : "outline"}
                size="default"
                onClick={() => setShowSuggested(!showSuggested)}
                className="min-h-[44px] touch-manipulation"
              >
                Suggested ({suggestions.length})
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : (
                <SignsList
                  signs={filteredSigns}
                  suggestions={filteredSuggestions}
                  canMarkTakenDown={isAuthenticated}
                  onSignClick={(sign) =>
                    setCenterOnSign({
                      lat: sign.latitude,
                      lng: sign.longitude,
                    })
                  }
                  onSuggestionClick={(s) =>
                    setCenterOnSign({ lat: s.latitude, lng: s.longitude })
                  }
                  onConvertSuggestion={async (suggestion) => {
                    const { convertSuggestionToSign } = await import(
                      "@/lib/actions/signs"
                    );
                    const result = await convertSuggestionToSign(suggestion.id);
                    if (result.ok) loadData();
                    else window.alert(result.error);
                  }}
                  onMarkTakenDown={async (sign) => {
                    const confirmed = window.confirm(
                      "Mark this sign as taken down?"
                    );
                    if (!confirmed) return;
                    const { markSignTakenDown } = await import("@/lib/actions/signs");
                    const result = await markSignTakenDown(sign.id);
                    if (result.ok) loadData();
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
