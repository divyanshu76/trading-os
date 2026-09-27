import type { Instrument, Trade, TradeDirection } from '@/types/database'

/**
 * Financial Calculation Engine
 * All P&L and risk calculations are isolated here.
 * Never mix calculation logic into UI components.
 */

// ─── Instrument Specs ────────────────────────────────────────────────────────

/** Default instrument specs for common symbols */
export const DEFAULT_INSTRUMENTS: Record<string, Partial<Instrument>> = {
  XAUUSD: { tick_size: 0.01, tick_value: 1, contract_size: 100, digits: 2, point_size: 0.01, currency: 'USD', lot_step: 0.01, min_lot: 0.01, max_lot: 100 },
  EURUSD: { tick_size: 0.00001, tick_value: 1, contract_size: 100000, digits: 5, point_size: 0.00001, currency: 'USD', lot_step: 0.01, min_lot: 0.01, max_lot: 100 },
  GBPUSD: { tick_size: 0.00001, tick_value: 1, contract_size: 100000, digits: 5, point_size: 0.00001, currency: 'USD', lot_step: 0.01, min_lot: 0.01, max_lot: 100 },
  USDJPY: { tick_size: 0.001, tick_value: 1, contract_size: 100000, digits: 3, point_size: 0.001, currency: 'JPY', lot_step: 0.01, min_lot: 0.01, max_lot: 100 },
  USDCHF: { tick_size: 0.00001, tick_value: 1, contract_size: 100000, digits: 5, point_size: 0.00001, currency: 'CHF', lot_step: 0.01, min_lot: 0.01, max_lot: 100 },
  AUDUSD: { tick_size: 0.00001, tick_value: 1, contract_size: 100000, digits: 5, point_size: 0.00001, currency: 'USD', lot_step: 0.01, min_lot: 0.01, max_lot: 100 },
  NZDUSD: { tick_size: 0.00001, tick_value: 1, contract_size: 100000, digits: 5, point_size: 0.00001, currency: 'USD', lot_step: 0.01, min_lot: 0.01, max_lot: 100 },
  USDCAD: { tick_size: 0.00001, tick_value: 1, contract_size: 100000, digits: 5, point_size: 0.00001, currency: 'CAD', lot_step: 0.01, min_lot: 0.01, max_lot: 100 },
  NAS100: { tick_size: 0.01, tick_value: 1, contract_size: 1, digits: 2, point_size: 1, currency: 'USD', lot_step: 0.1, min_lot: 0.1, max_lot: 100 },
  US30:   { tick_size: 0.01, tick_value: 1, contract_size: 1, digits: 2, point_size: 1, currency: 'USD', lot_step: 0.1, min_lot: 0.1, max_lot: 100 },
  SP500:  { tick_size: 0.01, tick_value: 1, contract_size: 1, digits: 2, point_size: 1, currency: 'USD', lot_step: 0.1, min_lot: 0.1, max_lot: 100 },
  BTCUSD: { tick_size: 0.01, tick_value: 1, contract_size: 1, digits: 2, point_size: 1, currency: 'USD', lot_step: 0.01, min_lot: 0.01, max_lot: 100 },
  ETHUSD: { tick_size: 0.01, tick_value: 1, contract_size: 1, digits: 2, point_size: 1, currency: 'USD', lot_step: 0.01, min_lot: 0.01, max_lot: 100 },
  XAGUSD: { tick_size: 0.001, tick_value: 1, contract_size: 5000, digits: 3, point_size: 0.001, currency: 'USD', lot_step: 0.01, min_lot: 0.01, max_lot: 100 },
}

// ─── Core Calculations ────────────────────────────────────────────────────────

/**
 * Calculate P&L for a trade.
 * Uses instrument specifications to determine the correct pip/tick value.
 * Does NOT hardcode one formula for all assets.
 */
