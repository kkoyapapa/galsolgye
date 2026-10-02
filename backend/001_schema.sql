-- NOT applied. Supabase PostgreSQL starter migration for a NEW test project.
-- Review retention, consent, API validation, and authorization before production.
begin;

create table public.galsolgye_members (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  approved_at timestamptz not null default now()
);

create table public.galsolgye_applications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  nickname text not null check (length(trim(nickname)) between 1 and 30),
  gender text not null check (gender in ('남성','여성')),
  birth_year integer not null check (birth_year between 1900 and 2100),
  work_region text not null check (work_region in ('서울','경기','인천','부산','대구','광주','대전','울산','기타')),
  workplace text not null check (length(trim(workplace)) between 1 and 80),
  contact text not null check (length(trim(contact)) between 1 and 80),
  self_profile jsonb not null check (jsonb_typeof(self_profile) = 'object'),
  ideal_match jsonb not null check (jsonb_typeof(ideal_match) = 'object'),
  consent_version text not null check (length(trim(consent_version)) between 1 and 40),
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.galsolgye_members enable row level security;
alter table public.galsolgye_members force row level security;
alter table public.galsolgye_applications enable row level security;
alter table public.galsolgye_applications force row level security;

revoke all on public.galsolgye_members from public, anon, authenticated;
revoke all on public.galsolgye_applications from public, anon, authenticated;
grant select on public.galsolgye_members to authenticated;
grant select, insert, delete on public.galsolgye_applications to authenticated;
grant update (nickname, gender, birth_year, work_region, workplace, contact, self_profile, ideal_match)
  on public.galsolgye_applications to authenticated;
grant all on public.galsolgye_members, public.galsolgye_applications to service_role;

create policy members_read_self on public.galsolgye_members
  for select to authenticated using (owner_id = (select auth.uid()));
-- No authenticated INSERT/UPDATE/DELETE on membership: clients cannot self-approve.

create policy applications_read_self on public.galsolgye_applications
  for select to authenticated using (owner_id = (select auth.uid()));

create policy applications_insert_approved_self on public.galsolgye_applications
  for insert to authenticated with check (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.galsolgye_members m where m.owner_id = (select auth.uid())
    )
  );

create policy applications_update_approved_self on public.galsolgye_applications
  for update to authenticated using (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.galsolgye_members m where m.owner_id = (select auth.uid())
    )
  ) with check (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.galsolgye_members m where m.owner_id = (select auth.uid())
    )
  );

create policy applications_delete_self on public.galsolgye_applications
  for delete to authenticated using (owner_id = (select auth.uid()));

commit;
-- API must validate each JSON property, current birth year, verified email,
-- actual participant eligibility and server-recorded consent.
-- Do not expose service_role, SQL execution, admin actions or bulk profiles publicly.
