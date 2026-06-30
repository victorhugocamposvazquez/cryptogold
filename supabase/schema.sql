-- ============================================================
-- CryptoGold — Supabase schema (Postgres)
-- Run in Supabase SQL editor, or via `supabase db push`.
-- Token: CGOLD (CryptoGold). Demo balances optional until auth wired.
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- profiles
-- ============================================================
create table if not exists public.profiles (
  id             uuid primary key default gen_random_uuid(),
  auth_id        uuid unique references auth.users(id) on delete set null,
  wallet_address text unique,
  display_name   text,
  created_at     timestamptz not null default now()
);

-- ============================================================
-- balances : CGOLD, USDT, USDC, ETH, BTC
-- ============================================================
create table if not exists public.balances (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  asset      text not null check (asset in ('CGOLD','USDT','USDC','ETH','BTC')),
  amount     numeric(38,8) not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, asset)
);

-- ============================================================
-- transactions
-- ============================================================
create type tx_kind as enum ('buy','swap');

create table if not exists public.transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  kind         tx_kind not null,
  pay_asset    text not null,
  pay_amount   numeric(38,8) not null,
  cgold_amount numeric(38,8) not null,
  price_usd    numeric(20,8) not null,
  fee_usd      numeric(20,8) not null default 0,
  external_id  text,
  provider     text,
  created_at   timestamptz not null default now()
);
create index if not exists transactions_user_idx on public.transactions(user_id, created_at desc);

-- ============================================================
-- price_ticks : CGOLD/USD + gold spot reference
-- ============================================================
create table if not exists public.price_ticks (
  id         bigint generated always as identity primary key,
  price_usd  numeric(20,8) not null,
  gold_usd   numeric(20,8),
  ts         timestamptz not null default now()
);
create index if not exists price_ticks_ts_idx on public.price_ticks(ts desc);

-- ============================================================
-- RLS
-- ============================================================
alter table public.profiles     enable row level security;
alter table public.balances     enable row level security;
alter table public.transactions enable row level security;
alter table public.price_ticks  enable row level security;

create policy "profiles self read"   on public.profiles for select using (auth.uid() = auth_id);
create policy "profiles self upsert" on public.profiles for insert with check (auth.uid() = auth_id);
create policy "profiles self update" on public.profiles for update using (auth.uid() = auth_id);

create policy "balances self read"  on public.balances for select using (
  user_id in (select id from public.profiles where auth_id = auth.uid())
);
create policy "balances self write" on public.balances for all using (
  user_id in (select id from public.profiles where auth_id = auth.uid())
) with check (
  user_id in (select id from public.profiles where auth_id = auth.uid())
);

create policy "tx self read" on public.transactions for select using (
  user_id in (select id from public.profiles where auth_id = auth.uid())
);

create policy "price public read" on public.price_ticks for select using (true);

-- ============================================================
-- execute_trade(): atomic buy/swap (authenticated users)
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
  v_user      uuid;
  v_fee_bps   numeric := case when p_kind = 'buy' then 100 else 30 end;
  v_asset_usd numeric;
  v_gross_usd numeric;
  v_fee_usd   numeric;
  v_cgold     numeric;
  v_bal       numeric;
  v_tx        public.transactions;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select id into v_user from public.profiles where auth_id = auth.uid();
  if v_user is null then raise exception 'profile not found'; end if;
  if p_pay_amount <= 0 then raise exception 'amount must be positive'; end if;

  v_asset_usd := case p_pay_asset
    when 'USDT' then 1 when 'USDC' then 1 when 'USD' then 1 when 'EUR' then 1.08
    when 'ETH'  then 3450 when 'BTC' then 64000 else null end;
  if v_asset_usd is null then raise exception 'unsupported pay asset %', p_pay_asset; end if;

  v_gross_usd := p_pay_amount * v_asset_usd;
  v_fee_usd   := v_gross_usd * v_fee_bps / 10000;
  v_cgold     := (v_gross_usd - v_fee_usd) / p_price_usd;

  if p_pay_asset in ('ETH','BTC','USDT','USDC') then
    select amount into v_bal from public.balances
      where user_id = v_user and asset = p_pay_asset for update;
    if coalesce(v_bal,0) < p_pay_amount then raise exception 'insufficient % balance', p_pay_asset; end if;
    update public.balances set amount = amount - p_pay_amount, updated_at = now()
      where user_id = v_user and asset = p_pay_asset;
  end if;

  insert into public.balances (user_id, asset, amount)
    values (v_user, 'CGOLD', v_cgold)
    on conflict (user_id, asset) do update set amount = public.balances.amount + excluded.amount, updated_at = now();

  insert into public.transactions (user_id, kind, pay_asset, pay_amount, cgold_amount, price_usd, fee_usd)
    values (v_user, p_kind, p_pay_asset, p_pay_amount, v_cgold, p_price_usd, v_fee_usd)
    returning * into v_tx;

  return v_tx;
end;
$$;

-- ============================================================
-- credit_fiat_purchase(): webhook from Transak/MoonPay/CRYPTOHOST
-- Service-role only. Creates profile by wallet if needed.
-- ============================================================
create or replace function public.credit_fiat_purchase(
  p_wallet     text,
  p_pay_asset  text,
  p_pay_amount numeric,
  p_price_usd  numeric,
  p_external_id text default null,
  p_provider   text default null
)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user      uuid;
  v_asset_usd numeric;
  v_gross_usd numeric;
  v_fee_usd   numeric;
  v_cgold     numeric;
  v_tx        public.transactions;
begin
  if p_pay_amount <= 0 then raise exception 'amount must be positive'; end if;

  select id into v_user from public.profiles where wallet_address = lower(p_wallet);
  if v_user is null then
    insert into public.profiles (wallet_address)
      values (lower(p_wallet))
      returning id into v_user;
  end if;

  v_asset_usd := case p_pay_asset when 'USD' then 1 when 'EUR' then 1.08 else 1 end;
  v_gross_usd := p_pay_amount * v_asset_usd;
  v_fee_usd   := v_gross_usd * 0.015;
  v_cgold     := (v_gross_usd - v_fee_usd) / p_price_usd;

  insert into public.balances (user_id, asset, amount)
    values (v_user, 'CGOLD', v_cgold)
    on conflict (user_id, asset) do update set amount = public.balances.amount + excluded.amount, updated_at = now();

  insert into public.transactions (user_id, kind, pay_asset, pay_amount, cgold_amount, price_usd, fee_usd, external_id, provider)
    values (v_user, 'buy', p_pay_asset, p_pay_amount, v_cgold, p_price_usd, v_fee_usd, p_external_id, p_provider)
    returning * into v_tx;

  return v_tx;
end;
$$;

revoke all on function public.credit_fiat_purchase from public;
grant execute on function public.credit_fiat_purchase to service_role;
