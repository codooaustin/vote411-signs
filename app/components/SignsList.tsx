"use client";

import type { SignSuggestion, SignWithPlacer } from "@/lib/db/types";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  canMarkTakenDown = false,
}: {
  signs: SignWithPlacer[];
  suggestions?: SignSuggestion[];
  onMarkTakenDown: (sign: SignWithPlacer) => void;
  onSignClick?: (sign: SignWithPlacer) => void;
  onSuggestionClick?: (suggestion: SignSuggestion) => void;
  onConvertSuggestion?: (suggestion: SignSuggestion) => void;
  canMarkTakenDown?: boolean;
}) {
  const buttonClass = cn(
    "h-8 min-h-[32px] touch-manipulation px-2 text-xs",
    "bg-[#bb29bb] border-2 border-[#bb29bb] text-white",
    "hover:bg-[#0a3a5a] hover:border-[#bb29bb] hover:text-white"
  );

  const hasItems = signs.length > 0 || suggestions.length > 0;
  if (!hasItems) {
    return (
      <Card className="border-border bg-primary text-primary-foreground">
        <CardContent className="px-2 py-1 text-center text-xs text-primary-foreground/80">
          No signs yet. Sign in to add one, or suggest a location.
        </CardContent>
      </Card>
    );
  }

  return (
    <ul className="space-y-1">
      {signs.map((sign) => {
        const isUp = !sign.taken_down_at;
        return (
          <li key={sign.id}>
            <Card className="border-border bg-primary text-primary-foreground shadow-sm">
              <CardContent className="cursor-pointer px-2 py-1" onClick={() => onSignClick?.(sign)}>
                <div className="flex gap-1.5">
                  {sign.photo_url ? (
                    <img
                      src={sign.photo_url}
                      alt="Sign"
                      className="h-10 w-10 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <img
                      src="/Vote411-logo_darkbg_twitter.png"
                      alt="Vote411"
                      className="h-10 w-10 shrink-0 rounded object-contain"
                    />
                  )}
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
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {canMarkTakenDown && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-8 min-h-[32px] touch-manipulation px-2 text-xs text-[#0a3a5a]"
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
                      )}
                      {isUp && canMarkTakenDown && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkTakenDown(sign);
                          }}
                          className={buttonClass}
                        >
                          Mark down
                        </Button>
                      )}
                      {!isUp && (
                        <span className="inline-flex items-center rounded bg-primary-foreground/20 px-1.5 py-0.5 text-xs text-primary-foreground">
                          Taken down
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </li>
        );
      })}
      {suggestions.map((suggestion) => (
        <li key={suggestion.id}>
          <Card className="border-border bg-[#b6c9d4] text-foreground shadow-sm">
            <CardContent
              className="cursor-pointer px-2 py-1"
              onClick={() => onSuggestionClick?.(suggestion)}
            >
              <div className="flex gap-1.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-dashed border-foreground/30 bg-foreground/10">
                  <MapPin className="size-5 text-foreground/70" />
                </div>
                <div className="min-w-0 flex-1">
                  {(suggestion.zipcode ||
                    suggestion.county ||
                    suggestion.nearest_intersection) ? (
                    <div className="text-sm text-foreground/80">
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
                    <p className="text-sm text-foreground/80">
                      Suggested location
                    </p>
                  )}
                  {canMarkTakenDown && suggestion.notes && (
                    <p className="mt-0.5 text-xs text-foreground/80 line-clamp-1">
                      {suggestion.notes}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {canMarkTakenDown && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-8 min-h-[32px] touch-manipulation px-2 text-xs text-[#0a3a5a]"
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
                          className={buttonClass}
                        >
                          Convert to sign
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
