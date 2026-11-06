-- DARKTEC Network security hardening
-- Removes recursive RLS policy lookups and protects verification decisions.
create or replace function public.is_project_member(target_project uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.project_memberships pm
    where pm.project_id = target_project and pm.member_id = (select auth.uid())
  );
$$;

create or replace function public.is_conversation_member(target_conversation uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = target_conversation and cm.member_id = (select auth.uid())
  );
$$;

revoke all on function public.is_project_member(uuid) from public;
revoke all on function public.is_conversation_member(uuid) from public;
grant execute on function public.is_project_member(uuid) to authenticated;
grant execute on function public.is_conversation_member(uuid) to authenticated;

drop policy if exists "public and member projects visible" on public.projects;
create policy "public and member projects visible" on public.projects
for select to anon, authenticated
using (
  (visibility = 'public' and status = 'open')
  or (visibility = 'members' and status = 'open' and (select auth.uid()) is not null)
  or owner_id = (select auth.uid())
  or public.is_project_member(id)
);

drop policy if exists "members see project team" on public.project_memberships;
create policy "members see project team" on public.project_memberships
for select to authenticated
using (
  member_id = (select auth.uid())
  or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid()))
  or public.is_project_member(project_id)
);

drop policy if exists "conversation participants can view conversations" on public.conversations;
create policy "conversation participants can view conversations" on public.conversations
for select to authenticated
using (public.is_conversation_member(id));

drop policy if exists "participants view membership" on public.conversation_members;
create policy "participants view membership" on public.conversation_members
for select to authenticated
using (member_id = (select auth.uid()) or public.is_conversation_member(conversation_id));

drop policy if exists "participants read messages" on public.messages;
create policy "participants read messages" on public.messages
for select to authenticated
using (public.is_conversation_member(conversation_id));

drop policy if exists "participants send own messages" on public.messages;
create policy "participants send own messages" on public.messages
for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and public.is_conversation_member(conversation_id)
);

-- A profile owner must never be able to self-assign a verified status.
create or replace function public.prevent_self_verification()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.verification_status is distinct from old.verification_status
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Verification status can only be changed by an authorized verification process';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_self_verification on public.profiles;
create trigger profiles_prevent_self_verification
before update on public.profiles
for each row execute function public.prevent_self_verification();

-- Applicants may withdraw their own application, but cannot approve themselves.
drop policy if exists "applicants withdraw own applications" on public.project_applications;
create policy "applicants withdraw own applications" on public.project_applications
for update to authenticated
using (applicant_id = (select auth.uid()))
with check (applicant_id = (select auth.uid()) and status = 'withdrawn');
