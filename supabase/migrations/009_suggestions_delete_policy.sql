create policy "Authenticated users can delete sign suggestions"
  on public.sign_suggestions for delete to authenticated
  using (true);
