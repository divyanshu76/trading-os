package com.example.tradingos.data.calculations

import com.example.tradingos.data.model.InstrumentSpec
import com.example.tradingos.data.model.TradeEntity
import kotlin.math.abs
import kotlin.math.floor
import kotlin.math.max

object TradingCalculations {

    val DEFAULT_INSTRUMENTS = mapOf(
        "XAUUSD" to InstrumentSpec("XAUUSD", "Metals", 0.01, 1.0, 100.0, 2),
        "EURUSD" to InstrumentSpec("EURUSD", "Forex", 0.00001, 1.0, 100000.0, 5),
        "GBPUSD" to InstrumentSpec("GBPUSD", "Forex", 0.00001, 1.0, 100000.0, 5),
        "USDJPY" to InstrumentSpec("USDJPY", "Forex", 0.001, 1.0, 100000.0, 3),
        "NAS100" to InstrumentSpec("NAS100", "Indices", 0.01, 1.0, 1.0, 2),
        "US30"   to InstrumentSpec("US30", "Indices", 0.01, 1.0, 1.0, 2),
        "SP500"  to InstrumentSpec("SP500", "Indices", 0.01, 1.0, 1.0, 2),
        "BTCUSD" to InstrumentSpec("BTCUSD", "Crypto", 0.01, 1.0, 1.0, 2),
        "ETHUSD" to InstrumentSpec("ETHUSD", "Crypto", 0.01, 1.0, 1.0, 2)
    )

    fun getInstrument(symbol: String): InstrumentSpec {
        return DEFAULT_INSTRUMENTS[symbol.uppercase()]
            ?: InstrumentSpec(symbol.uppercase(), "Forex", 0.00001, 1.0, 100000.0, 5)
    }

    fun calculatePnl(
        direction: String,
        entryPrice: Double,
        exitPrice: Double,
        lotSize: Double,
        instrument: InstrumentSpec
    ): Pair<Double, Double> {
        val priceDiff = if (direction.equals("LONG", ignoreCase = true)) {
            exitPrice - entryPrice
        } else {
            entryPrice - exitPrice
        }

        val ticks = priceDiff / instrument.tickSize
        val grossPnl = ticks * instrument.tickValue * lotSize
        val pips = priceDiff / (instrument.tickSize * 10)

        return Pair(
            (grossPnl * 100).toLong() / 100.0,
            (pips * 10).toLong() / 10.0
        )
    }

    fun calculateNetPnl(grossPnl: Double, commission: Double, swap: Double): Double {
        val net = grossPnl - commission - swap
        return (net * 100).toLong() / 100.0
    }

    fun calculateRMultiple(netPnl: Double, riskAmount: Double): Double? {
        if (riskAmount <= 0.0) return null
        val r = netPnl / riskAmount
        return (r * 100).toLong() / 100.0
    }

    fun calculateLotSize(
        accountBalance: Double,
        riskPercent: Double,
        direction: String,
        entryPrice: Double,
        stopLoss: Double,
        instrument: InstrumentSpec
    ): Pair<Double, Double> {
        val initialRiskAmount = (accountBalance * riskPercent) / 100.0
        val slDistance = if (direction.equals("LONG", ignoreCase = true)) {
            entryPrice - stopLoss
        } else {
            stopLoss - entryPrice
        }

        if (slDistance <= 0.0 || instrument.tickSize <= 0.0) {
            return Pair(0.01, 0.0)
        }

        val ticksAtRisk = slDistance / instrument.tickSize
        val valuePerLot = ticksAtRisk * instrument.tickValue
        if (valuePerLot <= 0.0) return Pair(0.01, 0.0)

        val rawLotSize = initialRiskAmount / valuePerLot
        val lotStep = 0.01
        var normalizedLot = floor(rawLotSize / lotStep) * lotStep
        if (normalizedLot < 0.01) normalizedLot = 0.01
        if (normalizedLot > 100.0) normalizedLot = 100.0

        normalizedLot = (normalizedLot * 100).toLong() / 100.0
        val actualRisk = normalizedLot * valuePerLot

        return Pair(normalizedLot, (actualRisk * 100).toLong() / 100.0)
    }

