-- supabase/migrations/001_initial.sql

create extension if not exists "uuid-ossp";

create table players (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  position   text,
  ovr        integer,
  card_url   text,
  created_at timestamptz default now()
);

create table matches (
  id           uuid primary key default uuid_generate_v4(),
  played_at    date not null,
  team_a_name  text not null default 'Team A',
  team_b_name  text not null default 'Team B',
  score_a      integer,
  score_b      integer,
  is_upcoming  boolean not null default false,
  created_at   timestamptz default now()
);

create table match_players (
  id         uuid primary key default uuid_generate_v4(),
  match_id   uuid not null references matches(id) on delete cascade,
  player_id  uuid not null references players(id) on delete cascade,
  team       text not null check (team in ('a','b')),
  goals      integer not null default 0,
  unique(match_id, player_id)
);

-- Indexes for common queries
create index on match_players(player_id);
create index on match_players(match_id);
create index on matches(played_at desc);
