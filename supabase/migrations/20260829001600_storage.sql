-- ITEK Internship OS migration: private storage buckets for evidence and documents.
--
-- SCOPE
--   `work_evidence.storage_path` and `intern_documents.storage_path` already exist in
--   the schema, but no upload interface is built yet, so nothing writes to these buckets
--   today. Applying this now is harmless and means the access rules are settled before
--   the first file is uploaded rather than improvised afterwards.
--
-- PATH CONVENTION
--   Every object is stored under the placement it belongs to:
--       <placement_id>/<filename>
--   The policies below read that first folder segment, so a file cannot be read by
--   someone with no relationship to that placement even if they guess the object name.
--
--   Both buckets are private. Serve files through short-lived signed URLs; never make
--   these public, and never put an intern's documents in a public bucket "temporarily".

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'intern-documents',
    'intern-documents',
    false,
    10485760, -- 10 MB: identity documents, attachment letters, insurance certificates
    array['application/pdf', 'image/png', 'image/jpeg']
  ),
  (
    'work-evidence',
    'work-evidence',
    false,
    52428800, -- 50 MB: design files, reports, notebooks, demo recordings
    null      -- deliberately unrestricted: evidence takes many legitimate forms
  )
on conflict (id) do nothing;

-- Helper: the placement a stored object belongs to, from the first path segment.
create or replace function public.storage_object_placement(object_name text)
returns uuid
language sql
immutable
as $$
  select nullif((string_to_array(object_name, '/'))[1], '')::uuid;
$$;

-- An intern may read and upload within their own placement's folder.
create policy "itek: intern reads own files"
on storage.objects for select
using (
  bucket_id in ('intern-documents', 'work-evidence')
  and exists (
    select 1 from public.placements p
    where p.id = public.storage_object_placement(name)
      and p.intern_id = auth.uid()
  )
);

create policy "itek: intern uploads own files"
on storage.objects for insert
with check (
  bucket_id in ('intern-documents', 'work-evidence')
  and exists (
    select 1 from public.placements p
    where p.id = public.storage_object_placement(name)
      and p.intern_id = auth.uid()
  )
);

-- Programme staff may read files for the placements they can already see. The
-- `placements` policies are the boundary; this simply defers to them.
create policy "itek: staff read placement files"
on storage.objects for select
using (
  bucket_id in ('intern-documents', 'work-evidence')
  and public.is_programme_staff()
  and exists (
    select 1 from public.placements p
    where p.id = public.storage_object_placement(name)
  )
);

-- Deletion is restricted to programme administrators: an intern removing their own
-- evidence after a review would break the record a certificate later refers to.
create policy "itek: administrators delete files"
on storage.objects for delete
using (
  bucket_id in ('intern-documents', 'work-evidence')
  and public.has_any_role(array['super_admin','programme_admin']::public.app_role[])
);

commit;
