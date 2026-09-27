-- Migration 003: Create trade-screenshots storage bucket and RLS policies
-- Run this in the Supabase SQL editor ONCE.

-- Step 1: Create the private bucket (idempotent)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'trade-screenshots',
  'trade-screenshots',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Step 2: Storage RLS � users can only access files under their own user_id folder
-- File path pattern: <user_id>/<trade_id>/<type>_<timestamp>.<ext>

create policy ""Users upload own screenshots""
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'trade-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy ""Users read own screenshots""
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'trade-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy ""Users delete own screenshots""
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'trade-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
