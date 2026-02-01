import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const LOG_URL = "http://127.0.0.1:7246/ingest/f7d08c87-54b8-4d19-97f3-f297f256d3af";
function log(location: string, message: string, data: Record<string, unknown>, hypothesisId: string) {
  fetch(LOG_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location, message, data, timestamp: Date.now(), sessionId: "debug-session", hypothesisId }),
  }).catch(() => {});
}

export async function updateSession(request: NextRequest) {
  try {
  // #region agent log
  log("middleware.ts:updateSession:entry", "Middleware invoked", { path: request.nextUrl.pathname, hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL, hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY }, "A");
  // #endregion
  let supabaseResponse = NextResponse.next({ request });

  let supabase;
  try {
    supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value }) =>
            supabaseResponse.cookies.set(name, value)
          );
        },
      },
    }
  );
  } catch (createErr) {
    // #region agent log
    log("middleware.ts:createServerClient:catch", "createServerClient threw", { err: String(createErr), errName: (createErr as Error)?.name }, "C");
    // #endregion
    throw createErr;
  }
  // #region agent log
  log("middleware.ts:afterCreate", "createServerClient ok", {}, "C");
  // #endregion

  let claimsData;
  try {
    const result = await supabase.auth.getClaims();
    claimsData = result;
    // #region agent log
    log("middleware.ts:getClaims:after", "getClaims returned", { hasData: !!result?.data, hasClaims: !!result?.data?.claims }, "B");
    // #endregion
  } catch (claimsErr) {
    // #region agent log
    log("middleware.ts:getClaims:catch", "getClaims threw", { err: String(claimsErr), errName: (claimsErr as Error)?.name }, "B");
    // #endregion
    throw claimsErr;
  }
  const { data } = claimsData;
  const user = data?.claims;

  const path = request.nextUrl.pathname;
  const isPublic =
    path === "/" ||
    path.startsWith("/login") ||
    path.startsWith("/auth") ||
    path.startsWith("/join");

  if (!user && !isPublic) {
    // #region agent log
    log("middleware.ts:redirect", "Redirecting to login", { path }, "D");
    // #endregion
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  // #region agent log
  log("middleware.ts:success", "Returning next", { path, hasUser: !!user }, "D");
  // #endregion
  return supabaseResponse;
  } catch (topErr) {
    // #region agent log
    log("middleware.ts:topLevel:catch", "Uncaught error in middleware", { err: String(topErr), errName: (topErr as Error)?.name, stack: (topErr as Error)?.stack?.slice(0, 200) }, "E");
    // #endregion
    throw topErr;
  }
}
