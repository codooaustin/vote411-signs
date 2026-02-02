create table public.app_config (
  key text primary key,
  value text not null
);

insert into public.app_config (key, value) values
  ('max_cluster_radius', '40'),
  ('disable_clustering_at_zoom', '15')
on conflict (key) do nothing;

alter table public.app_config enable row level security;

create policy "Anyone can read app_config"
  on public.app_config for select using (true);

create policy "Authenticated can update app_config"
  on public.app_config for update to authenticated using (true) with check (true);
