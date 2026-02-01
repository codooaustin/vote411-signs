create policy "Public can view signs"
  on public.signs for select
  using (true);
