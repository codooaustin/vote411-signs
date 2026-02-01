"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import AddSignButton from "./AddSignButton";
import SuggestLocationButton from "./SuggestLocationButton";
import { cn } from "@/lib/utils";

export default function Header({
  onAddSignSuccess,
  onSuggestSuccess,
  isAuthenticated,
}: {
  onAddSignSuccess?: () => void;
  onSuggestSuccess?: () => void;
  isAuthenticated: boolean;
}) {
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
    <header className="flex flex-row items-start gap-4 border-b border-primary/20 bg-primary px-4 py-3 text-primary-foreground">
      <div className="flex shrink-0 items-center">
        <Image
          src="/Vote411-logo_web_darkbg_small.png"
          alt="League of Women Voters of the Bay Area (Texas)"
          width={240}
          height={80}
          className="h-16 w-auto sm:h-20"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="text-right">
          <h1 className="text-sm font-semibold text-primary-foreground sm:text-base">
            League of Women Voters of the Bay Area (Texas)
          </h1>
        </div>
        <div className="flex flex-wrap justify-end gap-2 sm:gap-3">
        {isAuthenticated ? (
          <>
            <AddSignButton onSuccess={onAddSignSuccess} className={buttonClass} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={signOut}
              className={cn(buttonClass, "font-medium")}
            >
              Sign out
            </Button>
          </>
        ) : (
          <>
            <SuggestLocationButton onSuccess={onSuggestSuccess} className={buttonClass} />
            <Button
              variant="outline"
              size="default"
              asChild
              className={cn(buttonClass, "font-medium")}
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </>
        )}
        </div>
      </div>
    </header>
  );
}
