create table public.sign_reports (
  id uuid primary key default gen_random_uuid(),
  sign_id uuid not null references public.signs(id) on delete cascade,
  comment text not null,
  created_at timestamptz not null default now(),
  reported_by_user_id uuid references auth.users(id) on delete set null
);

create index sign_reports_sign_id on public.sign_reports(sign_id);

alter table public.sign_reports enable row level security;

-- Anyone can insert (anon + authenticated)
create policy "Anyone can report issues"
  on public.sign_reports for insert
  with check (true);

-- Authenticated users can read all reports
create policy "Authenticated can view reports"
  on public.sign_reports for select to authenticated
  using (true);
