package com.example.tradingos.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.tradingos.data.model.TradeEntity
import com.example.tradingos.ui.theme.*
import java.util.Locale

@Composable
fun CalendarScreen(
    trades: List<TradeEntity>,
    modifier: Modifier = Modifier
) {
    val tradesByDay = trades.groupBy { it.date }.toSortedMap(compareByDescending { it })

    val winningDays = tradesByDay.count { entry -> entry.value.sumOf { it.netPnl } > 0 }
    val losingDays = tradesByDay.count { entry -> entry.value.sumOf { it.netPnl } < 0 }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(OceanBackground)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 88.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text("Trade Calendar", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Text("Daily performance and consistency tracker", style = MaterialTheme.typography.bodyMedium, color = CharcoalMuted)
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Card(
                    modifier = Modifier.weight(1f).border(1.dp, OceanBorder, RoundedCornerShape(16.dp)),
                    colors = CardDefaults.cardColors(containerColor = OceanSurface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("WINNING DAYS", style = MaterialTheme.typography.labelSmall, color = CharcoalMuted, fontWeight = FontWeight.Bold)
                        Text("$winningDays Days", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = ProfitGreen)
                    }
                }
                Card(
                    modifier = Modifier.weight(1f).border(1.dp, OceanBorder, RoundedCornerShape(16.dp)),
                    colors = CardDefaults.cardColors(containerColor = OceanSurface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("LOSING DAYS", style = MaterialTheme.typography.labelSmall, color = CharcoalMuted, fontWeight = FontWeight.Bold)
                        Text("$losingDays Days", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = LossRed)
                    }
                }
            }
        }

        if (tradesByDay.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth().padding(top = 30.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = OceanSurface)
                ) {
                    Box(modifier = Modifier.padding(32.dp), contentAlignment = Alignment.Center) {
                        Text("No trading days logged yet", color = CharcoalMuted)
                    }
                }
            }
        } else {
            items(tradesByDay.entries.toList(), key = { it.key }) { (day, dayTrades) ->
                val dayNet = dayTrades.sumOf { it.netPnl }
                val isProfit = dayNet >= 0
                val dayPnlText = (if (isProfit) "+$" else "-$") + String.format(Locale.US, "%,.2f", kotlin.math.abs(dayNet))

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, OceanBorder, RoundedCornerShape(16.dp)),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = OceanSurface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(text = day, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                                Text(text = "${dayTrades.size} trades", style = MaterialTheme.typography.labelSmall, color = CharcoalMuted)
                            }
                            Text(
                                text = dayPnlText,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = if (isProfit) ProfitGreen else LossRed
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        dayTrades.forEach { t ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "${t.symbol} (${t.direction})",
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.SemiBold
                                )
                                val pText = (if (t.netPnl >= 0) "+$" else "-$") + String.format(Locale.US, "%.2f", kotlin.math.abs(t.netPnl))
                                Text(
                                    text = pText,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = if (t.netPnl >= 0) ProfitGreen else LossRed,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
