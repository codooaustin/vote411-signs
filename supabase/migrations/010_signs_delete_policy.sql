create policy "Campaign members can delete signs"
  on public.signs for delete to authenticated
  using (
    campaign_id in (select campaign_id from public.campaign_members where user_id = auth.uid())
  );
