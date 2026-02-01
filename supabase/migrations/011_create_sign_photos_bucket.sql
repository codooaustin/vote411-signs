-- Create sign-photos storage bucket (public for serving photos)
insert into storage.buckets (id, name, public)
values ('sign-photos', 'sign-photos', true)
on conflict (id) do update set public = true;

-- Allow public read
drop policy if exists "Public can view sign photos" on storage.objects;
create policy "Public can view sign photos"
  on storage.objects for select
  using (bucket_id = 'sign-photos');

-- Allow authenticated users to upload
drop policy if exists "Authenticated can upload sign photos" on storage.objects;
create policy "Authenticated can upload sign photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'sign-photos');
