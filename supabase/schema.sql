-- World Cup 2026 Predictions Database Schema
-- Run this in the Supabase SQL Editor

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Teams table
create table public.teams (
  id serial primary key,
  name text not null unique,
  code text not null unique, -- FIFA country code e.g. 'ENG', 'BRA'
  group_name text, -- e.g. 'A', 'B', etc.
  flag_url text
);

-- Matches table
create table public.matches (
  id serial primary key,
  external_id integer unique, -- ID from football-data.org API
  home_team_id integer references public.teams(id),
  away_team_id integer references public.teams(id),
  home_score integer,
  away_score integer,
  match_date timestamptz not null,
  stage text not null default 'GROUP_STAGE', -- GROUP_STAGE, ROUND_OF_16, QUARTER_FINAL, SEMI_FINAL, THIRD_PLACE, FINAL
  group_name text,
  status text not null default 'SCHEDULED', -- SCHEDULED, LIVE, FINISHED
  matchday integer,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.matches enable row level security;

create policy "Matches are viewable by everyone"
  on public.matches for select using (true);

-- Predictions table
create table public.predictions (
  id serial primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  match_id integer references public.matches(id) on delete cascade not null,
  home_score integer not null,
  away_score integer not null,
  points integer, -- null until match is finished and scored
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, match_id)
);

-- Enable RLS
alter table public.predictions enable row level security;

create policy "Users can view all predictions after match is finished"
  on public.predictions for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.matches
      where matches.id = predictions.match_id
      and matches.status = 'FINISHED'
    )
  );

create policy "Users can insert own predictions"
  on public.predictions for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches
      where matches.id = predictions.match_id
      and matches.status = 'SCHEDULED'
      and matches.match_date > now()
    )
  );

create policy "Users can update own predictions before match starts"
  on public.predictions for update
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches
      where matches.id = predictions.match_id
      and matches.status = 'SCHEDULED'
      and matches.match_date > now()
    )
  );

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function to calculate points for a prediction
-- Exact score: 3 points
-- Correct goal difference: 2 points  
-- Correct result (win/draw/loss): 1 point
create or replace function public.calculate_points(
  pred_home integer,
  pred_away integer,
  actual_home integer,
  actual_away integer
) returns integer as $$
begin
  -- Exact score match
  if pred_home = actual_home and pred_away = actual_away then
    return 3;
  end if;
  
  -- Correct goal difference (and correct result direction)
  if (pred_home - pred_away) = (actual_home - actual_away) then
    return 2;
  end if;
  
  -- Correct result (home win, away win, or draw)
  if sign(pred_home - pred_away) = sign(actual_home - actual_away) then
    return 1;
  end if;
  
  return 0;
end;
$$ language plpgsql immutable;

-- Function to score all predictions for a finished match
create or replace function public.score_match(p_match_id integer)
returns void as $$
declare
  v_home_score integer;
  v_away_score integer;
begin
  select home_score, away_score into v_home_score, v_away_score
  from public.matches where id = p_match_id and status = 'FINISHED';
  
  if v_home_score is null then
    raise exception 'Match not finished or not found';
  end if;
  
  update public.predictions
  set points = public.calculate_points(home_score, away_score, v_home_score, v_away_score),
      updated_at = now()
  where match_id = p_match_id;
end;
$$ language plpgsql security definer;

-- Leaderboard view
create or replace view public.leaderboard as
select
  p.id as user_id,
  p.display_name,
  p.avatar_url,
  coalesce(sum(pr.points), 0) as total_points,
  count(pr.id) filter (where pr.points is not null) as matches_scored,
  count(pr.id) filter (where pr.points = 3) as exact_scores,
  count(pr.id) filter (where pr.points = 2) as correct_differences,
  count(pr.id) filter (where pr.points = 1) as correct_results,
  count(pr.id) as total_predictions
from public.profiles p
left join public.predictions pr on pr.user_id = p.id
group by p.id, p.display_name, p.avatar_url
order by total_points desc, exact_scores desc, correct_differences desc;

-- Allow public read on teams
alter table public.teams enable row level security;
create policy "Teams are viewable by everyone"
  on public.teams for select using (true);
