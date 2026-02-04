"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSignsPublic, getSignReports, getSignSuggestions, getAdoptASignSubmissions } from "@/lib/actions/signs";
import { getAppConfig } from "@/lib/actions/config";
import type { MapClusterConfig } from "@/lib/db/types";
import type { AdoptASignSubmission, SignReport, SignSuggestion, SignWithPlacer } from "@/lib/db/types";
import ReportIssueModal from "./ReportIssueModal";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Header from "./Header";
import SignsList from "./SignsList";
import SuggestLocationButton from "./SuggestLocationButton";
import AdoptASignButton from "./AdoptASignButton";
import AddSignButton from "./AddSignButton";
import AddToHomeScreenHint from "./AddToHomeScreenHint";
import { cn } from "@/lib/utils";

const SignsMap = dynamic(() => import("./SignsMap"), { ssr: false });

export default function Dashboard() {
  const [signs, setSigns] = useState<SignWithPlacer[]>([]);
  const [suggestions, setSuggestions] = useState<SignSuggestion[]>([]);
  const [adoptSubmissions, setAdoptSubmissions] = useState<AdoptASignSubmission[]>([]);
  const [showInstalled, setShowInstalled] = useState(true);
  const [showSuggested, setShowSuggested] = useState(true);
  const [showAdopted, setShowAdopted] = useState(true);
  const [showNeedsAttention, setShowNeedsAttention] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [signReports, setSignReports] = useState<SignReport[]>([]);
  const [reportIssueSign, setReportIssueSign] = useState<SignWithPlacer | null>(null);
  const [centerOnSign, setCenterOnSign] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapClusterConfig, setMapClusterConfig] =
    useState<MapClusterConfig | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [signsData, suggestionsData, adoptData, reportsData, clusterConfig] =
      await Promise.all([
        getSignsPublic("up"),
        getSignSuggestions(),
        getAdoptASignSubmissions(),
        createClient().auth.getUser().then(({ data: { user } }) =>
          user ? getSignReports() : Promise.resolve([] as SignReport[])
        ),
        getAppConfig(),
      ]);
    setSigns(signsData);
    setSuggestions(suggestionsData);
    setAdoptSubmissions(adoptData);
    setSignReports(reportsData);
    setMapClusterConfig(clusterConfig);
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
  const signsWithReports = new Set(signReports.map((r) => r.sign_id));
  const reportsBySign = signReports.reduce<Record<string, SignReport[]>>(
    (acc, r) => {
      if (!acc[r.sign_id]) acc[r.sign_id] = [];
      acc[r.sign_id].push(r);
      return acc;
    },
    {}
  );
  const signsNeedingAttention = signsStillUp.filter((s) =>
    signsWithReports.has(s.id)
  );
  const baseFilteredSigns = showInstalled ? signsStillUp : [];
  const filteredSigns =
    isAuthenticated && showNeedsAttention
      ? baseFilteredSigns.filter((s) => signsWithReports.has(s.id))
      : baseFilteredSigns;
  const filteredSuggestions = showSuggested ? suggestions : [];
  const filteredAdopted = showAdopted ? adoptSubmissions : [];

  const router = useRouter();
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }
  const buttonClass = cn(
    "min-h-[40px] touch-manipulation sm:min-h-0 h-7 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm",
    "bg-[#bb29bb] border-2 border-[#bb29bb] text-white",
    "hover:bg-[#0a3a5a] hover:border-[#bb29bb] hover:text-white"
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#eef4f8] font-sans">
      <AddToHomeScreenHint />
      <Header />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[1fr_minmax(0,1fr)] gap-6 overflow-hidden lg:grid-cols-[1fr_340px] lg:grid-rows-[1fr]">
          <div className="flex min-h-0 flex-col">
            <div className="min-h-[300px] flex-1 overflow-hidden rounded-xl border border-border bg-card sm:min-h-[400px]">
            {loading ? (
              <div className="flex h-full min-h-[300px] items-center justify-center text-muted-foreground">
                Loading map…
              </div>
            ) : (
              <SignsMap
                signs={filteredSigns}
                suggestions={filteredSuggestions}
                adoptSubmissions={filteredAdopted}
                centerOn={centerOnSign}
                showSuggestionNotes={isAuthenticated}
                canEditSigns={isAuthenticated}
                onRefresh={loadData}
                onReportIssue={(sign) => setReportIssueSign(sign)}
                clusterConfig={mapClusterConfig ?? undefined}
              />
            )}
            </div>
          </div>
          <div className="flex min-h-0 flex-col overflow-hidden">
            {isAuthenticated ? (
              <div className="mb-3 flex flex-wrap gap-2">
                <AddSignButton onSuccess={loadData} className={buttonClass} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  asChild
                  className={cn(buttonClass, "font-medium")}
                >
                  <Link href="/admin">Admin</Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className={cn(buttonClass, "font-medium")}
                >
                  Log out
                </Button>
              </div>
            ) : (
              <div className="mb-3 flex flex-wrap gap-2">
                <SuggestLocationButton
                  onSuccess={loadData}
                  className="min-h-[44px] touch-manipulation w-full sm:w-auto bg-[#bb29bb] border-2 border-[#bb29bb] text-white hover:bg-[#8b1a8b] hover:border-[#8b1a8b] hover:text-white"
                />
                <AdoptASignButton
                  onSuccess={loadData}
                  className="min-h-[44px] touch-manipulation w-full sm:w-auto bg-[#6e6da9] border-2 border-[#6e6da9] text-white hover:bg-[#52518a] hover:border-[#52518a] hover:text-white"
                />
              </div>
            )}
            <hr className="my-3 border-zinc-400" />
            <h2 className="mb-2 font-rift text-base font-bold text-foreground">
              Filters
            </h2>
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
                className={`min-h-[44px] touch-manipulation ${showSuggested ? "bg-[#6e6da9] border-[#6e6da9] hover:bg-[#6e6da9]/90 hover:border-[#6e6da9]" : ""}`}
              >
                Suggested ({suggestions.length})
              </Button>
              <Button
                type="button"
                variant={showAdopted ? "default" : "outline"}
                size="default"
                onClick={() => setShowAdopted(!showAdopted)}
                className={`min-h-[44px] touch-manipulation ${showAdopted ? "bg-[#6e6da9] border-[#6e6da9] hover:bg-[#6e6da9]/90 hover:border-[#6e6da9]" : ""}`}
              >
                Adopted ({adoptSubmissions.length})
              </Button>
              {isAuthenticated && (
                <Button
                  type="button"
                  variant={showNeedsAttention ? "default" : "outline"}
                  size="default"
                  onClick={() => setShowNeedsAttention(!showNeedsAttention)}
                  className="min-h-[44px] touch-manipulation"
                >
                  Needs attention ({signsNeedingAttention.length})
                </Button>
              )}
            </div>
            <hr className="mb-3 border-zinc-400" />
            <div className="min-h-0 flex-1 overflow-y-auto">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : (
                <SignsList
                  signs={filteredSigns}
                  suggestions={filteredSuggestions}
                  adoptSubmissions={filteredAdopted}
                  onAdoptedClick={(a) => setCenterOnSign({ lat: a.latitude, lng: a.longitude })}
                  canMarkTakenDown={isAuthenticated}
                  onReportIssue={(sign) => setReportIssueSign(sign)}
                  reportsBySign={reportsBySign}
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
                  onDeleteSuggestion={async (suggestion) => {
                    if (!window.confirm("Delete this suggestion?")) return;
                    const { deleteSignSuggestion } = await import(
                      "@/lib/actions/signs"
                    );
                    const result = await deleteSignSuggestion(suggestion.id);
                    if (result.ok) loadData();
                    else window.alert(result.error);
                  }}
                  onDeleteSign={async (sign) => {
                    if (!window.confirm("Delete this sign?")) return;
                    const { deleteSign } = await import("@/lib/actions/signs");
                    const result = await deleteSign(sign.id);
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
      <ReportIssueModal
        open={!!reportIssueSign}
        onClose={() => setReportIssueSign(null)}
        sign={reportIssueSign}
        onSuccess={loadData}
      />
    </div>
  );
}