export function calculatePnl(params: {
  direction: TradeDirection
  entryPrice: number
  exitPrice: number
  lotSize: number
  instrument: Pick<Instrument, 'tick_size' | 'tick_value' | 'contract_size' | 'point_size'>
}): { gross_pnl: number; pips: number } {
  const { direction, entryPrice, exitPrice, lotSize, instrument } = params
  const { contract_size, tick_size, tick_value } = instrument

  const priceDiff = direction === 'long'
    ? exitPrice - entryPrice
    : entryPrice - exitPrice

  const ticks = priceDiff / tick_size
  // tick_value in MT5 is already defined per 1 standard lot
  const gross_pnl = ticks * tick_value * lotSize
  const pips = priceDiff / (instrument.point_size || tick_size * 10)

  return { gross_pnl: Number(gross_pnl.toFixed(2)), pips: Number(pips.toFixed(1)) }
}

/**
 * Calculate net P&L after commissions and swap
 */
export function calculateNetPnl(params: {
  grossPnl: number
  commission: number
  swap: number
  spread?: number
}): number {
  const { grossPnl, commission, swap, spread = 0 } = params
  return Number((grossPnl - commission - swap - spread).toFixed(2))
}

/**
 * Calculate risk amount in account currency
 */
export function calculateRiskAmount(params: {
  accountBalance: number
  riskPercent: number
}): number {
  return Number(((params.accountBalance * params.riskPercent) / 100).toFixed(2))
}

/**
 * Calculate risk percent from amount
 */
export function calculateRiskPercent(params: {
  accountBalance: number
  riskAmount: number
}): number {
  if (params.accountBalance === 0) return 0
  return Number(((params.riskAmount / params.accountBalance) * 100).toFixed(2))
}

/**
 * Calculate risk amount from entry and stop loss
 */
export function calculateRiskFromSL(params: {
  direction: TradeDirection
  entryPrice: number
  stopLoss: number
  lotSize: number
  instrument: Pick<Instrument, 'tick_size' | 'tick_value' | 'contract_size'>
}): number {
  const { direction, entryPrice, stopLoss, lotSize, instrument } = params
  const { contract_size, tick_size, tick_value } = instrument

  const slDistance = direction === 'long'
    ? entryPrice - stopLoss
    : stopLoss - entryPrice

  if (slDistance <= 0) return 0

  const ticks = slDistance / tick_size
  const risk = ticks * tick_value * lotSize
  return Number(risk.toFixed(2))
}

/**
 * Calculate reward amount from entry and take profit
 */
export function calculateRewardFromTP(params: {
  direction: TradeDirection
  entryPrice: number
  takeProfit: number
  lotSize: number
  instrument: Pick<Instrument, 'tick_size' | 'tick_value' | 'contract_size'>
}): number {
  const { direction, entryPrice, takeProfit, lotSize, instrument } = params
  const { contract_size, tick_size, tick_value } = instrument

  const tpDistance = direction === 'long'
    ? takeProfit - entryPrice
    : entryPrice - takeProfit

  if (tpDistance <= 0) return 0

  const ticks = tpDistance / tick_size
  const reward = ticks * tick_value * lotSize
  return Number(reward.toFixed(2))
}

/**
 * Calculate Risk:Reward ratio
 */
export function calculateRR(params: {
  riskAmount: number
  rewardAmount: number
}): number {
  if (params.riskAmount === 0) return 0
  return Number((params.rewardAmount / params.riskAmount).toFixed(2))
}

/**
 * Calculate R-Multiple: how many R units was the actual result
 * Positive = profit, Negative = loss
 */
export function calculateRMultiple(params: {
  netPnl: number
  riskAmount: number
}): number | null {
  if (params.riskAmount === 0) return null
  return Number((params.netPnl / params.riskAmount).toFixed(2))
}

/**
 * Calculate position size (lot size) from risk parameters
 */
