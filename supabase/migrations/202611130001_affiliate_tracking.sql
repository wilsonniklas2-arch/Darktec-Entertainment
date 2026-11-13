-- DARKTEC affiliate tracking and commission ledger
create extension if not exists pgcrypto;

create table if not exists public.affiliate_partners (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  name text not null check (char_length(name) between 2 and 120),
  program_name text,
  status text not null default 'prospect' check (status in ('prospect','applied','approved','active','paused')),
  destination_url text,
  commission_model text,
  commission_rate numeric(8,4),
  commission_basis text,
  attribution_days integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint affiliate_destination_https check (destination_url is null or destination_url ~ '^https://')
);

create table if not exists public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.affiliate_partners(id) on delete restrict,
  clicked_at timestamptz not null default now(),
  referrer_host text,
  landing_path text,
  user_agent text
);

create index if not exists affiliate_clicks_partner_date_idx
  on public.affiliate_clicks(partner_id, clicked_at desc);

create table if not exists public.affiliate_conversions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.affiliate_partners(id) on delete restrict,
  external_order_ref text,
  event_name text,
  conversion_date date not null default current_date,
  order_value numeric(12,2),
  commission_amount numeric(12,2) not null default 0 check (commission_amount >= 0),
  currency char(3) not null default 'EUR',
  status text not null default 'pending' check (status in ('pending','approved','paid','rejected')),
  source text not null default 'manual' check (source in ('manual','partner_import','api')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists affiliate_conversions_partner_date_idx
  on public.affiliate_conversions(partner_id, conversion_date desc);

alter table public.affiliate_partners enable row level security;
alter table public.affiliate_partners force row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.affiliate_clicks force row level security;
alter table public.affiliate_conversions enable row level security;
alter table public.affiliate_conversions force row level security;

drop policy if exists "DARKTEC admins manage affiliate partners" on public.affiliate_partners;
create policy "DARKTEC admins manage affiliate partners" on public.affiliate_partners
for all to authenticated using (public.is_darktec_admin()) with check (public.is_darktec_admin());

drop policy if exists "DARKTEC admins read affiliate clicks" on public.affiliate_clicks;
create policy "DARKTEC admins read affiliate clicks" on public.affiliate_clicks
for select to authenticated using (public.is_darktec_admin());

drop policy if exists "DARKTEC admins manage affiliate conversions" on public.affiliate_conversions;
create policy "DARKTEC admins manage affiliate conversions" on public.affiliate_conversions
for all to authenticated using (public.is_darktec_admin()) with check (public.is_darktec_admin());

revoke all on public.affiliate_partners, public.affiliate_clicks, public.affiliate_conversions from anon, authenticated;
grant select, insert, update, delete on public.affiliate_partners to authenticated;
grant select on public.affiliate_clicks to authenticated;
grant select, insert, update, delete on public.affiliate_conversions to authenticated;

create or replace function public.record_affiliate_click(
  p_slug text,
  p_referrer_host text default null,
  p_landing_path text default null,
  p_user_agent text default null
)
returns table(destination_url text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_partner public.affiliate_partners%rowtype;
begin
  select * into v_partner
  from public.affiliate_partners
  where slug = p_slug and status = 'active' and destination_url is not null;

  if not found then
    return;
  end if;

  insert into public.affiliate_clicks(partner_id, referrer_host, landing_path, user_agent)
  values (
    v_partner.id,
    left(p_referrer_host, 255),
    left(p_landing_path, 500),
    left(p_user_agent, 500)
  );

  return query select v_partner.destination_url;
end;
$$;

revoke all on function public.record_affiliate_click(text,text,text,text) from public;
grant execute on function public.record_affiliate_click(text,text,text,text) to anon, authenticated;

-- Seed only as a prospect: no link is active and no commission is claimed.
insert into public.affiliate_partners
  (slug, name, program_name, status, commission_model, commission_rate, commission_basis, attribution_days, notes)
values
  ('eventim', 'CTS EVENTIM', 'AWIN', 'prospect', 'Percentage of net advance booking fee', 20,
   'Net advance booking fee (not ticket face value)', 1,
   'Prospective program only. Apply and verify current terms before activating tracking links.'),
  ('ticketmaster', 'Ticketmaster', 'Ticketmaster Affiliate', 'prospect', 'Contract-specific', null,
   'To be confirmed per market and agreement', null,
   'Prospective international partner. Apply and verify market-specific terms before activation.')
on conflict (slug) do nothing;
