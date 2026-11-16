-- supabase/migrations/006_add_match_end_time.sql
-- Orario di fine della partita (facoltativo, "HH:MM" ora italiana come match_time).
-- Serve al simbolo LIVE: la partita e' "in campo" tra match_time e match_end_time.
alter table matches add column if not exists match_end_time text;
