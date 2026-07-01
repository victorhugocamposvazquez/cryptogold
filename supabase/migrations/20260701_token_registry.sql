-- Token registry (persistent deploys + mints for /admin/token)
create table if not exists public.token_deployments (
  id                text primary key,
  network           text not null check (network in ('testnet','mainnet')),
  chain_id          int not null,
  address           text not null,
  name              text not null,
  symbol            text not null,
  max_supply        text not null,
  initial_mint      text not null default '0',
  treasury          text not null,
  deployer          text not null,
  tx_hash           text not null,
  contract_template text,
  explorer          text,
  active            boolean not null default false,
  created_at        timestamptz not null default now()
);

create unique index if not exists token_deployments_one_active_per_network
  on public.token_deployments (network)
  where active = true;

create index if not exists token_deployments_network_created_idx
  on public.token_deployments (network, created_at desc);

create table if not exists public.token_mints (
  id               text primary key,
  network          text not null check (network in ('testnet','mainnet')),
  contract_address text not null,
  to_address       text not null,
  amount           text not null,
  category         text not null,
  note             text,
  tx_hash          text not null,
  created_at       timestamptz not null default now()
);

create index if not exists token_mints_network_created_idx
  on public.token_mints (network, created_at desc);

alter table public.token_deployments enable row level security;
alter table public.token_mints enable row level security;
