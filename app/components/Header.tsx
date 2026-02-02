"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import AddSignButton from "./AddSignButton";
import { cn } from "@/lib/utils";

export default function Header({
  onAddSignSuccess,
  isAuthenticated,
}: {
  onAddSignSuccess?: () => void;
  isAuthenticated: boolean;
}) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const DONATE_URL = "https://lwvbayareatx.org/content.aspx?page_id=301&club_id=279524";
  const VOTE411_URL = "https://www.vote411.org/";
  const LWV_URL = "https://lwvbayareatx.org/";

  const buttonClass = cn(
    "min-h-[40px] touch-manipulation sm:min-h-0 h-7 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm",
    "bg-[#bb29bb] border-2 border-[#bb29bb] text-white",
    "hover:bg-[#0a3a5a] hover:border-[#bb29bb] hover:text-white"
  );

  return (
    <header className="flex flex-row items-start gap-4 border-b border-primary/20 bg-primary px-4 py-3 text-primary-foreground">
      <div className="flex shrink-0 items-center">
        <a
          href={VOTE411_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
        >
          <Image
            src="/Vote411-logo_web_darkbg_tagline_small.png"
            alt="League of Women Voters of the Bay Area (Texas)"
            width={240}
            height={80}
            className="h-16 w-auto sm:h-20"
          />
        </a>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col items-end gap-2">
          <a
            href={LWV_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Image
              src="/LWVBayArea_wite.png"
              alt="League of Women Voters of the Bay Area (Texas)"
              width={200}
              height={80}
              className="h-10 w-auto sm:h-12 max-w-full object-contain"
            />
          </a>
          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild
            className="h-7 min-h-[28px] px-2 text-xs sm:h-8 sm:px-3 sm:text-sm bg-[#bb29bb] border-2 border-[#bb29bb] text-white hover:bg-[#8b1a8b] hover:border-[#8b1a8b] hover:text-white"
          >
            <a href={DONATE_URL} target="_blank" rel="noopener noreferrer">
              Donate
            </a>
          </Button>
        </div>
        <div className="flex flex-wrap justify-end gap-2 sm:gap-3">
        {isAuthenticated ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              asChild
              className={cn(buttonClass, "font-medium")}
            >
              <Link href="/admin">Admin</Link>
            </Button>
            <AddSignButton onSuccess={onAddSignSuccess} className={buttonClass} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={signOut}
              className={cn(buttonClass, "font-medium")}
            >
              Log out
            </Button>
          </>
        ) : null}
        </div>
      </div>
    </header>
  );
}
