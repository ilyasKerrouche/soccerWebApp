-- supabase/migrations/005_accounts_and_motm.sql
-- Account dei giocatori e voto Man of the Match

alter table players add column is_active boolean not null default true;

alter table matches add column motm_eligible boolean not null default true;
update matches set motm_eligible = false where is_upcoming = false;

create table player_accounts (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  player_id   uuid not null references players(id) on delete cascade,
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  is_new_player boolean not null default false,
  created_at  timestamptz default now()
);
-- un giocatore può avere al massimo un account approvato
create unique index on player_accounts(player_id) where status = 'approved';

alter table matches add column motm_closes_at timestamptz;

create table motm_votes (
  id                uuid primary key default uuid_generate_v4(),
  match_id          uuid not null references matches(id) on delete cascade,
  voter_player_id   uuid not null references players(id) on delete cascade,
  voted_player_id   uuid not null references players(id) on delete cascade,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  unique(match_id, voter_player_id),
  check (voter_player_id <> voted_player_id)
);
create index on motm_votes(match_id);

-- RLS attivo senza policy: si accede solo con la service role
alter table player_accounts enable row level security;
alter table motm_votes enable row level security;
