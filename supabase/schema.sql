-- AceHeals Supabase schema
-- Run in Supabase SQL Editor. RLS: parents see only their own data.

-- Users (extends auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  paid boolean default false,
  plan text,
  grace_until timestamptz,
  stripe_customer_id text,
  created_at timestamptz default now()
);
alter table public.users enable row level security;
create policy "own row" on public.users for all using (auth.uid() = id);

-- Child profiles (multiple per account)
create table if not exists public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  emoji text default '🌟',
  created_at timestamptz default now()
);
alter table public.child_profiles enable row level security;
create policy "own children" on public.child_profiles for all using (auth.uid() = user_id);

-- Potty logs
create table if not exists public.potty_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  child_id uuid references public.child_profiles(id) on delete set null,
  created_at timestamptz default now()
);
alter table public.potty_logs enable row level security;
create policy "own logs" on public.potty_logs for all using (auth.uid() = user_id);

-- Community posts
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  parent_name text,
  child_info text,
  text text not null,
  anonymous boolean default false,
  likes int default 0,
  reply_count int default 0,
  created_at timestamptz default now()
);
alter table public.community_posts enable row level security;
create policy "read all" on public.community_posts for select using (true);
create policy "insert own" on public.community_posts for insert with check (auth.uid() = user_id or user_id is null);

-- Saved recipes
create table if not exists public.saved_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  recipe_name text not null,
  recipe_data jsonb,
  created_at timestamptz default now(),
  unique(user_id, recipe_name)
);
alter table public.saved_recipes enable row level security;
create policy "own recipes" on public.saved_recipes for all using (auth.uid() = user_id);

-- Daily checklist
create table if not exists public.daily_checklist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  day date not null,
  items jsonb default '[]',
  created_at timestamptz default now(),
  unique(user_id, day)
);
alter table public.daily_checklist enable row level security;
create policy "own checklist" on public.daily_checklist for all using (auth.uid() = user_id);

-- Realtime for community feed
alter publication supabase_realtime add table public.community_posts;
