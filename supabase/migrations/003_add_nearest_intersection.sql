alter table public.signs
  add column if not exists nearest_intersection text;
