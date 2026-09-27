export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AccountType = 'personal' | 'mt5' | 'demo' | 'prop_firm' | 'crypto' | 'stock' | 'custom'
export type TradeDirection = 'long' | 'short'
export type TradeResult = 'win' | 'loss' | 'breakeven' | 'open'
export type Session = 'london' | 'new_york' | 'asia' | 'london_ny_overlap' | 'pre_market' | 'after_hours' | 'other'
export type Emotion = 'calm' | 'confident' | 'fearful' | 'fomo' | 'greedy' | 'revenge' | 'bored' | 'frustrated' | 'neutral' | 'anxious' | 'excited'
export type MarketCondition = 'trending_up' | 'trending_down' | 'ranging' | 'volatile' | 'news_driven' | 'low_volatility'
export type PropPhase = 'challenge' | 'phase_1' | 'phase_2' | 'funded' | 'failed' | 'passed' | 'archived'

export type ImportStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type NoteFolder = 'strategies' | 'market_analysis' | 'lessons' | 'weekly_reviews' | 'monthly_reviews' | 'ideas' | 'rules' | 'general'
export type GoalType = 'monthly_pnl' | 'daily_loss_limit' | 'max_trades_per_day' | 'risk_limit' | 'rule_adherence' | 'trading_days'

export interface Profile {
  id: string
  user_id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  base_currency: string
  timezone: string
  theme: 'dark' | 'light' | 'system'
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  broker: string | null
  account_number: string | null
  currency: string
  initial_balance: number
  current_balance: number
  is_default: boolean
  is_active: boolean
  color: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Instrument {
  id: string
  user_id: string | null  // null = global default
  symbol: string
  display_name: string | null
  category: 'forex' | 'metals' | 'indices' | 'crypto' | 'stocks' | 'futures' | 'other'
  tick_size: number
  tick_value: number
  contract_size: number
  digits: number
  currency: string
  point_size: number
  lot_step?: number
  min_lot?: number
  max_lot?: number
  is_custom: boolean
  created_at: string
  updated_at: string
}

export interface Strategy {
  id: string
  user_id: string
  name: string
  description: string | null
  market: string | null
  timeframes: string[]
  entry_rules: string | null
  exit_rules: string | null
  stop_loss_rules: string | null
  take_profit_rules: string | null
  risk_rules: string | null
  trading_sessions: Session[]
  allowed_symbols: string[]
  is_active: boolean
  color: string | null
  created_at: string
  updated_at: string
}

export interface StrategyRule {
  id: string
  strategy_id: string
  user_id: string
  rule_text: string
  order_index: number
  is_active: boolean
  created_at: string
}

export interface Trade {
  id: string
  user_id: string
  account_id: string
  external_id: string | null  // broker ticket ID
  import_id: string | null
  date: string  // YYYY-MM-DD
  entry_time: string  // ISO timestamp
  exit_time: string | null
  symbol: string
  direction: TradeDirection
  lot_size: number
  entry_price: number
  stop_loss: number | null
  take_profit: number | null
  exit_price: number | null
  commission: number
  swap: number
  spread: number
  gross_pnl: number | null
  net_pnl: number | null
  risk_amount: number | null
  risk_percent: number | null
  reward_amount: number | null
  rr_ratio: number | null
  r_multiple: number | null
  pips: number | null
  holding_duration_minutes: number | null
  strategy_id: string | null
  setup: string | null
  timeframe: string | null
  session: Session | null
  market_condition: MarketCondition | null
  emotion_before: Emotion | null
  emotion_during: Emotion | null
  emotion_after: Emotion | null
  confidence_score: number | null  // 1-10
  discipline_score: number | null  // 1-10
  stress_level: number | null  // 1-10
  trade_reason: string | null
  what_went_right: string | null
  what_went_wrong: string | null
  lesson: string | null
  result: TradeResult
  rule_violations: string[]
  checklist_completed: boolean
  mae: number | null  // Maximum Adverse Excursion
  mfe: number | null  // Maximum Favorable Excursion
  source: 'manual' | 'import'
  is_demo: boolean
  created_at: string
  updated_at: string
  // joined
  account?: Account
  strategy?: Strategy
  tags?: TradeTag[]
  screenshots?: TradeScreenshot[]
}

export interface TradeScreenshot {
  id: string
  trade_id: string
  user_id: string
  type: 'before' | 'entry' | 'exit' | 'analysis' | 'other'
  storage_path: string
  signed_url?: string
  caption: string | null
  order_index: number
  created_at: string
}

export interface TradeTag {
  id: string
  user_id: string
  name: string
  color: string | null
  created_at: string
}

export interface TradeTagLink {
  trade_id: string
  tag_id: string
  tag?: TradeTag
}

export interface TradeChecklistItem {
  id: string
  user_id: string
  text: string
  order_index: number
  is_default: boolean
  is_active: boolean
  created_at: string
}

export interface TradeChecklistResult {
  id: string
  trade_id: string
  checklist_item_id: string
  checked: boolean
  item?: TradeChecklistItem
}

export interface Note {
  id: string
  user_id: string
  title: string
  content: string | null
  folder: NoteFolder
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export interface PropFirm {
  id: string
  user_id: string
  name: string
  website: string | null
  logo_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PropAccount {
  id: string
  user_id: string
  prop_firm_id: string
  account_id: string | null  // linked trading account
  name: string
  account_number: string | null
  phase: PropPhase
  currency: string
  initial_balance: number
  account_size: number
  current_balance: number
  current_equity: number
  profit_target: number
  profit_target_percent: number
  daily_loss_limit: number
  daily_loss_limit_percent: number
  overall_loss_limit: number
  overall_loss_limit_percent: number
  min_trading_days: number | null
  max_trading_days: number | null
  consistency_rule: string | null
  start_date: string | null
  end_date: string | null
  passed_date: string | null
  failed_date: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  prop_firm?: PropFirm
}

export interface PropRule {
  id: string
  prop_account_id: string
  user_id: string
  rule_name: string
  rule_value: string
  rule_type: string
  is_violated: boolean
  created_at: string
}

export interface Import {
  id: string
  user_id: string
  account_id: string
  filename: string
  status: ImportStatus
  total_rows: number
  processed_rows: number
  imported_rows: number
  skipped_rows: number
  error_rows: number
  column_mapping: Json
  created_at: string
  updated_at: string
}

export interface RiskSettings {
  id: string
  user_id: string
  account_id: string | null  // null = global
  default_risk_percent: number
  max_daily_loss_amount: number | null
  max_daily_loss_percent: number | null
  max_weekly_loss_percent: number | null
  max_monthly_loss_percent: number | null
  max_drawdown_percent: number | null
  max_trades_per_day: number | null
  max_consecutive_losses: number | null
  max_open_positions: number | null
  created_at: string
  updated_at: string
}

export interface DailyReview {
  id: string
  user_id: string
  account_id: string | null
  date: string
  what_went_well: string | null
  what_went_wrong: string | null
  tomorrow_focus: string | null
  overall_grade: number | null  // 1-10
  mood: number | null  // 1-10
  created_at: string
  updated_at: string
}

export interface WeeklyReview {
  id: string
  user_id: string
  account_id: string | null
  week_start: string
  week_end: string
  lesson: string | null
  next_week_focus: string | null
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  account_id: string | null
  goal_type: GoalType
  title: string
  target_value: number
  current_value: number
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'one_time'
  start_date: string
  end_date: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  is_read: boolean
  created_at: string
}

// Analytics types
export interface TradeAnalytics {
  total_trades: number
  winning_trades: number
  losing_trades: number
  breakeven_trades: number
  win_rate: number
  total_net_pnl: number
  total_gross_pnl: number
  total_commissions: number
  total_swaps: number
  average_win: number
  average_loss: number
  profit_factor: number
  expectancy: number
  average_r_multiple: number
  max_r_multiple: number
  min_r_multiple: number
  max_drawdown: number
  max_drawdown_percent: number
  max_winning_streak: number
  max_losing_streak: number
  current_streak: number
  current_streak_type: 'win' | 'loss' | 'none'
  average_holding_time_minutes: number
  best_trade_pnl: number
  worst_trade_pnl: number
  winning_days: number
  losing_days: number
  total_risk_taken: number
  average_risk_percent: number
}

// Database shape (generated from Supabase)
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      accounts: { Row: Account; Insert: Partial<Account>; Update: Partial<Account> }
      instruments: { Row: Instrument; Insert: Partial<Instrument>; Update: Partial<Instrument> }
      strategies: { Row: Strategy; Insert: Partial<Strategy>; Update: Partial<Strategy> }
      strategy_rules: { Row: StrategyRule; Insert: Partial<StrategyRule>; Update: Partial<StrategyRule> }
      trades: { Row: Trade; Insert: Partial<Trade>; Update: Partial<Trade> }
      trade_screenshots: { Row: TradeScreenshot; Insert: Partial<TradeScreenshot>; Update: Partial<TradeScreenshot> }
      trade_tags: { Row: TradeTag; Insert: Partial<TradeTag>; Update: Partial<TradeTag> }
      trade_tag_links: { Row: TradeTagLink; Insert: Partial<TradeTagLink>; Update: Partial<TradeTagLink> }
      trade_checklist_items: { Row: TradeChecklistItem; Insert: Partial<TradeChecklistItem>; Update: Partial<TradeChecklistItem> }
      trade_checklist_results: { Row: TradeChecklistResult; Insert: Partial<TradeChecklistResult>; Update: Partial<TradeChecklistResult> }
      notes: { Row: Note; Insert: Partial<Note>; Update: Partial<Note> }
      prop_firms: { Row: PropFirm; Insert: Partial<PropFirm>; Update: Partial<PropFirm> }
      prop_accounts: { Row: PropAccount; Insert: Partial<PropAccount>; Update: Partial<PropAccount> }
      prop_rules: { Row: PropRule; Insert: Partial<PropRule>; Update: Partial<PropRule> }
      imports: { Row: Import; Insert: Partial<Import>; Update: Partial<Import> }
      risk_settings: { Row: RiskSettings; Insert: Partial<RiskSettings>; Update: Partial<RiskSettings> }
      daily_reviews: { Row: DailyReview; Insert: Partial<DailyReview>; Update: Partial<DailyReview> }
      weekly_reviews: { Row: WeeklyReview; Insert: Partial<WeeklyReview>; Update: Partial<WeeklyReview> }
      goals: { Row: Goal; Insert: Partial<Goal>; Update: Partial<Goal> }
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> }
    }
  }
}
