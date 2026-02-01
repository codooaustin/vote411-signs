-- Fix infinite recursion: the SELECT policy on campaign_members was querying
-- campaign_members inside its USING clause, causing recursion.
-- Replace with a simple check: users can only see their own membership rows.

drop policy if exists "Members can view their campaign members" on public.campaign_members;

create policy "Members can view their campaign members"
  on public.campaign_members for select to authenticated
  using (user_id = auth.uid());