export function calculateLotSize(params: {
  accountBalance: number
  riskPercent: number
  direction: TradeDirection
  entryPrice: number
  stopLoss: number
  instrument: Pick<Instrument, 'tick_size' | 'tick_value' | 'contract_size' | 'lot_step' | 'min_lot' | 'max_lot'>
}): { lotSize: number; riskAmount: number } {
  const { accountBalance, riskPercent, direction, entryPrice, stopLoss, instrument } = params
  const { tick_size, tick_value, lot_step = 0.01, min_lot = 0.01, max_lot = 100 } = instrument

  const initialRiskAmount = (accountBalance * riskPercent) / 100

  const slDistance = direction === 'long'
    ? entryPrice - stopLoss
    : stopLoss - entryPrice

  if (slDistance <= 0) return { lotSize: 0, riskAmount: 0 }

  const ticksAtRisk = slDistance / tick_size
  const valuePerLot = ticksAtRisk * tick_value

  if (valuePerLot === 0) return { lotSize: 0, riskAmount: 0 }

  // 1. Calculate raw lot size
  let rawLotSize = initialRiskAmount / valuePerLot
  
  // 2. Normalize lot size based on lot_step
  let normalizedLotSize = Math.floor(rawLotSize / lot_step) * lot_step
  
  // 3. Apply min/max lot constraints
  if (normalizedLotSize < min_lot) normalizedLotSize = min_lot
  if (normalizedLotSize > max_lot) normalizedLotSize = max_lot

  // Ensure precision issue doesn't add random decimals like 0.01000000001
  normalizedLotSize = Number(normalizedLotSize.toFixed(2))

  // 4. Re-calculate actual risk based on the normalized lot size
  const actualRiskAmount = normalizedLotSize * valuePerLot

  return {
    lotSize: normalizedLotSize,
    riskAmount: Number(actualRiskAmount.toFixed(2)),
  }
}

/**
 * Calculate holding duration in minutes
 */
export function calculateHoldingTime(params: {
  entryTime: string
  exitTime: string | null
}): number | null {
  if (!params.exitTime) return null
  const entry = new Date(params.entryTime).getTime()
  const exit = new Date(params.exitTime).getTime()
  const minutes = (exit - entry) / (1000 * 60)
  return Number(minutes.toFixed(0))
}

// ─── Analytics Calculations ───────────────────────────────────────────────────

/**
 * Calculate win rate
 */
export function calculateWinRate(params: {
  winningTrades: number
  totalClosedTrades: number
}): number {
  if (params.totalClosedTrades === 0) return 0
  return Number(((params.winningTrades / params.totalClosedTrades) * 100).toFixed(2))
}

/**
 * Calculate profit factor: Gross Profit / Gross Loss
 * Handles zero-loss/zero-profit edge cases safely.
 */
export function calculateProfitFactor(params: {
  grossProfit: number
  grossLoss: number
}): number {
  const { grossProfit, grossLoss } = params
  if (grossLoss === 0 && grossProfit === 0) return 0
  if (grossLoss === 0) return Infinity
  return Number((grossProfit / Math.abs(grossLoss)).toFixed(2))
}

/**
 * Expectancy = (WinRate × AvgWin) − (LossRate × AvgLoss)
 */
export function calculateExpectancy(params: {
  winRate: number        // 0-100
  averageWin: number
  averageLoss: number   // positive value
}): number {
  const { winRate, averageWin, averageLoss } = params
  const winProb = winRate / 100
  const lossProb = 1 - winProb
  return Number(((winProb * averageWin) - (lossProb * averageLoss)).toFixed(2))
}

/**
 * Calculate average win (only profitable trades)
 */
export function calculateAverageWin(winningPnls: number[]): number {
  if (winningPnls.length === 0) return 0
  const total = winningPnls.reduce((sum, pnl) => sum + pnl, 0)
  return Number((total / winningPnls.length).toFixed(2))
}

/**
 * Calculate average loss (only losing trades — returns positive value)
 */
