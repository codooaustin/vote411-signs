"use client";

import type { AdoptASignSubmission, SignReport, SignSuggestion, SignWithPlacer } from "@/lib/db/types";
import { AlertTriangle, HeartHandshake, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function formatReportDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDirectionsUrl(lat: number, lng: number): string {
  const isApple =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod|Mac/.test(navigator.userAgent);
  if (isApple) {
    return `https://maps.apple.com/?daddr=${lat},${lng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export default function SignsList({
  signs,
  suggestions = [],
  onMarkTakenDown,
  onSignClick,
  onSuggestionClick,
  onConvertSuggestion,
  onDeleteSuggestion,
  onDeleteSign,
  onReportIssue,
  reportsBySign = {},
  adoptSubmissions = [],
  onAdoptedClick,
  canMarkTakenDown = false,
}: {
  signs: SignWithPlacer[];
  suggestions?: SignSuggestion[];
  adoptSubmissions?: AdoptASignSubmission[];
  onMarkTakenDown: (sign: SignWithPlacer) => void;
  onSignClick?: (sign: SignWithPlacer) => void;
  onSuggestionClick?: (suggestion: SignSuggestion) => void;
  onConvertSuggestion?: (suggestion: SignSuggestion) => void;
  onDeleteSuggestion?: (suggestion: SignSuggestion) => void;
  onDeleteSign?: (sign: SignWithPlacer) => void;
  onReportIssue?: (sign: SignWithPlacer) => void;
  reportsBySign?: Record<string, SignReport[]>;
  onAdoptedClick?: (adopted: AdoptASignSubmission) => void;
  canMarkTakenDown?: boolean;
}) {
  const hasItems = signs.length > 0 || suggestions.length > 0 || adoptSubmissions.length > 0;
  if (!hasItems) {
    return (
      <Card className="border-border bg-primary text-primary-foreground">
        <CardContent className="px-2 py-0.5 text-center text-xs text-primary-foreground/80">
          No signs yet. Log in to add one, suggest a location, or adopt a sign.
        </CardContent>
      </Card>
    );
  }

  return (
    <ul className="space-y-0.5">
      {signs.map((sign) => {
        const isUp = !sign.taken_down_at;
        const signReports = reportsBySign[sign.id] ?? [];
        const hasReports = signReports.length > 0;
        return (
          <li key={sign.id}>
            <Card className="border-border bg-primary text-primary-foreground shadow-sm py-0.5">
              <CardContent className="cursor-pointer px-2 py-0.5" onClick={() => onSignClick?.(sign)}>
                <div className="flex gap-1.5 items-center">
                  <img
                    src="/Vote411-logo_darkbg_twitter.png"
                    alt="Vote411"
                    className="h-10 w-10 shrink-0 rounded object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    {(sign.zipcode || sign.county || sign.nearest_intersection) && (
                      <div className="text-sm text-primary-foreground/80">
                        {(sign.zipcode || sign.county) && (
                          <p>
                            {[sign.zipcode, sign.county].filter(Boolean).join(", ")}
                          </p>
                        )}
                        {sign.nearest_intersection && (
                          <p
                            className={
                              sign.zipcode || sign.county ? "mt-0.5" : ""
                            }
                          >
                            {sign.nearest_intersection}
                          </p>
                        )}
                      </div>
                    )}
                    {sign.notes && (
                      <p className="mt-0.5 text-xs text-primary-foreground/80 line-clamp-1">
                        {sign.notes}
                      </p>
                    )}
                    {canMarkTakenDown && hasReports && (
                      <div className="mt-1 space-y-0.5">
                        <div className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-200">
                          <AlertTriangle className="size-3" aria-hidden />
                          <span>Needs attention</span>
                        </div>
                        <div className="space-y-0.5 text-xs text-primary-foreground/80">
                          {signReports.map((r) => (
                            <p key={r.id} className="line-clamp-2">
                              {r.comment} – {formatReportDate(r.created_at)}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 flex flex-col gap-1 items-end" onClick={(e) => e.stopPropagation()}>
                    {onReportIssue && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReportIssue(sign);
                        }}
                        className="h-6 min-h-[24px] w-full min-w-[100px] touch-manipulation px-1.5 text-[11px] text-[#0a3a5a] bg-white/90 border-[#0a3a5a] hover:bg-white hover:border-[#0a3a5a]"
                      >
                        <AlertTriangle className="size-2.5 shrink-0" aria-hidden />
                        <span className="ml-0.5 truncate">Report issue</span>
                      </Button>
                    )}
                    {canMarkTakenDown && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-6 min-h-[24px] w-full min-w-[100px] touch-manipulation px-1.5 text-[11px] text-[#0a3a5a] bg-white/90 border-[#0a3a5a] hover:bg-white hover:border-[#0a3a5a]"
                        >
                          <a
                            href={getDirectionsUrl(sign.latitude, sign.longitude)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Directions
                          </a>
                        </Button>
                        {isUp ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkTakenDown(sign);
                            }}
                            className="h-6 min-h-[24px] w-full min-w-[100px] touch-manipulation px-1.5 text-[11px] bg-[#bb29bb] border-[#bb29bb] text-white hover:bg-[#0a3a5a] hover:border-[#bb29bb] hover:text-white"
                          >
                            Mark down
                          </Button>
                        ) : (
                          <span className="inline-flex h-6 min-h-[24px] w-full min-w-[100px] items-center justify-center rounded border border-primary-foreground/30 bg-primary-foreground/20 px-1.5 text-[11px] text-primary-foreground">
                            Taken down
                          </span>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSign?.(sign);
                          }}
                          className="h-6 min-h-[24px] w-full min-w-[100px] touch-manipulation px-1.5 text-[11px] text-destructive bg-white/90 border-destructive hover:bg-white hover:text-destructive"
                        >
                          <Trash2Icon className="size-2.5 shrink-0" aria-hidden />
                          <span className="ml-0.5 truncate">Delete</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </li>
        );
      })}
      {suggestions.map((suggestion) => (
        <li key={suggestion.id}>
          <Card className="border-border bg-[#6e6da9] text-white shadow-sm py-0.5">
            <CardContent
              className="cursor-pointer px-2 py-0.5"
              onClick={() => onSuggestionClick?.(suggestion)}
            >
              <div className="flex gap-1.5 items-center">
                <img
                  src="/Vote411-logo_darkbg_twitter.png"
                  alt="Vote411"
                  className="h-10 w-10 shrink-0 rounded object-contain"
                />
                <div className="min-w-0 flex-1">
                  {(suggestion.zipcode ||
                    suggestion.county ||
                    suggestion.nearest_intersection) ? (
                    <div className="text-sm text-white/90">
                      {(suggestion.zipcode || suggestion.county) && (
                        <p>
                          {[suggestion.zipcode, suggestion.county]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                      {suggestion.nearest_intersection && (
                        <p
                          className={
                            suggestion.zipcode || suggestion.county
                              ? "mt-0.5"
                              : ""
                          }
                        >
                          {suggestion.nearest_intersection}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-white/90">
                      Suggested location
                    </p>
                  )}
                  {canMarkTakenDown && suggestion.notes && (
                    <p className="mt-0.5 text-xs text-white/90 line-clamp-1">
                      {suggestion.notes}
                    </p>
                  )}
                </div>
                {canMarkTakenDown && (
                  <div className="shrink-0 flex flex-col gap-1 items-end" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-6 min-h-[24px] w-full min-w-[100px] touch-manipulation px-1.5 text-[11px] text-[#0a3a5a] bg-white/90 border-[#0a3a5a] hover:bg-white hover:border-[#0a3a5a]"
                    >
                      <a
                        href={getDirectionsUrl(
                          suggestion.latitude,
                          suggestion.longitude
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Directions
                      </a>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onConvertSuggestion?.(suggestion);
                      }}
                      className="h-6 min-h-[24px] w-full min-w-[100px] touch-manipulation px-1.5 text-[11px] bg-[#bb29bb] border-[#bb29bb] text-white hover:bg-[#0a3a5a] hover:border-[#bb29bb] hover:text-white"
                    >
                      Convert to sign
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSuggestion?.(suggestion);
                      }}
                      className="h-6 min-h-[24px] w-full min-w-[100px] touch-manipulation px-1.5 text-[11px] text-destructive bg-white/90 border-destructive hover:bg-white hover:text-destructive"
                    >
                      <Trash2Icon className="size-2.5 shrink-0" aria-hidden />
                      <span className="ml-0.5 truncate">Delete</span>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
      {adoptSubmissions.map((adopted) => (
        <li key={adopted.id}>
          <Card className="border-border bg-[#6e6da9] text-white shadow-sm py-0.5">
            <CardContent
              className="cursor-pointer px-2 py-0.5"
              onClick={() => onAdoptedClick?.(adopted)}
            >
              <div className="flex gap-1.5 items-center">
                <img
                  src="/Vote411-logo_darkbg_twitter.png"
                  alt="Vote411"
                  className="h-10 w-10 shrink-0 rounded object-contain"
                />
                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-1 rounded bg-white/20 px-1.5 py-0.5 text-xs text-white mb-1">
                    <HeartHandshake className="size-3" aria-hidden />
                    <span>Adopted</span>
                  </div>
                  {(adopted.zipcode || adopted.county || adopted.nearest_intersection) ? (
                    <div className="text-sm text-white/90">
                      {(adopted.zipcode || adopted.county) && (
                        <p>
                          {[adopted.zipcode, adopted.county].filter(Boolean).join(", ")}
                        </p>
                      )}
                      {adopted.nearest_intersection && (
                        <p
                          className={
                            adopted.zipcode || adopted.county ? "mt-0.5" : ""
                          }
                        >
                          {adopted.nearest_intersection}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-white/90">Adopted location</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
