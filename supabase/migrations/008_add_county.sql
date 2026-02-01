alter table public.signs
  add column if not exists county text;

alter table public.sign_suggestions
  add column if not exists county text;
