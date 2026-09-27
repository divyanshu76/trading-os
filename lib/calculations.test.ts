import { describe, it, expect } from 'vitest'
import { calculateLotSize, DEFAULT_INSTRUMENTS } from './calculations/index'

describe('calculateLotSize', () => {
  it('correctly calculates and normalizes lot size for XAUUSD', () => {
    // 100,000 account, 1% risk = 1000 risk
    // Entry 1900.00, SL 1890.00 => $10 distance
    // tick_size 0.01, tick_value 1, contract_size 100
    // SL ticks = 10 / 0.01 = 1000 ticks
    // Value per lot = 1000 * 1 = 1000
    // Raw lot = 1000 / 1000 = 1.00
    
    const result = calculateLotSize({
      accountBalance: 100000,
      riskPercent: 1,
      direction: 'long',
      entryPrice: 1900.00,
      stopLoss: 1890.00,
      instrument: DEFAULT_INSTRUMENTS['XAUUSD'] as any
    })
    
    expect(result.lotSize).toBe(1.00)
    expect(result.riskAmount).toBe(1000.00)
  })

  it('correctly calculates lot size for XAGUSD and respects min_lot', () => {
    // 100,000 account, 1% risk = 1000 risk
    // Entry 24.500, SL 24.000 => 0.5 distance
    // tick_size 0.001, tick_value 1
    // SL ticks = 0.5 / 0.001 = 500 ticks
    // Value per lot = 500 * 1 = 500
    // Raw lot = 1000 / 500 = 2.00
    
    const result = calculateLotSize({
      accountBalance: 100000,
      riskPercent: 1,
      direction: 'long',
      entryPrice: 24.500,
      stopLoss: 24.000,
      instrument: DEFAULT_INSTRUMENTS['XAGUSD'] as any
    })
    
    expect(result.lotSize).toBe(2.00)
    expect(result.riskAmount).toBe(1000.00)
  })

  it('rounds down based on lot_step and recalculates risk amount', () => {
    // 100,000 account, 1% risk = 1000 risk
    // SL ticks = 1200 ticks. value per lot = 1200
    // raw lot = 1000 / 1200 = 0.833333...
    // lot_step 0.01 => normalizes to 0.83
    // actual risk = 0.83 * 1200 = 996
    
    const result = calculateLotSize({
      accountBalance: 100000,
      riskPercent: 1,
      direction: 'long',
      entryPrice: 1900.00,
      stopLoss: 1888.00,
      instrument: DEFAULT_INSTRUMENTS['XAUUSD'] as any
    })
    
    expect(result.lotSize).toBe(0.83)
    expect(result.riskAmount).toBe(996.00) // 0.83 * 1200 ticks * 1 value = 996
  })

  it('clamps to max_lot and recalculates actual risk', () => {
    // $10M account, 1% risk = 100,000 risk
    // $10 distance on XAUUSD = 1000 ticks = $1000 value per lot
    // raw lot = 100,000 / 1000 = 100 lots.
    // Let's use 2% risk = 200,000 risk -> raw 200 lots.
    // max_lot = 100
    // actual risk = 100 * 1000 = 100,000
    
    const result = calculateLotSize({
      accountBalance: 10000000,
      riskPercent: 2,
      direction: 'long',
      entryPrice: 1900.00,
      stopLoss: 1890.00,
      instrument: DEFAULT_INSTRUMENTS['XAUUSD'] as any
    })
    
    expect(result.lotSize).toBe(100)
    expect(result.riskAmount).toBe(100000)
  })
})
