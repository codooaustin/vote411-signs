create table public.sign_suggestions (
  id uuid primary key default gen_random_uuid(),
  latitude double precision not null,
  longitude double precision not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.sign_suggestions enable row level security;

create policy "Anyone can insert sign suggestions"
  on public.sign_suggestions for insert
  with check (true);

create policy "Anyone can view sign suggestions"
  on public.sign_suggestions for select
  using (true);
