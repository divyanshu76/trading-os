package com.example.tradingos.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.tradingos.data.model.RiskSettingsEntity
import com.example.tradingos.data.model.TradeEntity
import com.example.tradingos.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.abs

@Composable
fun RiskManagerScreen(
    trades: List<TradeEntity>,
    riskSettings: RiskSettingsEntity?,
    modifier: Modifier = Modifier
) {
    val settings = riskSettings ?: RiskSettingsEntity()
    val today = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
    val todayTrades = trades.filter { it.date == today && it.result != "OPEN" }

    val todayLoss = todayTrades.filter { it.netPnl < 0 }.sumOf { abs(it.netPnl) }
    val maxDailyLoss = settings.maxDailyLossAmount

    val status = when {
        todayLoss >= maxDailyLoss -> "BREACHED"
        todayLoss >= maxDailyLoss * 0.7 -> "WARNING"
        else -> "SAFE"
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(OceanBackground)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 88.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text("Risk Manager", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Text("Capital preservation & discipline enforcement", style = MaterialTheme.typography.bodyMedium, color = CharcoalMuted)
        }

        // Status Card
        item {
            val (statusBg, statusFg, icon) = when (status) {
                "BREACHED" -> Triple(LossRedBg, LossRed, Icons.Default.Warning)
                "WARNING" -> Triple(WarningAmberBg, WarningAmber, Icons.Default.Warning)
                else -> Triple(ProfitGreenBg, ProfitGreen, Icons.Default.CheckCircle)
            }

            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, statusFg.copy(alpha = 0.3f), RoundedCornerShape(18.dp)),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = statusBg)
            ) {
                Row(
                    modifier = Modifier.padding(20.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Icon(icon, contentDescription = null, tint = statusFg, modifier = Modifier.size(32.dp))
                    Column {
                        Text(
                            text = "STATUS: $status",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = statusFg
                        )
                        Text(
                            text = when (status) {
                                "BREACHED" -> "Daily loss limit exceeded! Trading halted for today."
                                "WARNING" -> "Approaching daily loss limit. Reduce position size."
                                else -> "All risk rules intact. Trading allowed within parameters."
                            },
                            style = MaterialTheme.typography.bodyMedium,
                            color = CharcoalDark
                        )
                    }
                }
            }
        }

        // Daily Loss Limit Progress
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, OceanBorder, RoundedCornerShape(16.dp)),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = OceanSurface)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("TODAY'S LOSS / LIMIT", style = MaterialTheme.typography.labelSmall, color = CharcoalMuted, fontWeight = FontWeight.Bold)
                        Text(
                            text = "$" + String.format(Locale.US, "%.2f", todayLoss) + " / $" + String.format(Locale.US, "%.2f", maxDailyLoss),
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = if (status == "BREACHED") LossRed else CharcoalDark
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    val progress = (todayLoss / maxDailyLoss).toFloat().coerceIn(0f, 1f)
                    LinearProgressIndicator(
                        progress = { progress },
                        modifier = Modifier.fillMaxWidth().height(10.dp).clip(RoundedCornerShape(5.dp)),
                        color = if (progress >= 1f) LossRed else if (progress >= 0.7f) WarningAmber else ProfitGreen,
                        trackColor = OceanSurfaceVariant
                    )
                }
            }
        }

        // Active Rules Checklist
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, OceanBorder, RoundedCornerShape(16.dp)),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = OceanSurface)
            ) {
                Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    Text("ACTIVE RISK RULES", style = MaterialTheme.typography.labelSmall, color = CharcoalMuted, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)

                    RuleItem("Default Risk Per Trade", "${settings.defaultRiskPercent}% of balance")
                    RuleItem("Max Daily Loss Limit", "$${settings.maxDailyLossAmount} (${settings.maxDailyLossPercent}%)")
                    RuleItem("Max Open Positions", "2 concurrent positions")
                    RuleItem("Max Trades Per Day", "${settings.maxTradesPerDay} trades (${todayTrades.size} taken today)")
                    RuleItem("Max Portfolio Drawdown", "${settings.maxDrawdownPercent}% trailing")
                }
            }
        }
    }
}

@Composable
fun RuleItem(title: String, desc: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(title, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.SemiBold)
            Text(desc, style = MaterialTheme.typography.bodyMedium, color = CharcoalMuted)
        }
        Icon(Icons.Default.Shield, contentDescription = null, tint = OceanPrimary, modifier = Modifier.size(20.dp))
    }
}