export function calculateAverageLoss(losingPnls: number[]): number {
  if (losingPnls.length === 0) return 0
  const total = losingPnls.reduce((sum, pnl) => sum + Math.abs(pnl), 0)
  return Number((total / losingPnls.length).toFixed(2))
}

/**
 * Calculate drawdown from an equity series (chronological order)
 */
export function calculateDrawdown(equitySeries: number[]): {
  drawdowns: number[]
  drawdownPercents: number[]
  maxDrawdown: number
  maxDrawdownPercent: number
  peakEquity: number
  currentDrawdown: number
  currentDrawdownPercent: number
} {
  if (equitySeries.length === 0) {
    return {
      drawdowns: [],
      drawdownPercents: [],
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      peakEquity: 0,
      currentDrawdown: 0,
      currentDrawdownPercent: 0,
    }
  }

  let peak = equitySeries[0]
  let maxDrawdown = 0
  let maxDrawdownPercent = 0
  const drawdowns: number[] = []
  const drawdownPercents: number[] = []

  for (const equity of equitySeries) {
    if (equity > peak) peak = equity
    const dd = peak - equity
    const ddPct = peak > 0 ? (dd / peak) * 100 : 0
    drawdowns.push(Number(dd.toFixed(2)))
    drawdownPercents.push(Number(ddPct.toFixed(2)))
    if (dd > maxDrawdown) {
      maxDrawdown = dd
      maxDrawdownPercent = ddPct
    }
  }

  const currentEquity = equitySeries[equitySeries.length - 1]
  const currentDrawdown = peak - currentEquity

  return {
    drawdowns,
    drawdownPercents,
    maxDrawdown: Number(maxDrawdown.toFixed(2)),
    maxDrawdownPercent: Number(maxDrawdownPercent.toFixed(2)),
    peakEquity: Number(peak.toFixed(2)),
    currentDrawdown: Number(currentDrawdown.toFixed(2)),
    currentDrawdownPercent: Number((peak > 0 ? (currentDrawdown / peak) * 100 : 0).toFixed(2)),
  }
}

/**
 * Calculate win/loss streaks
 */
export function calculateStreaks(results: Array<'win' | 'loss' | 'breakeven'>): {
  maxWinningStreak: number
  maxLosingStreak: number
  currentStreak: number
  currentStreakType: 'win' | 'loss' | 'none'
} {
  if (results.length === 0) {
    return { maxWinningStreak: 0, maxLosingStreak: 0, currentStreak: 0, currentStreakType: 'none' }
  }

  let maxWin = 0
  let maxLoss = 0
  let currentWin = 0
  let currentLoss = 0

  for (const r of results) {
    if (r === 'win') {
      currentWin++
      currentLoss = 0
      if (currentWin > maxWin) maxWin = currentWin
    } else if (r === 'loss') {
      currentLoss++
      currentWin = 0
      if (currentLoss > maxLoss) maxLoss = currentLoss
    } else {
      currentWin = 0
      currentLoss = 0
    }
  }

  const lastResult = results[results.length - 1]
  const currentStreak = lastResult === 'win' ? currentWin : lastResult === 'loss' ? currentLoss : 0
  const currentStreakType = lastResult === 'win' ? 'win' : lastResult === 'loss' ? 'loss' : 'none'

  return { maxWinningStreak: maxWin, maxLosingStreak: maxLoss, currentStreak, currentStreakType }
}

/**
 * Calculate comprehensive analytics from a list of closed trades
 */
