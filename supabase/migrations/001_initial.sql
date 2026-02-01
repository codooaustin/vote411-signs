-- Campaigns: one per group (e.g. "League City Vote411")
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique,
  created_at timestamptz not null default now()
);

-- Campaign members: users belong to campaigns
create table public.campaign_members (
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, campaign_id)
);

-- Signs: each sign belongs to a campaign and has a placer
create table public.signs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  placed_by_user_id uuid not null references auth.users(id) on delete restrict,
  latitude double precision not null,
  longitude double precision not null,
  placed_at timestamptz not null default now(),
  taken_down_at timestamptz,
  notes text,
  photo_url text,
  created_at timestamptz not null default now()
);

create index signs_campaign_id on public.signs(campaign_id);
create index signs_placed_at on public.signs(placed_at);
create index signs_taken_down_at on public.signs(taken_down_at);
create index campaign_members_campaign_id on public.campaign_members(campaign_id);
create index campaign_members_user_id on public.campaign_members(user_id);

-- RLS
alter table public.campaigns enable row level security;
alter table public.campaign_members enable row level security;
alter table public.signs enable row level security;

-- Campaigns: authenticated users can read all (to join by code); can create; can read own memberships via campaign_members
create policy "Campaigns are viewable by authenticated"
  on public.campaigns for select to authenticated using (true);

create policy "Authenticated users can create campaigns"
  on public.campaigns for insert to authenticated with check (true);

-- Campaign members: users can see their own membership rows (user_id = auth.uid() only; no subquery to avoid recursion)
create policy "Members can view their campaign members"
  on public.campaign_members for select to authenticated
  using (user_id = auth.uid());

create policy "Users can join campaign (insert own membership)"
  on public.campaign_members for insert to authenticated
  with check (user_id = auth.uid());

-- Signs: members of a campaign can read/write signs for that campaign
create policy "Campaign members can view signs"
  on public.signs for select to authenticated
  using (
    campaign_id in (select campaign_id from public.campaign_members where user_id = auth.uid())
  );

create policy "Campaign members can insert signs"
  on public.signs for insert to authenticated
  with check (
    placed_by_user_id = auth.uid()
    and campaign_id in (select campaign_id from public.campaign_members where user_id = auth.uid())
  );

create policy "Campaign members can update signs"
  on public.signs for update to authenticated
  using (
    campaign_id in (select campaign_id from public.campaign_members where user_id = auth.uid())
  );

-- Create storage bucket "sign-photos" in Supabase Dashboard (Storage) and set it public.
-- Then add policy: allow authenticated insert, public read for objects in sign-photos.
