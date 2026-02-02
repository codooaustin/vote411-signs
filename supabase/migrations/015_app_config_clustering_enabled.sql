insert into public.app_config (key, value) values
  ('clustering_enabled', 'true')
on conflict (key) do nothing;