export function calculateTradeAnalytics(trades: Pick<Trade,
  'net_pnl' | 'gross_pnl' | 'commission' | 'swap' | 'r_multiple' |
  'result' | 'risk_amount' | 'risk_percent' | 'holding_duration_minutes' | 'date'
>[]) {
  const closedTrades = trades.filter(t => t.result !== 'open')
  const totalTrades = closedTrades.length

  if (totalTrades === 0) {
    return {
      total_trades: 0,
      winning_trades: 0,
      losing_trades: 0,
      breakeven_trades: 0,
      win_rate: 0,
      total_net_pnl: 0,
      total_gross_pnl: 0,
      total_commissions: 0,
      total_swaps: 0,
      average_win: 0,
      average_loss: 0,
      profit_factor: 0,
      expectancy: 0,
      average_r_multiple: 0,
      max_r_multiple: 0,
      min_r_multiple: 0,
      max_drawdown: 0,
      max_drawdown_percent: 0,
      max_winning_streak: 0,
      max_losing_streak: 0,
      current_streak: 0,
      current_streak_type: 'none' as const,
      average_holding_time_minutes: 0,
      best_trade_pnl: 0,
      worst_trade_pnl: 0,
      winning_days: 0,
      losing_days: 0,
      total_risk_taken: 0,
      average_risk_percent: 0,
    }
  }

  const winningTrades = closedTrades.filter(t => t.result === 'win')
  const losingTrades = closedTrades.filter(t => t.result === 'loss')
  const breakevenTrades = closedTrades.filter(t => t.result === 'breakeven')

  const winningPnls = winningTrades.map(t => t.net_pnl ?? 0)
  const losingPnls = losingTrades.map(t => t.net_pnl ?? 0)

  const grossProfit = winningPnls.reduce((s, v) => s + v, 0)
  const grossLoss = losingPnls.reduce((s, v) => s + v, 0)
  const totalNetPnl = closedTrades.reduce((s, t) => s + (t.net_pnl ?? 0), 0)
  const totalGrossPnl = closedTrades.reduce((s, t) => s + (t.gross_pnl ?? 0), 0)
  const totalCommissions = closedTrades.reduce((s, t) => s + (t.commission ?? 0), 0)
  const totalSwaps = closedTrades.reduce((s, t) => s + (t.swap ?? 0), 0)

  const winRate = calculateWinRate({ winningTrades: winningTrades.length, totalClosedTrades: totalTrades })
  const avgWin = calculateAverageWin(winningPnls)
  const avgLoss = calculateAverageLoss(losingPnls)
  const profitFactor = calculateProfitFactor({ grossProfit, grossLoss })
  const expectancy = calculateExpectancy({ winRate, averageWin: avgWin, averageLoss: avgLoss })

  const rMultiples = closedTrades.map(t => t.r_multiple).filter((r): r is number => r !== null)
  const avgR = rMultiples.length > 0 ? rMultiples.reduce((s, r) => s + r, 0) / rMultiples.length : 0

  const holdingTimes = closedTrades.map(t => t.holding_duration_minutes).filter((h): h is number => h !== null)
  const avgHolding = holdingTimes.length > 0 ? holdingTimes.reduce((s, h) => s + h, 0) / holdingTimes.length : 0

  const results = closedTrades.map(t => t.result as 'win' | 'loss' | 'breakeven')
  const streaks = calculateStreaks(results)

  // Day-level grouping for winning/losing days
  const dayMap = new Map<string, number>()
  for (const t of closedTrades) {
    const date = t.date
    dayMap.set(date, (dayMap.get(date) ?? 0) + (t.net_pnl ?? 0))
  }
  const dayPnls = Array.from(dayMap.values())
  const winningDays = dayPnls.filter(p => p > 0).length
  const losingDays = dayPnls.filter(p => p < 0).length

  const netPnls = closedTrades.map(t => t.net_pnl ?? 0)
  const bestTrade = Math.max(...netPnls)
  const worstTrade = Math.min(...netPnls)

  const riskAmounts = closedTrades.map(t => t.risk_amount ?? 0).filter(r => r > 0)
  const totalRisk = riskAmounts.reduce((s, r) => s + r, 0)
  const riskPercents = closedTrades.map(t => t.risk_percent ?? 0).filter(r => r > 0)
  const avgRiskPercent = riskPercents.length > 0 ? riskPercents.reduce((s, r) => s + r, 0) / riskPercents.length : 0

  return {
    total_trades: totalTrades,
    winning_trades: winningTrades.length,
    losing_trades: losingTrades.length,
    breakeven_trades: breakevenTrades.length,
    win_rate: winRate,
    total_net_pnl: Number(totalNetPnl.toFixed(2)),
    total_gross_pnl: Number(totalGrossPnl.toFixed(2)),
    total_commissions: Number(totalCommissions.toFixed(2)),
    total_swaps: Number(totalSwaps.toFixed(2)),
    average_win: avgWin,
    average_loss: avgLoss,
    profit_factor: profitFactor,
    expectancy,
    average_r_multiple: Number(avgR.toFixed(2)),
    max_r_multiple: rMultiples.length > 0 ? Math.max(...rMultiples) : 0,
    min_r_multiple: rMultiples.length > 0 ? Math.min(...rMultiples) : 0,
    max_drawdown: 0,   // computed separately from equity series
    max_drawdown_percent: 0,
    max_winning_streak: streaks.maxWinningStreak,
    max_losing_streak: streaks.maxLosingStreak,
    current_streak: streaks.currentStreak,
    current_streak_type: streaks.currentStreakType,
    average_holding_time_minutes: Number(avgHolding.toFixed(0)),
    best_trade_pnl: bestTrade,
    worst_trade_pnl: worstTrade,
    winning_days: winningDays,
    losing_days: losingDays,
    total_risk_taken: Number(totalRisk.toFixed(2)),
    average_risk_percent: Number(avgRiskPercent.toFixed(2)),
  }
}

