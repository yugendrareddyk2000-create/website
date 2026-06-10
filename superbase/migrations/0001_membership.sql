-- ============ LOCATION TABLES (re-numbered per parent) ============
create table if not exists states (
  id           serial primary key,
  state_code   char(2) not null unique,
  raw_code     int not null unique,
  name         text not null
);

create table if not exists parliament_constituencies (
  id           serial primary key,
  state_id     int not null references states(id) on delete cascade,
  pc_code      char(2) not null,
  raw_pc_no    int not null,
  name         text not null,
  unique (state_id, pc_code),
  unique (state_id, raw_pc_no)
);

create table if not exists assembly_constituencies (
  id           serial primary key,
  pc_id        int not null references parliament_constituencies(id) on delete cascade,
  ac_code      char(2) not null,
  raw_ac_no    int not null,
  name         text not null,
  unique (pc_id, ac_code),
  unique (pc_id, raw_ac_no)
);

create table if not exists mandals (
  id           serial primary key,
  ac_id        int not null references assembly_constituencies(id) on delete cascade,
  mandal_code  char(2) not null,
  raw_mandal_code int not null,
  name         text not null,
  unique (ac_id, mandal_code),
  unique (ac_id, raw_mandal_code)
);

create table if not exists villages (
  id              serial primary key,
  mandal_id       int not null references mandals(id) on delete cascade,
  village_code    char(3) not null,
  raw_village_code int not null,
  name            text not null,
  census_code     text,
  unique (mandal_id, village_code),
  unique (mandal_id, raw_village_code)
);

create index if not exists idx_pc_state on parliament_constituencies(state_id);
create index if not exists idx_ac_pc    on assembly_constituencies(pc_id);
create index if not exists idx_md_ac    on mandals(ac_id);
create index if not exists idx_vl_md    on villages(mandal_id);
create index if not exists idx_vl_name  on villages using gin (to_tsvector('simple', name));

-- ============ ENUMS ============
do $$ begin create type gender_t       as enum ('M','F','O'); exception when duplicate_object then null; end $$;
do $$ begin create type member_status  as enum ('draft','submitted','under_review','approved','rejected'); exception when duplicate_object then null; end $$;
do $$ begin create type education_lvl  as enum ('none','primary','secondary','higher_secondary','diploma','graduate','postgraduate','doctorate'); exception when duplicate_object then null; end $$;

-- ============ MEMBERS ============
create table if not exists members (
  id              uuid primary key default gen_random_uuid(),
  auth_user_id    uuid not null unique,
  phone           text not null unique,
  membership_id   char(17) unique,
  status          member_status not null default 'draft',
  current_step    smallint not null default 1,
  submitted_at    timestamptz,
  approved_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists member_profiles (
  member_id       uuid primary key references members(id) on delete cascade,
  full_name       text,
  father_name     text,
  date_of_birth   date,
  gender          gender_t,
  email           text,
  photo_url       text,
  education_level education_lvl,
  qualification   text,
  institution     text,
  year_completed  smallint,
  occupation      text,
  employer        text,
  annual_income   numeric(12,2),
  address_line1   text,
  address_line2   text,
  pincode         char(6),
  state_id        int references states(id),
  pc_id           int references parliament_constituencies(id),
  ac_id           int references assembly_constituencies(id),
  mandal_id       int references mandals(id),
  village_id      int references villages(id),
  updated_at      timestamptz not null default now()
);

create table if not exists membership_counters (
  village_id      int primary key references villages(id),
  last_serial     int not null default 0
);

create table if not exists otp_attempts (
  id          bigserial primary key,
  phone       text not null,
  ip          inet,
  created_at  timestamptz not null default now()
);
create index if not exists idx_otp_phone on otp_attempts(phone, created_at desc);

-- ============ GRANTS ============
grant usage on schema public to authenticated, anon;
grant select on states, parliament_constituencies, assembly_constituencies, mandals, villages to anon, authenticated;
grant select, insert, update on members, member_profiles to authenticated;
grant all on members, member_profiles, membership_counters, otp_attempts to service_role;

-- ============ RLS ============
alter table members          enable row level security;
alter table member_profiles  enable row level security;

drop policy if exists "self read"           on members;
drop policy if exists "self update"         on members;
drop policy if exists "self profile read"   on member_profiles;
drop policy if exists "self profile write"  on member_profiles;

create policy "self read"   on members         for select using (auth.uid() = auth_user_id);
create policy "self update" on members         for update using (auth.uid() = auth_user_id);
create policy "self profile read"   on member_profiles for select using (
  exists (select 1 from members m where m.id = member_profiles.member_id and m.auth_user_id = auth.uid()));
create policy "self profile write"  on member_profiles for all using (
  exists (select 1 from members m where m.id = member_profiles.member_id and m.auth_user_id = auth.uid()));

-- ============ ID GENERATOR ============
create or replace function issue_membership_id(p_member uuid)
returns char(17)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state char(2); v_pc char(2); v_ac char(2); v_md char(2); v_vl char(3);
  v_gender char(1); v_serial int; v_village int; v_id char(17);
begin
  select p.village_id,
         case p.gender when 'M' then 'M' when 'F' then 'F' else 'O' end,
         s.state_code, pc.pc_code, ac.ac_code, md.mandal_code, vl.village_code
    into v_village, v_gender, v_state, v_pc, v_ac, v_md, v_vl
  from member_profiles p
  join villages vl                    on vl.id  = p.village_id
  join mandals md                     on md.id  = vl.mandal_id
  join assembly_constituencies ac     on ac.id  = md.ac_id
  join parliament_constituencies pc   on pc.id  = ac.pc_id
  join states s                       on s.id   = pc.state_id
  where p.member_id = p_member;

  if v_village is null then
    raise exception 'profile incomplete for member %', p_member;
  end if;

  insert into membership_counters(village_id, last_serial)
       values (v_village, 1)
  on conflict (village_id)
       do update set last_serial = membership_counters.last_serial + 1
  returning last_serial into v_serial;

  v_id := v_state || v_pc || v_ac || v_md || v_vl || v_gender || lpad(v_serial::text,5,'0');
  update members set membership_id = v_id, status='approved', approved_at = now() where id = p_member;
  return v_id;
end $$;

grant execute on function issue_membership_id(uuid) to authenticated, service_role;
