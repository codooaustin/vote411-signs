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
    <header className="flex flex-row items-center gap-3 border-b border-primary/20 bg-primary px-4 py-2 text-primary-foreground">
      <a
        href={LWV_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 inline-block"
      >
        <Image
          src="/LWVBayArea_wite.png"
          alt="League of Women Voters of the Bay Area (Texas)"
          width={200}
          height={80}
          className="h-10 w-auto max-w-full object-contain sm:h-12"
        />
      </a>
      <Button
        type="button"
        variant="outline"
        size="sm"
        asChild
        className="shrink-0 h-7 min-h-[28px] px-2 text-xs sm:h-8 sm:px-3 sm:text-sm bg-[#bb29bb] border-2 border-[#bb29bb] text-white hover:bg-[#8b1a8b] hover:border-[#8b1a8b] hover:text-white"
      >
        <a href={DONATE_URL} target="_blank" rel="noopener noreferrer">
          Donate
        </a>
      </Button>
      <div className="min-w-0 flex-1" />
      <a
        href={VOTE411_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 ml-auto inline-block"
      >
        <Image
          src="/Vote411-logo_web_darkbg_tagline_small.png"
          alt="League of Women Voters of the Bay Area (Texas)"
          width={240}
          height={80}
          className="h-10 w-auto object-contain sm:h-12"
        />
      </a>
      {isAuthenticated ? (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild
            className={cn(buttonClass, "shrink-0 font-medium")}
          >
            <Link href="/admin">Admin</Link>
          </Button>
          <AddSignButton onSuccess={onAddSignSuccess} className={buttonClass} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={signOut}
            className={cn(buttonClass, "shrink-0 font-medium")}
          >
            Log out
          </Button>
        </>
      ) : null}
    </header>
  );
}