    data class AnalyticsSummary(
        val totalTrades: Int,
        val winningTrades: Int,
        val losingTrades: Int,
        val breakevenTrades: Int,
        val winRate: Double,
        val totalNetPnl: Double,
        val profitFactor: Double,
        val averageWin: Double,
        val averageLoss: Double,
        val expectancy: Double,
        val maxDrawdown: Double,
        val maxDrawdownPercent: Double,
        val maxWinningStreak: Int,
        val maxLosingStreak: Int,
        val currentStreak: Int,
        val currentStreakType: String
    )

    fun computeAnalytics(trades: List<TradeEntity>): AnalyticsSummary {
        val closedTrades = trades.filter { it.result != "OPEN" }
        if (closedTrades.isEmpty()) {
            return AnalyticsSummary(
                0, 0, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0, 0, 0, "NONE"
            )
        }

        val wins = closedTrades.filter { it.netPnl > 0.0 }
        val losses = closedTrades.filter { it.netPnl < 0.0 }
        val be = closedTrades.filter { it.netPnl == 0.0 }

        val totalNetPnl = closedTrades.sumOf { it.netPnl }
        val grossProfit = wins.sumOf { it.netPnl }
        val grossLoss = losses.sumOf { abs(it.netPnl) }

        val winRate = if (closedTrades.isNotEmpty()) {
            (wins.size.toDouble() / closedTrades.size.toDouble()) * 100.0
        } else 0.0

        val profitFactor = when {
            grossLoss == 0.0 && grossProfit > 0.0 -> 99.99
            grossLoss == 0.0 -> 0.0
            else -> grossProfit / grossLoss
        }

        val avgWin = if (wins.isNotEmpty()) grossProfit / wins.size else 0.0
        val avgLoss = if (losses.isNotEmpty()) grossLoss / losses.size else 0.0

        val winProb = winRate / 100.0
        val lossProb = 1.0 - winProb
        val expectancy = (winProb * avgWin) - (lossProb * avgLoss)

        // Drawdown computation
        var runningEquity = 0.0
        var peak = 0.0
        var maxDd = 0.0
        for (trade in closedTrades.reversed()) { // chronological
            runningEquity += trade.netPnl
            if (runningEquity > peak) peak = runningEquity
            val dd = peak - runningEquity
            if (dd > maxDd) maxDd = dd
        }
        val maxDdPct = if (peak > 0.0) (maxDd / peak) * 100.0 else 0.0

        // Streaks
        var maxWinStreak = 0
        var maxLossStreak = 0
        var currentWinStreak = 0
        var currentLossStreak = 0

        for (trade in closedTrades.reversed()) {
            if (trade.netPnl > 0) {
                currentWinStreak++
                currentLossStreak = 0
                maxWinStreak = max(maxWinStreak, currentWinStreak)
            } else if (trade.netPnl < 0) {
                currentLossStreak++
                currentWinStreak = 0
                maxLossStreak = max(maxLossStreak, currentLossStreak)
            } else {
                currentWinStreak = 0
                currentLossStreak = 0
            }
        }

        val lastTrade = closedTrades.firstOrNull()
        val (currStreak, currType) = when {
            lastTrade == null -> Pair(0, "NONE")
            lastTrade.netPnl > 0 -> Pair(currentWinStreak, "WIN")
            lastTrade.netPnl < 0 -> Pair(currentLossStreak, "LOSS")
            else -> Pair(0, "BREAKEVEN")
        }

        return AnalyticsSummary(
            totalTrades = closedTrades.size,
            winningTrades = wins.size,
            losingTrades = losses.size,
            breakevenTrades = be.size,
            winRate = (winRate * 10).toLong() / 10.0,
            totalNetPnl = (totalNetPnl * 100).toLong() / 100.0,
            profitFactor = (profitFactor * 100).toLong() / 100.0,
            averageWin = (avgWin * 100).toLong() / 100.0,
            averageLoss = (avgLoss * 100).toLong() / 100.0,
            expectancy = (expectancy * 100).toLong() / 100.0,
            maxDrawdown = (maxDd * 100).toLong() / 100.0,
            maxDrawdownPercent = (maxDdPct * 10).toLong() / 10.0,
            maxWinningStreak = maxWinStreak,
            maxLosingStreak = maxLossStreak,
            currentStreak = currStreak,
            currentStreakType = currType
        )
    }
}