/**
 * Build equity curve data from chronological trades
 */
export function buildEquityCurve(params: {
  initialBalance: number
  trades: Array<{ net_pnl: number; date: string; exit_time: string | null }>
}): Array<{ date: string; balance: number; cumulative_pnl: number }> {
  const { initialBalance, trades } = params
  let balance = initialBalance
  const sorted = [...trades].sort((a, b) =>
    new Date(a.exit_time ?? a.date).getTime() - new Date(b.exit_time ?? b.date).getTime()
  )

  const points: Array<{ date: string; balance: number; cumulative_pnl: number }> = [
    { date: '', balance: initialBalance, cumulative_pnl: 0 }
  ]

  for (const trade of sorted) {
    balance += trade.net_pnl ?? 0
    points.push({
      date: trade.exit_time ?? trade.date,
      balance: Number(balance.toFixed(2)),
      cumulative_pnl: Number((balance - initialBalance).toFixed(2)),
    })
  }

  return points
}


/**
 * Detect potential revenge-trade patterns
 * Pattern: loss → short time gap → larger risk → new trade
 */
export function detectRevengeTrades(trades: Pick<Trade,
  'result' | 'entry_time' | 'risk_amount' | 'risk_percent'
>[], config = { maxMinuteGap: 30, riskMultiplier: 1.5 }): number[] {
  const suspectIndices: number[] = []
  for (let i = 1; i < trades.length; i++) {
    const prev = trades[i - 1]
    const curr = trades[i]
    if (prev.result !== 'loss') continue
    const gapMinutes = (new Date(curr.entry_time).getTime() - new Date(prev.entry_time).getTime()) / 60000
    if (gapMinutes > config.maxMinuteGap) continue
    const prevRisk = prev.risk_amount ?? prev.risk_percent ?? 0
    const currRisk = curr.risk_amount ?? curr.risk_percent ?? 0
    if (prevRisk > 0 && currRisk > prevRisk * config.riskMultiplier) {
      suspectIndices.push(i)
    }
  }
  return suspectIndices
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number, currency = 'USD', compact = false): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return formatter.format(value)
}

/**
 * Format R-multiple for display
 */
export function formatRMultiple(r: number | null): string {
  if (r === null) return '—'
  const sign = r >= 0 ? '+' : ''
  return `${sign}${r.toFixed(2)}R`
}

/**
 * Format holding time
 */
export function formatHoldingTime(minutes: number | null): string {
  if (minutes === null) return '—'
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}
