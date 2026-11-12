-- DARKTEC Network backend foundation: public enquiries + private admin workflow.
-- Apply after creating the Supabase project. No service-role key is used by the app.
create extension if not exists pgcrypto;

do $$ begin
  create type public.enquiry_status as enum ('new','reviewing','replied','closed','spam');
exception when duplicate_object then null; end $$;

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  request_type text not null check (char_length(request_type) between 3 and 80),
  topic text not null check (char_length(topic) between 2 and 120),
  name text not null check (char_length(name) between 2 and 120),
  company text check (company is null or char_length(company) <= 160),
  email text not null check (char_length(email) between 5 and 200),
  phone text check (phone is null or char_length(phone) <= 60),
  location text check (location is null or char_length(location) <= 160),
  dates text check (dates is null or char_length(dates) <= 160),
  details text not null check (char_length(details) between 10 and 5000),
  privacy_consent boolean not null check (privacy_consent = true),
  status public.enquiry_status not null default 'new',
  admin_notes text check (admin_notes is null or char_length(admin_notes) <= 5000),
  source text not null default 'website' check (char_length(source) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists enquiries_status_created_idx on public.enquiries(status, created_at desc);
create index if not exists enquiries_email_idx on public.enquiries(lower(email));

alter table public.enquiries enable row level security;
alter table public.enquiries force row level security;

-- Admin access is granted only by a trusted Supabase Auth app_metadata claim.
-- Never use user-editable user_metadata for authorization.
create or replace function public.is_darktec_admin()
returns boolean
language sql stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'darktec_admin') = 'true', false);
$$;

revoke all on function public.is_darktec_admin() from public;
grant execute on function public.is_darktec_admin() to authenticated;

drop policy if exists "public can submit enquiries" on public.enquiries;
create policy "public can submit enquiries" on public.enquiries
for insert to anon, authenticated
with check (
  privacy_consent = true
  and status = 'new'
  and admin_notes is null
);

drop policy if exists "admins read enquiries" on public.enquiries;
create policy "admins read enquiries" on public.enquiries
for select to authenticated
using (public.is_darktec_admin());

drop policy if exists "admins update enquiries" on public.enquiries;
create policy "admins update enquiries" on public.enquiries
for update to authenticated
using (public.is_darktec_admin())
with check (public.is_darktec_admin());

revoke all on public.enquiries from anon, authenticated;
grant insert on public.enquiries to anon, authenticated;
grant select, update on public.enquiries to authenticated;

create or replace function public.set_enquiry_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists enquiries_set_updated_at on public.enquiries;
create trigger enquiries_set_updated_at before update on public.enquiries
for each row execute function public.set_enquiry_updated_at();

-- Keep public access limited to INSERT. No public SELECT, UPDATE or DELETE policy exists.
