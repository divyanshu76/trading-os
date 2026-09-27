-- ============================================================
-- Trading OS — Full Database Schema
-- Run this in your Supabase SQL editor (or via supabase migrate)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade unique not null,
  username      text,
  full_name     text,
  avatar_url    text,
  base_currency text not null default 'USD',
  timezone      text not null default 'Asia/Kolkata',
  theme         text not null default 'dark' check (theme in ('dark', 'light', 'system')),
  onboarding_completed boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ACCOUNTS
-- ============================================================
create table public.accounts (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  name            text not null,
  type            text not null default 'personal'
                    check (type in ('personal','mt5','demo','prop_firm','crypto','stock','custom')),
  broker          text,
  account_number  text,
  currency        text not null default 'USD',
  initial_balance numeric(18,2) not null default 0,
  current_balance numeric(18,2) not null default 0,
  is_default      boolean not null default false,
  is_active       boolean not null default true,
  color           text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_accounts_user_id on public.accounts(user_id);
alter table public.accounts enable row level security;
create policy "Users own accounts" on public.accounts for all using (auth.uid() = user_id);

-- ============================================================
-- INSTRUMENTS
-- ============================================================
create table public.instruments (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade,
  symbol        text not null,
  display_name  text,
  category      text not null default 'forex'
                  check (category in ('forex','metals','indices','crypto','stocks','futures','other')),
  tick_size     numeric(18,8) not null default 0.00001,
  tick_value    numeric(18,8) not null default 1,
  contract_size numeric(18,2) not null default 100000,
  digits        int not null default 5,
  currency      text not null default 'USD',
  point_size    numeric(18,8) not null default 0.00001,
  is_custom     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(user_id, symbol)
);

create index idx_instruments_user_id on public.instruments(user_id);
create index idx_instruments_symbol on public.instruments(symbol);
alter table public.instruments enable row level security;
create policy "Users can view global + own instruments" on public.instruments for select
  using (user_id is null or auth.uid() = user_id);
create policy "Users can manage own instruments" on public.instruments for all
  using (auth.uid() = user_id);

-- Insert default instrument specs
insert into public.instruments (user_id, symbol, display_name, category, tick_size, tick_value, contract_size, digits, currency, point_size, is_custom) values
(null, 'XAUUSD', 'Gold vs USD',       'metals',  0.01,     1,   100,    2, 'USD', 0.01,     false),
(null, 'EURUSD', 'Euro vs USD',        'forex',   0.00001,  1,   100000, 5, 'USD', 0.00001,  false),
(null, 'GBPUSD', 'GBP vs USD',         'forex',   0.00001,  1,   100000, 5, 'USD', 0.00001,  false),
(null, 'USDJPY', 'USD vs JPY',         'forex',   0.001,    1,   100000, 3, 'JPY', 0.001,    false),
(null, 'USDCHF', 'USD vs CHF',         'forex',   0.00001,  1,   100000, 5, 'CHF', 0.00001,  false),
(null, 'AUDUSD', 'AUD vs USD',         'forex',   0.00001,  1,   100000, 5, 'USD', 0.00001,  false),
(null, 'NZDUSD', 'NZD vs USD',         'forex',   0.00001,  1,   100000, 5, 'USD', 0.00001,  false),
(null, 'USDCAD', 'USD vs CAD',         'forex',   0.00001,  1,   100000, 5, 'CAD', 0.00001,  false),
(null, 'GBPJPY', 'GBP vs JPY',         'forex',   0.001,    1,   100000, 3, 'JPY', 0.001,    false),
(null, 'EURJPY', 'Euro vs JPY',        'forex',   0.001,    1,   100000, 3, 'JPY', 0.001,    false),
(null, 'NAS100', 'Nasdaq 100',         'indices', 0.01,     1,   1,      2, 'USD', 1,        false),
(null, 'US30',   'Dow Jones',          'indices', 0.01,     1,   1,      2, 'USD', 1,        false),
(null, 'SP500',  'S&P 500',            'indices', 0.01,     1,   1,      2, 'USD', 1,        false),
(null, 'UK100',  'FTSE 100',           'indices', 0.01,     1,   1,      2, 'GBP', 1,        false),
(null, 'GER40',  'DAX 40',             'indices', 0.01,     1,   1,      2, 'EUR', 1,        false),
(null, 'BTCUSD', 'Bitcoin vs USD',     'crypto',  0.01,     1,   1,      2, 'USD', 0.01,     false),
(null, 'ETHUSD', 'Ethereum vs USD',    'crypto',  0.01,     1,   1,      2, 'USD', 0.01,     false),
(null, 'XAGUSD', 'Silver vs USD',      'metals',  0.001,    1,   5000,   3, 'USD', 0.001,    false);

-- ============================================================
-- STRATEGIES
-- ============================================================
create table public.strategies (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  name             text not null,
  description      text,
  market           text,
  timeframes       text[] not null default '{}',
  entry_rules      text,
  exit_rules       text,
  stop_loss_rules  text,
  take_profit_rules text,
  risk_rules       text,
  trading_sessions text[] not null default '{}',
  allowed_symbols  text[] not null default '{}',
  is_active        boolean not null default true,
  color            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_strategies_user_id on public.strategies(user_id);
alter table public.strategies enable row level security;
create policy "Users own strategies" on public.strategies for all using (auth.uid() = user_id);

create table public.strategy_rules (
  id           uuid primary key default uuid_generate_v4(),
  strategy_id  uuid references public.strategies(id) on delete cascade not null,
  user_id      uuid references auth.users(id) on delete cascade not null,
  rule_text    text not null,
  order_index  int not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

alter table public.strategy_rules enable row level security;
create policy "Users own strategy rules" on public.strategy_rules for all using (auth.uid() = user_id);

-- ============================================================
-- TRADE TAGS
-- ============================================================
create table public.trade_tags (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  color      text,
  created_at timestamptz not null default now(),
  unique(user_id, name)
);

alter table public.trade_tags enable row level security;
create policy "Users own trade tags" on public.trade_tags for all using (auth.uid() = user_id);

-- ============================================================
-- TRADE CHECKLIST ITEMS
-- ============================================================
create table public.trade_checklist_items (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  text        text not null,
  order_index int not null default 0,
  is_default  boolean not null default false,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.trade_checklist_items enable row level security;
create policy "Users own checklist items" on public.trade_checklist_items for all using (auth.uid() = user_id);

-- ============================================================
-- TRADES (core journal)
-- ============================================================
create table public.trades (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid references auth.users(id) on delete cascade not null,
  account_id              uuid references public.accounts(id) on delete cascade not null,
  external_id             text,           -- broker ticket ID
  import_id               uuid,           -- linked to imports table
  date                    date not null,
  entry_time              timestamptz not null,
  exit_time               timestamptz,
  symbol                  text not null,
  direction               text not null check (direction in ('long', 'short')),
  lot_size                numeric(18,4) not null,
  entry_price             numeric(18,8) not null,
  stop_loss               numeric(18,8),
  take_profit             numeric(18,8),
  exit_price              numeric(18,8),
  commission              numeric(18,2) not null default 0,
  swap                    numeric(18,2) not null default 0,
  spread                  numeric(18,2) not null default 0,
  gross_pnl               numeric(18,2),
  net_pnl                 numeric(18,2),
  risk_amount             numeric(18,2),
  risk_percent            numeric(8,4),
  reward_amount           numeric(18,2),
  rr_ratio                numeric(8,4),
  r_multiple              numeric(8,4),
  pips                    numeric(10,2),
  holding_duration_minutes int,
  strategy_id             uuid references public.strategies(id) on delete set null,
  setup                   text,
  timeframe               text,
  session                 text check (session in ('london','new_york','asia','london_ny_overlap','pre_market','after_hours','other')),
  market_condition        text check (market_condition in ('trending_up','trending_down','ranging','volatile','news_driven','low_volatility')),
  emotion_before          text check (emotion_before in ('calm','confident','fearful','fomo','greedy','revenge','bored','frustrated','neutral','anxious','excited')),
  emotion_during          text check (emotion_during in ('calm','confident','fearful','fomo','greedy','revenge','bored','frustrated','neutral','anxious','excited')),
  emotion_after           text check (emotion_after in ('calm','confident','fearful','fomo','greedy','revenge','bored','frustrated','neutral','anxious','excited')),
  confidence_score        int check (confidence_score between 1 and 10),
  discipline_score        int check (discipline_score between 1 and 10),
  stress_level            int check (stress_level between 1 and 10),
  trade_reason            text,
  what_went_right         text,
  what_went_wrong         text,
  lesson                  text,
  result                  text not null default 'open'
                            check (result in ('win','loss','breakeven','open')),
  rule_violations         text[] not null default '{}',
  checklist_completed     boolean not null default false,
  mae                     numeric(18,8),
  mfe                     numeric(18,8),
  source                  text not null default 'manual'
                            check (source in ('manual','import','broker_sync')),
  is_demo                 boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique(user_id, account_id, external_id) -- prevent duplicate broker imports
);

create index idx_trades_user_id     on public.trades(user_id);
create index idx_trades_account_id  on public.trades(account_id);
create index idx_trades_date        on public.trades(date);
create index idx_trades_symbol      on public.trades(symbol);
create index idx_trades_strategy_id on public.trades(strategy_id);
create index idx_trades_result      on public.trades(result);
create index idx_trades_external_id on public.trades(external_id);

alter table public.trades enable row level security;
create policy "Users own trades" on public.trades for all using (auth.uid() = user_id);

-- ============================================================
-- TRADE SCREENSHOTS
-- ============================================================
create table public.trade_screenshots (
  id           uuid primary key default uuid_generate_v4(),
  trade_id     uuid references public.trades(id) on delete cascade not null,
  user_id      uuid references auth.users(id) on delete cascade not null,
  type         text not null default 'other'
                 check (type in ('before','entry','exit','analysis','other')),
  storage_path text not null,
  caption      text,
  order_index  int not null default 0,
  created_at   timestamptz not null default now()
);

create index idx_trade_screenshots_trade_id on public.trade_screenshots(trade_id);
alter table public.trade_screenshots enable row level security;
create policy "Users own trade screenshots" on public.trade_screenshots for all using (auth.uid() = user_id);

-- ============================================================
-- TRADE TAG LINKS (many-to-many)
-- ============================================================
create table public.trade_tag_links (
  trade_id uuid references public.trades(id) on delete cascade not null,
  tag_id   uuid references public.trade_tags(id) on delete cascade not null,
  primary key (trade_id, tag_id)
);

alter table public.trade_tag_links enable row level security;
create policy "Users own trade tag links" on public.trade_tag_links for all
  using (exists (select 1 from public.trades where id = trade_id and user_id = auth.uid()));

-- ============================================================
-- TRADE CHECKLIST RESULTS
-- ============================================================
create table public.trade_checklist_results (
  id                  uuid primary key default uuid_generate_v4(),
  trade_id            uuid references public.trades(id) on delete cascade not null,
  checklist_item_id   uuid references public.trade_checklist_items(id) on delete cascade not null,
  checked             boolean not null default false,
  unique(trade_id, checklist_item_id)
);

alter table public.trade_checklist_results enable row level security;
create policy "Users own checklist results" on public.trade_checklist_results for all
  using (exists (select 1 from public.trades where id = trade_id and user_id = auth.uid()));

-- ============================================================
-- NOTES
-- ============================================================
create table public.notes (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  title      text not null,
  content    text,
  folder     text not null default 'general'
               check (folder in ('strategies','market_analysis','lessons','weekly_reviews','monthly_reviews','ideas','rules','general')),
  is_pinned  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_notes_user_id on public.notes(user_id);
create index idx_notes_folder  on public.notes(folder);
alter table public.notes enable row level security;
create policy "Users own notes" on public.notes for all using (auth.uid() = user_id);

-- ============================================================
-- PROP FIRMS
-- ============================================================
create table public.prop_firms (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  website    text,
  logo_url   text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.prop_firms enable row level security;
create policy "Users own prop firms" on public.prop_firms for all using (auth.uid() = user_id);

create table public.prop_accounts (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid references auth.users(id) on delete cascade not null,
  prop_firm_id            uuid references public.prop_firms(id) on delete cascade not null,
  account_id              uuid references public.accounts(id) on delete set null,
  name                    text not null,
  account_number          text,
  phase                   text not null default 'challenge'
                            check (phase in ('challenge','phase_1','phase_2','funded','failed','passed','archived')),
  currency                text not null default 'USD',
  initial_balance         numeric(18,2) not null,
  account_size            numeric(18,2) not null,
  current_balance         numeric(18,2) not null,
  current_equity          numeric(18,2) not null,
  profit_target           numeric(18,2) not null,
  profit_target_percent   numeric(8,4) not null,
  daily_loss_limit        numeric(18,2) not null,
  daily_loss_limit_percent numeric(8,4) not null,
  overall_loss_limit      numeric(18,2) not null,
  overall_loss_limit_percent numeric(8,4) not null,
  min_trading_days        int,
  max_trading_days        int,
  consistency_rule        text,
  start_date              date,
  end_date                date,
  passed_date             date,
  failed_date             date,
  notes                   text,
  is_active               boolean not null default true,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index idx_prop_accounts_user_id       on public.prop_accounts(user_id);
create index idx_prop_accounts_prop_firm_id  on public.prop_accounts(prop_firm_id);
alter table public.prop_accounts enable row level security;
create policy "Users own prop accounts" on public.prop_accounts for all using (auth.uid() = user_id);

create table public.prop_rules (
  id              uuid primary key default uuid_generate_v4(),
  prop_account_id uuid references public.prop_accounts(id) on delete cascade not null,
  user_id         uuid references auth.users(id) on delete cascade not null,
  rule_name       text not null,
  rule_value      text not null,
  rule_type       text not null,
  is_violated     boolean not null default false,
  created_at      timestamptz not null default now()
);

alter table public.prop_rules enable row level security;
create policy "Users own prop rules" on public.prop_rules for all using (auth.uid() = user_id);

-- ============================================================
-- BROKER CONNECTIONS
-- ============================================================
create table public.broker_connections (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete set null,
  broker_type text not null check (broker_type in ('mt5','mt4','csv','api','manual')),
  name       text not null,
  status     text not null default 'disconnected'
               check (status in ('connected','disconnected','error','syncing')),
  last_sync_at timestamptz,
  last_error text,
  config     jsonb not null default '{}', -- encrypted values only, never plain credentials
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.broker_connections enable row level security;
create policy "Users own broker connections" on public.broker_connections for all using (auth.uid() = user_id);

create table public.sync_logs (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid references auth.users(id) on delete cascade not null,
  broker_connection_id  uuid references public.broker_connections(id) on delete cascade not null,
  started_at            timestamptz not null default now(),
  ended_at              timestamptz,
  records_fetched       int not null default 0,
  records_inserted      int not null default 0,
  records_updated       int not null default 0,
  duplicates_skipped    int not null default 0,
  errors                int not null default 0,
  status                text not null default 'running'
                          check (status in ('running','completed','failed')),
  error_message         text
);

alter table public.sync_logs enable row level security;
create policy "Users own sync logs" on public.sync_logs for all using (auth.uid() = user_id);

-- ============================================================
-- IMPORTS
-- ============================================================
create table public.imports (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  account_id     uuid references public.accounts(id) on delete cascade not null,
  filename       text not null,
  status         text not null default 'pending'
                   check (status in ('pending','processing','completed','failed')),
  total_rows     int not null default 0,
  processed_rows int not null default 0,
  imported_rows  int not null default 0,
  skipped_rows   int not null default 0,
  error_rows     int not null default 0,
  column_mapping jsonb not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.imports enable row level security;
create policy "Users own imports" on public.imports for all using (auth.uid() = user_id);

-- ============================================================
-- RISK SETTINGS
-- ============================================================
create table public.risk_settings (
  id                       uuid primary key default uuid_generate_v4(),
  user_id                  uuid references auth.users(id) on delete cascade not null,
  account_id               uuid references public.accounts(id) on delete cascade,
  default_risk_percent     numeric(8,4) not null default 1.0,
  max_daily_loss_amount    numeric(18,2),
  max_daily_loss_percent   numeric(8,4),
  max_weekly_loss_percent  numeric(8,4),
  max_monthly_loss_percent numeric(8,4),
  max_drawdown_percent     numeric(8,4),
  max_trades_per_day       int,
  max_consecutive_losses   int,
  max_open_positions       int,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

alter table public.risk_settings enable row level security;
create policy "Users own risk settings" on public.risk_settings for all using (auth.uid() = user_id);

-- ============================================================
-- DAILY / WEEKLY REVIEWS
-- ============================================================
create table public.daily_reviews (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  account_id      uuid references public.accounts(id) on delete set null,
  date            date not null,
  what_went_well  text,
  what_went_wrong text,
  tomorrow_focus  text,
  overall_grade   int check (overall_grade between 1 and 10),
  mood            int check (mood between 1 and 10),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(user_id, date)
);

alter table public.daily_reviews enable row level security;
create policy "Users own daily reviews" on public.daily_reviews for all using (auth.uid() = user_id);

create table public.weekly_reviews (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  account_id       uuid references public.accounts(id) on delete set null,
  week_start       date not null,
  week_end         date not null,
  lesson           text,
  next_week_focus  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique(user_id, week_start)
);

alter table public.weekly_reviews enable row level security;
create policy "Users own weekly reviews" on public.weekly_reviews for all using (auth.uid() = user_id);

-- ============================================================
-- GOALS
-- ============================================================
create table public.goals (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  account_id    uuid references public.accounts(id) on delete set null,
  goal_type     text not null,
  title         text not null,
  target_value  numeric(18,4) not null,
  current_value numeric(18,4) not null default 0,
  period        text not null check (period in ('daily','weekly','monthly','yearly','one_time')),
  start_date    date not null,
  end_date      date,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.goals enable row level security;
create policy "Users own goals" on public.goals for all using (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  title      text not null,
  message    text not null,
  type       text not null default 'info' check (type in ('info','warning','error','success')),
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_is_read on public.notifications(is_read);
alter table public.notifications enable row level security;
create policy "Users own notifications" on public.notifications for all using (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKETS (run separately or via Supabase dashboard)
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('trade-screenshots', 'trade-screenshots', false);
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', false);
-- insert into storage.buckets (id, name, public) values ('reports', 'reports', false);

-- Storage RLS policies (after creating buckets):
-- create policy "Users access own screenshots" on storage.objects for all
--   using (bucket_id = 'trade-screenshots' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.profiles        for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.accounts        for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.instruments     for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.strategies      for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.trades          for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.notes           for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.prop_firms      for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.prop_accounts   for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.broker_connections for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.imports         for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.risk_settings   for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.daily_reviews   for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.weekly_reviews  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.goals           for each row execute procedure public.set_updated_at();
