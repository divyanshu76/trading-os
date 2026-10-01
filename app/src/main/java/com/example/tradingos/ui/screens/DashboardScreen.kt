package com.example.tradingos.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.tradingos.data.calculations.TradingCalculations
import com.example.tradingos.data.model.AccountEntity
import com.example.tradingos.data.model.TradeEntity
import com.example.tradingos.ui.components.EquityCurveChart
import com.example.tradingos.ui.components.MetricCard
import com.example.tradingos.ui.components.TradeCardItem
import com.example.tradingos.ui.theme.*
import java.util.Locale

@Composable
fun DashboardScreen(
    trades: List<TradeEntity>,
    accounts: List<AccountEntity>,
    analytics: TradingCalculations.AnalyticsSummary,
    onAddTradeClick: () -> Unit,
    onCalculatorClick: () -> Unit,
    onPropFirmsClick: () -> Unit,
    onDeleteTrade: (Long) -> Unit,
    modifier: Modifier = Modifier
) {
    val primaryAccount = accounts.firstOrNull { it.isDefault } ?: accounts.firstOrNull()
    val totalRealizedPnl = trades.sumOf { it.netPnl }
    val currentBalance = (primaryAccount?.initialBalance ?: 10000.0) + totalRealizedPnl

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(OceanBackground)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 80.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Account Banner Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, OceanBorder, RoundedCornerShape(20.dp)),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = OceanSurface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = primaryAccount?.name ?: "Primary Live Account",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Authoritative Balance",
                                style = MaterialTheme.typography.bodyMedium,
                                color = CharcoalMuted
                            )
                        }
                        Box(
                            modifier = Modifier
                                .background(OceanSurfaceVariant, RoundedCornerShape(8.dp))
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = primaryAccount?.currency ?: "USD",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = OceanPrimary
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "$" + String.format(Locale.US, "%,.2f", currentBalance),
                        style = MaterialTheme.typography.headlineLarge.copy(
                            fontSize = 32.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = CharcoalDark
                        )
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        val isPositive = totalRealizedPnl >= 0
                        val pnlText = (if (isPositive) "+$" else "-$") + String.format(Locale.US, "%,.2f", kotlin.math.abs(totalRealizedPnl))
                        Text(
                            text = pnlText,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = if (isPositive) ProfitGreen else LossRed
                        )
                        Text(
                            text = "all-time net P&L",
                            style = MaterialTheme.typography.bodyMedium,
                            color = CharcoalMuted
                        )
                    }
                }
            }
        }

        // Quick Actions
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = onAddTradeClick,
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp)
                        .testTag("dashboard_add_trade_btn"),
                    colors = ButtonDefaults.buttonColors(containerColor = OceanPrimary),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Log Trade", fontWeight = FontWeight.Bold)
                }

                OutlinedButton(
                    onClick = onCalculatorClick,
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp)
                        .testTag("dashboard_calculator_btn"),
                    border = ButtonDefaults.outlinedButtonBorder.copy(brush = androidx.compose.ui.graphics.SolidColor(OceanBorder)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Calculate, contentDescription = null, modifier = Modifier.size(18.dp), tint = OceanPrimary)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Calculator", color = CharcoalDark, fontWeight = FontWeight.Bold)
                }

                OutlinedButton(
                    onClick = onPropFirmsClick,
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp)
                        .testTag("dashboard_prop_btn"),
                    border = ButtonDefaults.outlinedButtonBorder.copy(brush = androidx.compose.ui.graphics.SolidColor(OceanBorder)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Shield, contentDescription = null, modifier = Modifier.size(18.dp), tint = OceanPrimary)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Prop Firms", color = CharcoalDark, fontWeight = FontWeight.Bold)
                }
            }
        }

        // 4 KPI Cards Grid
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    MetricCard(
                        title = "Win Rate",
                        value = "${analytics.winRate}%",
                        subtitle = "${analytics.winningTrades}W / ${analytics.losingTrades}L",
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        title = "Profit Factor",
                        value = String.format(Locale.US, "%.2f", analytics.profitFactor),
                        subtitle = "Gross P / Gross L",
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
                        subtitle = "Per trade expectation",
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

        // Equity Curve Chart
        item {
            EquityCurveChart(trades = trades)
        }

        // Recent Trades Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "RECENT TRADES",
                    style = MaterialTheme.typography.labelSmall,
                    color = CharcoalMuted,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "${trades.size} total trades",
                    style = MaterialTheme.typography.labelSmall,
                    color = CharcoalLight
                )
            }
        }

        // Trades List (last 5)
        if (trades.isEmpty()) {
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = OceanSurface)
                ) {
                    Box(modifier = Modifier.padding(24.dp), contentAlignment = Alignment.Center) {
                        Text("No trades logged yet. Tap 'Log Trade' to add one!", color = CharcoalMuted)
                    }
                }
            }
        } else {
            items(trades.take(6), key = { it.id }) { trade ->
                TradeCardItem(trade = trade, onDelete = { onDeleteTrade(trade.id) })
            }
        }
    }
}
