"use server";

import { createClient } from "@/lib/supabase/server";
import type { Campaign } from "@/lib/db/types";

export async function getCampaignsForUser(): Promise<Campaign[]> {
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
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .in("id", campaignIds)
    .order("name");
  return (campaigns ?? []) as Campaign[];
}

/** Returns a campaign id to use when adding a sign. Uses first campaign or creates "My signs". */
export async function getOrCreateDefaultCampaignForUser(): Promise<
  { ok: true; campaignId: string } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const campaigns = await getCampaignsForUser();
  if (campaigns.length > 0) {
    return { ok: true, campaignId: campaigns[0].id };
  }
  return createCampaign("My signs").then((result) =>
    result.ok ? { ok: true, campaignId: result.campaignId } : result
  );
}

export async function getCampaignByInviteCode(
  inviteCode: string
): Promise<Campaign | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .eq("invite_code", inviteCode.trim())
    .single();
  return data as Campaign | null;
}

export async function joinCampaignByInviteCode(
  inviteCode: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const campaign = await getCampaignByInviteCode(inviteCode);
  if (!campaign) return { ok: false, error: "Invalid or expired invite code" };

  const { error } = await supabase.from("campaign_members").insert({
    user_id: user.id,
    campaign_id: campaign.id,
  });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Already in this campaign" };
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function createCampaign(name: string): Promise<
  | { ok: true; campaignId: string; inviteCode: string }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const inviteCode = Math.random().toString(36).slice(2, 10);
  const { data: campaign, error: insertError } = await supabase
    .from("campaigns")
    .insert({ name, invite_code: inviteCode })
    .select("id")
    .single();
  if (insertError) return { ok: false, error: insertError.message };
  if (!campaign) return { ok: false, error: "Failed to create campaign" };

  const { error: memberError } = await supabase.from("campaign_members").insert({
    user_id: user.id,
    campaign_id: campaign.id,
  });
  if (memberError) return { ok: false, error: memberError.message };
  return { ok: true, campaignId: campaign.id, inviteCode };
}
