"use server";

import { createClient } from "@/lib/supabase/server";
import { reverseGeocode } from "@/lib/utils/reverseGeocode";
import { getOrCreateDefaultCampaignForUser } from "@/lib/actions/campaigns";
import type { AdoptASignSubmission, Sign, SignReport, SignSuggestion, SignWithPlacer } from "@/lib/db/types";

export type SignFilter = "all" | "up" | "down";

/** Fetches all signs (public). No auth required. */
export async function getSignsPublic(
  filter: SignFilter = "all"
): Promise<SignWithPlacer[]> {
  const supabase = await createClient();
  let query = supabase
    .from("signs")
    .select("*")
    .order("placed_at", { ascending: false });

  if (filter === "up") query = query.is("taken_down_at", null);
  if (filter === "down") query = query.not("taken_down_at", "is", null);

  const { data: signs } = await query;
  return (signs ?? []).map((s) => ({
    ...s,
    placed_by_email: null as string | null,
  })) as SignWithPlacer[];
}

export async function getSignsForUser(filter: SignFilter = "all"): Promise<SignWithPlacer[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: memberships } = await supabase
    .from("campaign_members")
    .select("campaign_id")
    .eq("user_id", user.id);
  if (!memberships?.length) return [];

  const campaignIds = memberships.map((m) => m.campaign_id);
  let query = supabase
    .from("signs")
    .select("*")
    .in("campaign_id", campaignIds)
    .order("placed_at", { ascending: false });

  if (filter === "up") query = query.is("taken_down_at", null);
  if (filter === "down") query = query.not("taken_down_at", "is", null);

  const { data: signs } = await query;
  return (signs ?? []).map((s) => ({
    ...s,
    placed_by_email: null as string | null,
  })) as SignWithPlacer[];
}

export async function createSign(params: {
  campaignId: string;
  latitude: number;
  longitude: number;
  placedAt: string;
  notes?: string;
  photoUrl?: string;
  nearestIntersection?: string | null;
  zipcode?: string | null;
  county?: string | null;
}): Promise<{ ok: true; signId: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  let nearestIntersection: string | null;
  let zipcode: string | null;
  let county: string | null;
  const geo =
    params.nearestIntersection !== undefined && params.zipcode !== undefined
      ? {
          nearestIntersection: params.nearestIntersection,
          zipcode: params.zipcode,
          county: params.county ?? null,
        }
      : await reverseGeocode(params.latitude, params.longitude);
  nearestIntersection = geo.nearestIntersection;
  zipcode = geo.zipcode;
  county = geo.county;

  const { data, error } = await supabase
    .from("signs")
    .insert({
      campaign_id: params.campaignId,
      placed_by_user_id: user.id,
      latitude: params.latitude,
      longitude: params.longitude,
      placed_at: params.placedAt,
      notes: params.notes ?? null,
      photo_url: params.photoUrl ?? null,
      nearest_intersection: nearestIntersection,
      zipcode,
      county,
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? "Failed to create sign" };
  return { ok: true, signId: data.id };
}

export async function markSignTakenDown(
  signId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase
    .from("signs")
    .update({ taken_down_at: new Date().toISOString() })
    .eq("id", signId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateSignPhoto(
  signId: string,
  photoUrl: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase
    .from("signs")
    .update({ photo_url: photoUrl })
    .eq("id", signId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteSign(
  signId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase.from("signs").delete().eq("id", signId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteSignSuggestion(
  suggestionId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase
    .from("sign_suggestions")
    .delete()
    .eq("id", suggestionId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Report an issue on a sign (no auth required). */
export async function createSignReport(
  signId: string,
  comment: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = comment.trim();
  if (!trimmed) return { ok: false, error: "Comment is required" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("sign_reports").insert({
    sign_id: signId,
    comment: trimmed,
    reported_by_user_id: user?.id ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Fetch all sign reports (auth required). */
export async function getSignReports(): Promise<SignReport[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("sign_reports")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as SignReport[];
}

/** Create a sign suggestion (no auth required). */
export async function createSignSuggestion(params: {
  latitude: number;
  longitude: number;
  notes?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { nearestIntersection, zipcode, county } = await reverseGeocode(
    params.latitude,
    params.longitude
  );
  const { data, error } = await supabase
    .from("sign_suggestions")
    .insert({
      latitude: params.latitude,
      longitude: params.longitude,
      notes: params.notes ?? null,
      nearest_intersection: nearestIntersection,
      zipcode,
      county,
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? "Failed to suggest location" };
  return { ok: true, id: data.id };
}

/** Convert a suggestion into an installed sign (auth required). */
export async function convertSuggestionToSign(
  suggestionId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { data: suggestion, error: fetchError } = await supabase
    .from("sign_suggestions")
    .select("*")
    .eq("id", suggestionId)
    .single();

  if (fetchError || !suggestion)
    return { ok: false, error: "Suggestion not found" };

  const campaignResult = await getOrCreateDefaultCampaignForUser();
  if (!campaignResult.ok)
    return { ok: false, error: campaignResult.error };

  const signResult = await createSign({
    campaignId: campaignResult.campaignId,
    latitude: suggestion.latitude,
    longitude: suggestion.longitude,
    placedAt: new Date().toISOString(),
    notes: suggestion.notes ?? undefined,
    nearestIntersection: suggestion.nearest_intersection ?? null,
    zipcode: suggestion.zipcode ?? null,
    county: suggestion.county ?? null,
  });

  if (!signResult.ok) return signResult;

  const { error: deleteError } = await supabase
    .from("sign_suggestions")
    .delete()
    .eq("id", suggestionId);

  if (deleteError) return { ok: false, error: deleteError.message };
  return { ok: true };
}

/** Fetch all sign suggestions (no auth required). */
export async function getSignSuggestions(): Promise<SignSuggestion[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sign_suggestions")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as SignSuggestion[];
}

/** Create an adopt-a-sign submission (no auth required). */
export async function createAdoptASignSubmission(params: {
  name: string;
  email?: string;
  phone?: string;
  latitude: number;
  longitude: number;
  notes?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const name = params.name.trim();
  if (!name) return { ok: false, error: "Name is required" };
  const email = params.email?.trim() || null;
  const phone = params.phone?.trim() || null;
  if (!email && !phone) return { ok: false, error: "Email or phone is required" };

  const supabase = await createClient();
  const { nearestIntersection, zipcode, county } = await reverseGeocode(
    params.latitude,
    params.longitude
  );
  const { data, error } = await supabase
    .from("adopt_a_sign_submissions")
    .insert({
      name,
      email,
      phone,
      latitude: params.latitude,
      longitude: params.longitude,
      notes: params.notes?.trim() || null,
      nearest_intersection: nearestIntersection,
      zipcode,
      county,
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? "Failed to submit adoption" };
  return { ok: true, id: data.id };
}

/** Fetch all adopt-a-sign submissions (no auth required). */
export async function getAdoptASignSubmissions(): Promise<AdoptASignSubmission[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("adopt_a_sign_submissions")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as AdoptASignSubmission[];
}
