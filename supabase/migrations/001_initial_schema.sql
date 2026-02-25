-- Pulse Fitness App - Initial Database Schema
-- Run this migration against your Supabase project

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- Users table
-- ============================================
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'other', 'prefer_not_to_say')),
  height_cm numeric,
  weight_kg numeric,
  unit_preference text default 'metric' check (unit_preference in ('metric', 'imperial')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- Goals table
-- ============================================
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  goal_type text not null check (goal_type in ('running', 'strength', 'triathlon', 'general_fitness')),
  goal_subtype text,
  target_value text,
  target_event text,
  target_date date,
  current_level text check (current_level in ('beginner', 'intermediate', 'advanced', 'elite')),
  available_days integer[],
  preferred_long_session_day integer,
  status text default 'active' check (status in ('active', 'completed', 'paused', 'abandoned')),
  created_at timestamptz default now()
);

create index idx_goals_user_id on goals(user_id);
create index idx_goals_status on goals(status);

-- ============================================
-- User Stats table
-- ============================================
create table if not exists user_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  goal_id uuid references goals(id) on delete cascade,
  -- Running stats
  recent_5k_time interval,
  recent_10k_time interval,
  recent_half_time interval,
  recent_marathon_time interval,
  weekly_mileage_km numeric,
  max_heart_rate integer,
  resting_heart_rate integer,
  -- Strength stats
  bench_press_1rm numeric,
  squat_1rm numeric,
  deadlift_1rm numeric,
  overhead_press_1rm numeric,
  -- General
  injury_history text,
  equipment_available text[],
  gym_access boolean default true,
  notes text,
  created_at timestamptz default now()
);

create index idx_user_stats_user_id on user_stats(user_id);

-- ============================================
-- Training Plans table
-- ============================================
create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  goal_id uuid references goals(id) on delete cascade,
  name text not null,
  description text,
  start_date date not null,
  end_date date,
  total_weeks integer,
  current_week integer default 1,
  plan_data jsonb not null,
  status text default 'active' check (status in ('active', 'completed', 'paused')),
  ai_model text,
  ai_prompt_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_plans_user_id on plans(user_id);
create index idx_plans_status on plans(status);

-- ============================================
-- Workouts table
-- ============================================
create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references plans(id) on delete cascade,
  user_id uuid references users(id) on delete cascade not null,
  week_number integer not null,
  day_of_week integer not null check (day_of_week between 1 and 7),
  scheduled_date date not null,
  workout_type text not null,
  title text not null,
  description text,
  workout_data jsonb not null,
  estimated_duration_minutes integer,
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'skipped', 'modified')),
  completed_at timestamptz,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create index idx_workouts_plan_id on workouts(plan_id);
create index idx_workouts_user_id on workouts(user_id);
create index idx_workouts_scheduled_date on workouts(scheduled_date);
create index idx_workouts_status on workouts(status);

-- ============================================
-- Activities table (completed workouts + synced data)
-- ============================================
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  workout_id uuid references workouts(id),
  activity_type text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_seconds integer,
  -- Running specific
  distance_km numeric,
  avg_pace_min_km numeric,
  avg_heart_rate integer,
  max_heart_rate integer,
  elevation_gain_m numeric,
  splits jsonb,
  route_polyline text,
  -- Strength specific
  exercises_completed jsonb,
  -- Source
  source text default 'app' check (source in ('app', 'apple_health', 'garmin', 'strava')),
  external_id text,
  raw_data jsonb,
  created_at timestamptz default now()
);

create index idx_activities_user_id on activities(user_id);
create index idx_activities_started_at on activities(started_at);
create unique index idx_activities_external_id on activities(external_id) where external_id is not null;

-- ============================================
-- Connected Services table
-- ============================================
create table if not exists connected_services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  service text not null check (service in ('apple_health', 'garmin', 'strava', 'google_fit')),
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  service_user_id text,
  connected_at timestamptz default now(),
  unique(user_id, service)
);

create index idx_connected_services_user_id on connected_services(user_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
alter table users enable row level security;
alter table goals enable row level security;
alter table user_stats enable row level security;
alter table plans enable row level security;
alter table workouts enable row level security;
alter table activities enable row level security;
alter table connected_services enable row level security;

-- Users can only access their own data
create policy "Users can view own profile" on users
  for select using (auth.uid() = id);
create policy "Users can update own profile" on users
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on users
  for insert with check (auth.uid() = id);

create policy "Users can manage own goals" on goals
  for all using (auth.uid() = user_id);

create policy "Users can manage own stats" on user_stats
  for all using (auth.uid() = user_id);

create policy "Users can manage own plans" on plans
  for all using (auth.uid() = user_id);

create policy "Users can manage own workouts" on workouts
  for all using (auth.uid() = user_id);

create policy "Users can manage own activities" on activities
  for all using (auth.uid() = user_id);

create policy "Users can manage own services" on connected_services
  for all using (auth.uid() = user_id);

-- ============================================
-- Functions
-- ============================================

-- Auto-update the updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at before update on users
  for each row execute function update_updated_at();

create trigger plans_updated_at before update on plans
  for each row execute function update_updated_at();
