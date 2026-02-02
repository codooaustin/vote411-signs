insert into public.app_config (key, value) values
  ('default_map_zoom', '12')
on conflict (key) do nothing;
