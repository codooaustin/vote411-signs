alter table public.sign_suggestions
  add column if not exists nearest_intersection text,
  add column if not exists zipcode text;
