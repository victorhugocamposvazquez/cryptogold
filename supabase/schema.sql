-- ============================================================
-- openAI — Supabase schema (Postgres)
-- Run in Supabase SQL editor, or via `supabase db push` with migrations.
-- Demo/concept project: OPEN is a FICTIONAL token. No real funds move.
-- ============================================================

-- Extensions ---------------------------------------------------
create extension if not exists "pgcrypto";

-- ============================================================
-- profiles : one row per authenticated user / connected wallet
-- ============================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  wallet_address text unique,
  display_name  text,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- balances : a user's holdings per asset (OPEN, ETH, BTC, USDC)
-- amount stored as numeric to avoid float drift on money.
-- ============================================================
create table if not exists public.balances (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  asset       text not null check (asset in ('OPEN','ETH','BTC','USDC')),
  amount      numeric(38,8) not null default 0,
  updated_at  timestamptz not null default now(),
  unique (user_id, asset)
);

-- ============================================================
-- transactions : audit log of buys and swaps
-- ============================================================
create type tx_kind as enum ('buy','swap');

create table if not exists public.transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  kind         tx_kind not null,
  pay_asset    text not null,           -- e.g. 'USDC', 'EUR', 'ETH'
  pay_amount   numeric(38,8) not null,
  open_amount  numeric(38,8) not null,  -- OPEN received
  price_usd    numeric(20,8) not null,  -- OPEN/USD at execution
  fee_usd      numeric(20,8) not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists transactions_user_idx on public.transactions(user_id, created_at desc);

-- ============================================================
-- price_ticks : OPEN/USD price history that feeds the chart.
-- Populate via a scheduled function / cron, or a market data feed.
-- ============================================================
create table if not exists public.price_ticks (
  id         bigint generated always as identity primary key,
  price_usd  numeric(20,8) not null,
  ts         timestamptz not null default now()
);
create index if not exists price_ticks_ts_idx on public.price_ticks(ts desc);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles     enable row level security;
alter table public.balances     enable row level security;
alter table public.transactions enable row level security;
alter table public.price_ticks  enable row level security;

-- profiles: a user can read/update only their own row
create policy "profiles self read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles self upsert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

-- balances: scoped to owner
create policy "balances self read"   on public.balances for select using (auth.uid() = user_id);
create policy "balances self write"  on public.balances for all    using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- transactions: owner can read; writes go through the RPC below (security definer)
create policy "tx self read" on public.transactions for select using (auth.uid() = user_id);

-- price_ticks: public read, no client writes
create policy "price public read" on public.price_ticks for select using (true);

-- ============================================================
-- execute_trade(): atomic buy/swap. Validates balance, updates
-- holdings, and writes the transaction in one transaction.
-- Call from the client with supabase.rpc('execute_trade', {...}).
-- ============================================================
create or replace function public.execute_trade(
  p_kind       tx_kind,
  p_pay_asset  text,
  p_pay_amount numeric,
  p_price_usd  numeric
)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user   uuid := auth.uid();
  v_fee_bps numeric := case when p_kind = 'buy' then 100 else 30 end; -- 1% buy, 0.3% swap
  v_asset_usd numeric;
  v_gross_usd numeric;
  v_fee_usd   numeric;
  v_open      numeric;
  v_bal       numeric;
  v_tx        public.transactions;
begin
  if v_user is null then raise exception 'not authenticated'; end if;
  if p_pay_amount <= 0 then raise exception 'amount must be positive'; end if;

  -- Reference USD prices. In production fetch live from your price feed,
  -- not hardcoded. EUR/USD shown for the fiat on-ramp.
  v_asset_usd := case p_pay_asset
    when 'USDC' then 1 when 'USD' then 1 when 'EUR' then 1.08
    when 'ETH'  then 3450 when 'BTC' then 64000 else null end;
  if v_asset_usd is null then raise exception 'unsupported pay asset %', p_pay_asset; end if;

  v_gross_usd := p_pay_amount * v_asset_usd;
  v_fee_usd   := v_gross_usd * v_fee_bps / 10000;
  v_open      := (v_gross_usd - v_fee_usd) / p_price_usd;

  -- Debit the pay asset for crypto swaps/buys (skip for fiat on-ramp)
  if p_pay_asset in ('ETH','BTC','USDC') then
    select amount into v_bal from public.balances
      where user_id = v_user and asset = p_pay_asset for update;
    if coalesce(v_bal,0) < p_pay_amount then raise exception 'insufficient % balance', p_pay_asset; end if;
    update public.balances set amount = amount - p_pay_amount, updated_at = now()
      where user_id = v_user and asset = p_pay_asset;
  end if;

  -- Credit OPEN
  insert into public.balances (user_id, asset, amount)
    values (v_user, 'OPEN', v_open)
    on conflict (user_id, asset) do update set amount = public.balances.amount + excluded.amount, updated_at = now();

  insert into public.transactions (user_id, kind, pay_asset, pay_amount, open_amount, price_usd, fee_usd)
    values (v_user, p_kind, p_pay_asset, p_pay_amount, v_open, p_price_usd, v_fee_usd)
    returning * into v_tx;

  return v_tx;
end;
$$;

-- Seed a demo wallet's starting balances after first sign-in (optional):
-- insert into public.balances (user_id, asset, amount) values
--   (auth.uid(),'USDC',12500),(auth.uid(),'ETH',4.2),(auth.uid(),'BTC',0.35)
--   on conflict do nothing;
