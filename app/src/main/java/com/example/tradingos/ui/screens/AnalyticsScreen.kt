package com.example.tradingos.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.tradingos.data.calculations.TradingCalculations
import com.example.tradingos.data.model.TradeEntity
import com.example.tradingos.ui.components.EquityCurveChart
import com.example.tradingos.ui.components.MetricCard
import com.example.tradingos.ui.theme.*
import java.util.Locale

@Composable
fun AnalyticsScreen(
    trades: List<TradeEntity>,
    analytics: TradingCalculations.AnalyticsSummary,
    modifier: Modifier = Modifier
) {
    val longTrades = trades.filter { it.direction.equals("LONG", ignoreCase = true) }
    val shortTrades = trades.filter { it.direction.equals("SHORT", ignoreCase = true) }

    val longWinRate = if (longTrades.isNotEmpty()) {
        (longTrades.count { it.netPnl > 0 }.toDouble() / longTrades.size.toDouble()) * 100.0
    } else 0.0

    val shortWinRate = if (shortTrades.isNotEmpty()) {
        (shortTrades.count { it.netPnl > 0 }.toDouble() / shortTrades.size.toDouble()) * 100.0
    } else 0.0

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(OceanBackground)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 88.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Performance Analytics",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Mathematical edge, expectancy & drawdown",
                style = MaterialTheme.typography.bodyMedium,
                color = CharcoalMuted
            )
        }

        // Equity Chart
        item {
            EquityCurveChart(trades = trades)
        }

        // Core Matrix
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    MetricCard(
                        title = "Win Rate",
                        value = "${analytics.winRate}%",
                        subtitle = "${analytics.winningTrades} wins / ${analytics.losingTrades} losses",
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        title = "Profit Factor",
                        value = String.format(Locale.US, "%.2f", analytics.profitFactor),
                        subtitle = "Gross profit / loss",
                        modifier = Modifier.weight(1f)
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    MetricCard(
                        title = "Avg Win",
                        value = "+$" + String.format(Locale.US, "%.2f", analytics.averageWin),
                        isProfit = true,
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        title = "Avg Loss",
                        value = "-$" + String.format(Locale.US, "%.2f", analytics.averageLoss),
                        isProfit = false,
                        modifier = Modifier.weight(1f)
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    MetricCard(
                        title = "Expectancy",
                        value = (if (analytics.expectancy >= 0) "+$" else "-$") + String.format(Locale.US, "%.2f", kotlin.math.abs(analytics.expectancy)),
                        subtitle = "Edge per trade",
                        isProfit = analytics.expectancy >= 0,
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        title = "Max Drawdown",
                        value = "${analytics.maxDrawdownPercent}%",
                        subtitle = "$" + String.format(Locale.US, "%.2f", analytics.maxDrawdown),
                        isProfit = false,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // Streaks Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, OceanBorder, RoundedCornerShape(16.dp)),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = OceanSurface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "STREAK ANALYSIS",
                        style = MaterialTheme.typography.labelSmall,
                        color = CharcoalMuted,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Best Win Streak", style = MaterialTheme.typography.bodyMedium, color = CharcoalMuted)
                            Text("${analytics.maxWinningStreak} trades", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = ProfitGreen)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Max Loss Streak", style = MaterialTheme.typography.bodyMedium, color = CharcoalMuted)
                            Text("${analytics.maxLosingStreak} trades", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = LossRed)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Current Streak", style = MaterialTheme.typography.bodyMedium, color = CharcoalMuted)
                            val streakColor = if (analytics.currentStreakType == "WIN") ProfitGreen else LossRed
                            Text("${analytics.currentStreak} (${analytics.currentStreakType})", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = streakColor)
                        }
                    }
                }
            }
        }

        // Direction Breakdown
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, OceanBorder, RoundedCornerShape(16.dp)),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = OceanSurface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "DIRECTIONAL PERFORMANCE",
                        style = MaterialTheme.typography.labelSmall,
                        color = CharcoalMuted,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(14.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Long Trades (${longTrades.size})", style = MaterialTheme.typography.bodyMedium)
                        Text(String.format(Locale.US, "%.1f%% win rate", longWinRate), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    }
                    LinearProgressIndicator(
                        progress = { (longWinRate / 100.0).toFloat() },
                        modifier = Modifier.fillMaxWidth().height(8.dp).padding(vertical = 2.dp),
                        color = ProfitGreen,
                        trackColor = OceanSurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Short Trades (${shortTrades.size})", style = MaterialTheme.typography.bodyMedium)
                        Text(String.format(Locale.US, "%.1f%% win rate", shortWinRate), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    }
                    LinearProgressIndicator(
                        progress = { (shortWinRate / 100.0).toFloat() },
                        modifier = Modifier.fillMaxWidth().height(8.dp).padding(vertical = 2.dp),
                        color = LossRed,
                        trackColor = OceanSurfaceVariant
                    )
                }
            }
        }
    }
}
