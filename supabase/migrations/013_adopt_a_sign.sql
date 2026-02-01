create table public.adopt_a_sign_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  latitude double precision not null,
  longitude double precision not null,
  notes text,
  nearest_intersection text,
  zipcode text,
  county text,
  created_at timestamptz not null default now(),
  constraint at_least_one_contact check (email is not null or phone is not null)
);

create index adopt_a_sign_submissions_created_at on public.adopt_a_sign_submissions(created_at desc);

alter table public.adopt_a_sign_submissions enable row level security;

create policy "Anyone can submit adopt-a-sign" on public.adopt_a_sign_submissions for insert with check (true);
create policy "Anyone can view adopt-a-sign submissions" on public.adopt_a_sign_submissions for select using (true);
