create table availability_votes (
  id           uuid primary key default uuid_generate_v4(),
  match_id     uuid not null references matches(id) on delete cascade,
  vote_date    date not null,
  voter_name   text not null,
  created_at   timestamptz default now(),
  unique(match_id, vote_date, voter_name)
);

create index on availability_votes(match_id);
