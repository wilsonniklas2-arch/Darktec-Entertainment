-- DARKTEC Network initial schema
-- Apply only after creating the Supabase project. Review and test policies before production.
create extension if not exists pgcrypto;

create type public.profile_kind as enum ('artist','organizer','partner','crew','service');
create type public.project_status as enum ('draft','open','in_progress','completed','cancelled');
create type public.verification_status as enum ('unverified','pending','verified','rejected');

create table public.members (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.members(id) on delete cascade,
  slug text not null unique,
  kind public.profile_kind not null,
  display_name text not null,
  headline text,
  bio text,
  country text,
  city text,
  website_url text,
  avatar_path text,
  is_public boolean not null default true,
  verification_status public.verification_status not null default 'unverified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_owner_idx on public.profiles(owner_id);
create index profiles_discovery_idx on public.profiles(kind, is_public, city);

create table public.profile_skills (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  skill text not null,
  created_at timestamptz not null default now(),
  unique(profile_id, skill)
);

create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  media_url text,
  external_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.members(id) on delete cascade,
  title text not null,
  slug text not null unique,
  summary text,
  description text,
  category text,
  location text,
  starts_at timestamptz,
  ends_at timestamptz,
  status public.project_status not null default 'draft',
  visibility text not null default 'public' check (visibility in ('public','members','private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at >= starts_at)
);
create index projects_discovery_idx on public.projects(status, visibility, starts_at);

create table public.project_memberships (
  project_id uuid not null references public.projects(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  project_role text not null default 'collaborator',
  joined_at timestamptz not null default now(),
  primary key(project_id, member_id)
);

create table public.project_applications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  applicant_id uuid not null references public.members(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  message text,
  status text not null default 'submitted' check (status in ('submitted','reviewing','accepted','declined','withdrawn')),
  created_at timestamptz not null default now(),
  unique(project_id, applicant_id)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  created_by uuid not null references public.members(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key(conversation_id, member_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.members(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 10000),
  created_at timestamptz not null default now(),
  edited_at timestamptz
);
create index messages_conversation_time_idx on public.messages(conversation_id, created_at);

create table public.verification_cases (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  requested_by uuid not null references public.members(id) on delete cascade,
  status public.verification_status not null default 'pending',
  reviewer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Evidence files must be stored in a private bucket with separately reviewed storage policies.
-- Do not store identity documents or sensitive evidence in public profile columns.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_member_time_idx on public.notifications(member_id, created_at desc);

create table public.match_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references public.members(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  brief text not null,
  status text not null default 'queued' check (status in ('queued','processing','completed','failed')),
  created_at timestamptz not null default now()
);

-- Minimal member row created on successful Supabase Auth signup.
create or replace function public.handle_new_member()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.members (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_member();

-- Enable RLS everywhere. Public discovery exposes only explicitly public profiles and projects.
alter table public.members enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_skills enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.projects enable row level security;
alter table public.project_memberships enable row level security;
alter table public.project_applications enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.verification_cases enable row level security;
alter table public.notifications enable row level security;
alter table public.match_requests enable row level security;

create policy "members read own row" on public.members for select to authenticated using (id = (select auth.uid()));
create policy "members update own row" on public.members for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "public profiles and own private profiles readable" on public.profiles for select to anon, authenticated using (is_public or owner_id = (select auth.uid()));
create policy "owners create profiles" on public.profiles for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "owners update profiles" on public.profiles for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "owners delete profiles" on public.profiles for delete to authenticated using (owner_id = (select auth.uid()));

create policy "skills visible with profile" on public.profile_skills for select to anon, authenticated using (exists (select 1 from public.profiles p where p.id = profile_id and (p.is_public or p.owner_id = (select auth.uid()))));
create policy "profile owners manage skills" on public.profile_skills for all to authenticated using (exists (select 1 from public.profiles p where p.id = profile_id and p.owner_id = (select auth.uid()))) with check (exists (select 1 from public.profiles p where p.id = profile_id and p.owner_id = (select auth.uid())));

create policy "portfolio visible with profile" on public.portfolio_items for select to anon, authenticated using (exists (select 1 from public.profiles p where p.id = profile_id and (p.is_public or p.owner_id = (select auth.uid()))));
create policy "profile owners manage portfolio" on public.portfolio_items for all to authenticated using (exists (select 1 from public.profiles p where p.id = profile_id and p.owner_id = (select auth.uid()))) with check (exists (select 1 from public.profiles p where p.id = profile_id and p.owner_id = (select auth.uid())));

create policy "public and member projects visible" on public.projects for select to anon, authenticated using ((visibility = 'public' and status = 'open') or (visibility = 'members' and status = 'open' and auth.uid() is not null) or owner_id = (select auth.uid()) or exists (select 1 from public.project_memberships pm where pm.project_id = id and pm.member_id = (select auth.uid())));
create policy "owners create projects" on public.projects for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "owners update projects" on public.projects for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "owners delete projects" on public.projects for delete to authenticated using (owner_id = (select auth.uid()));

create policy "members see project team" on public.project_memberships for select to authenticated using (member_id = (select auth.uid()) or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())) or exists (select 1 from public.project_memberships pm where pm.project_id = project_id and pm.member_id = (select auth.uid())));
create policy "project owners add team" on public.project_memberships for insert to authenticated with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "project owners remove team" on public.project_memberships for delete to authenticated using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));

create policy "applicants and project owners view applications" on public.project_applications for select to authenticated using (applicant_id = (select auth.uid()) or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "members apply to open projects" on public.project_applications for insert to authenticated with check (applicant_id = (select auth.uid()) and exists (select 1 from public.projects p where p.id = project_id and p.status = 'open'));
create policy "applicants withdraw own applications" on public.project_applications for update to authenticated using (applicant_id = (select auth.uid())) with check (applicant_id = (select auth.uid()));

create policy "conversation participants can view conversations" on public.conversations for select to authenticated using (exists (select 1 from public.conversation_members cm where cm.conversation_id = id and cm.member_id = (select auth.uid())));
create policy "authenticated users create conversations" on public.conversations for insert to authenticated with check (created_by = (select auth.uid()));
create policy "participants view membership" on public.conversation_members for select to authenticated using (member_id = (select auth.uid()) or exists (select 1 from public.conversation_members cm where cm.conversation_id = conversation_id and cm.member_id = (select auth.uid())));
create policy "conversation creator adds participants" on public.conversation_members for insert to authenticated with check (exists (select 1 from public.conversations c where c.id = conversation_id and c.created_by = (select auth.uid())));
create policy "participants read messages" on public.messages for select to authenticated using (exists (select 1 from public.conversation_members cm where cm.conversation_id = conversation_id and cm.member_id = (select auth.uid())));
create policy "participants send own messages" on public.messages for insert to authenticated with check (sender_id = (select auth.uid()) and exists (select 1 from public.conversation_members cm where cm.conversation_id = conversation_id and cm.member_id = (select auth.uid())));

create policy "members view own verification cases" on public.verification_cases for select to authenticated using (exists (select 1 from public.profiles p where p.id = profile_id and p.owner_id = (select auth.uid())));
create policy "profile owners request verification" on public.verification_cases for insert to authenticated with check (requested_by = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = profile_id and p.owner_id = (select auth.uid())));

create policy "members read own notifications" on public.notifications for select to authenticated using (member_id = (select auth.uid()));
create policy "members update own notifications" on public.notifications for update to authenticated using (member_id = (select auth.uid())) with check (member_id = (select auth.uid()));

create policy "members read own match requests" on public.match_requests for select to authenticated using (requested_by = (select auth.uid()));
create policy "members create own match requests" on public.match_requests for insert to authenticated with check (requested_by = (select auth.uid()));

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.profile_skills, public.portfolio_items to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.profile_skills, public.portfolio_items to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.project_memberships to authenticated;
grant select, insert, update on public.project_applications to authenticated;
grant select, insert on public.conversations, public.conversation_members, public.messages to authenticated;
grant select, insert on public.verification_cases, public.match_requests to authenticated;
grant select, update on public.notifications to authenticated;
grant select, update on public.members to authenticated;
