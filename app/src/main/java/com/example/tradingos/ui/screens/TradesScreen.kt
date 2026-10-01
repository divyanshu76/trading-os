package com.example.tradingos.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.example.tradingos.data.calculations.TradingCalculations
import com.example.tradingos.data.model.TradeEntity
import com.example.tradingos.ui.components.TradeCardItem
import com.example.tradingos.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun TradesScreen(
    trades: List<TradeEntity>,
    onSaveTrade: (TradeEntity) -> Unit,
    onDeleteTrade: (Long) -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedFilter by remember { mutableStateOf("ALL") }
    var showAddDialog by remember { mutableStateOf(false) }

    val filteredTrades = remember(trades, selectedFilter) {
        when (selectedFilter) {
            "WINS" -> trades.filter { it.netPnl > 0 }
            "LOSSES" -> trades.filter { it.netPnl < 0 }
            "BREAKEVEN" -> trades.filter { it.netPnl == 0.0 }
            else -> trades
        }
    }

    Box(modifier = modifier.fillMaxSize().background(OceanBackground)) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(top = 16.dp, bottom = 88.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Trade Journal",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "${filteredTrades.size} of ${trades.size}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = CharcoalMuted
                    )
                }
            }

            // Filter Chips
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    val filters = listOf("ALL" to "All Trades", "WINS" to "Wins", "LOSSES" to "Losses", "BREAKEVEN" to "Breakeven")
                    items(filters) { (key, label) ->
                        val isSelected = selectedFilter == key
                        FilterChip(
                            selected = isSelected,
                            onClick = { selectedFilter = key },
                            label = { Text(label, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = OceanPrimary,
                                selectedLabelColor = OceanSurface,
                                containerColor = OceanSurface
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                enabled = true,
                                selected = isSelected,
                                borderColor = if (isSelected) OceanPrimary else OceanBorder
                            )
                        )
                    }
                }
            }

            if (filteredTrades.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 40.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = OceanSurface)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(32.dp),
                            horizontalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.FilterList, contentDescription = null, tint = CharcoalLight, modifier = Modifier.size(36.dp))
                            Spacer(modifier = Modifier.height(12.dp))
                            Text("No trades match this filter", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Log a new trade using the + button below", style = MaterialTheme.typography.bodyMedium, color = CharcoalMuted)
                        }
                    }
                }
            } else {
                items(filteredTrades, key = { it.id }) { trade ->
                    TradeCardItem(trade = trade, onDelete = { onDeleteTrade(trade.id) })
                }
            }
        }

        // Floating Action Button
        FloatingActionButton(
            onClick = { showAddDialog = true },
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(end = 20.dp, bottom = 90.dp)
                .testTag("trades_fab_add"),
            containerColor = OceanPrimary,
            contentColor = OceanSurface,
            shape = RoundedCornerShape(16.dp)
        ) {
            Icon(Icons.Default.Add, contentDescription = "Add Trade")
        }

        if (showAddDialog) {
            AddEditTradeDialog(
                onDismiss = { showAddDialog = false },
                onSave = {
                    onSaveTrade(it)
                    showAddDialog = false
                }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddEditTradeDialog(
    onDismiss: () -> Unit,
    onSave: (TradeEntity) -> Unit
) {
    var symbol by remember { mutableStateOf("XAUUSD") }
    var direction by remember { mutableStateOf("LONG") }
    var lotSizeText by remember { mutableStateOf("1.0") }
    var entryPriceText by remember { mutableStateOf("2650.0") }
    var exitPriceText by remember { mutableStateOf("2665.0") }
    var stopLossText by remember { mutableStateOf("2640.0") }
    var takeProfitText by remember { mutableStateOf("2670.0") }
    var session by remember { mutableStateOf("London") }
    var notes by remember { mutableStateOf("") }
    var emotion by remember { mutableStateOf("Confident") }

    val lotSize = lotSizeText.toDoubleOrNull() ?: 1.0
    val entryPrice = entryPriceText.toDoubleOrNull() ?: 0.0
    val exitPrice = exitPriceText.toDoubleOrNull() ?: 0.0
    val stopLoss = stopLossText.toDoubleOrNull()
    val instrument = TradingCalculations.getInstrument(symbol)

    val (grossPnl, _) = remember(direction, entryPrice, exitPrice, lotSize, instrument) {
        if (entryPrice > 0 && exitPrice > 0) {
            TradingCalculations.calculatePnl(direction, entryPrice, exitPrice, lotSize, instrument)
        } else Pair(0.0, 0.0)
    }
    val netPnl = remember(grossPnl) { TradingCalculations.calculateNetPnl(grossPnl, 10.0, 0.0) }

    val rMultiple = remember(netPnl, entryPrice, stopLoss, direction, lotSize, instrument) {
        if (stopLoss != null && stopLoss > 0 && entryPrice > 0) {
            val slDist = if (direction == "LONG") entryPrice - stopLoss else stopLoss - entryPrice
            if (slDist > 0) {
                val riskCash = (slDist / instrument.tickSize) * instrument.tickValue * lotSize
                TradingCalculations.calculateRMultiple(netPnl, riskCash)
            } else null
        } else null
    }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.9f),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = OceanSurface)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(20.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("New Trade Entry", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Symbol selector
                    item {
                        Text("Instrument", style = MaterialTheme.typography.labelSmall, color = CharcoalMuted)
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            val symbols = listOf("XAUUSD", "EURUSD", "GBPUSD", "USDJPY", "NAS100", "US30", "BTCUSD")
                            items(symbols) { s ->
                                FilterChip(
                                    selected = symbol == s,
                                    onClick = { symbol = s },
                                    label = { Text(s, style = MaterialTheme.typography.labelSmall) }
                                )
                            }
                        }
                    }

                    // Direction selector
                    item {
                        Text("Direction", style = MaterialTheme.typography.labelSmall, color = CharcoalMuted)
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Button(
                                onClick = { direction = "LONG" },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (direction == "LONG") ProfitGreen else OceanSurfaceVariant,
                                    contentColor = if (direction == "LONG") OceanSurface else CharcoalDark
                                )
                            ) {
                                Text("LONG / BUY", fontWeight = FontWeight.Bold)
                            }
                            Button(
                                onClick = { direction = "SHORT" },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (direction == "SHORT") LossRed else OceanSurfaceVariant,
                                    contentColor = if (direction == "SHORT") OceanSurface else CharcoalDark
                                )
                            ) {
                                Text("SHORT / SELL", fontWeight = FontWeight.Bold)
                            }
                        }
                    }

                    // Lot Size & Entry Price
                    item {
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            OutlinedTextField(
                                value = lotSizeText,
                                onValueChange = { lotSizeText = it },
                                label = { Text("Lot Size") },
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = entryPriceText,
                                onValueChange = { entryPriceText = it },
                                label = { Text("Entry Price") },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    // Exit Price & Stop Loss
                    item {
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            OutlinedTextField(
                                value = exitPriceText,
                                onValueChange = { exitPriceText = it },
                                label = { Text("Exit Price") },
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = stopLossText,
                                onValueChange = { stopLossText = it },
                                label = { Text("Stop Loss") },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    // Live PnL Preview
                    item {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = OceanSurfaceVariant),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Row(
                                modifier = Modifier
                                    .padding(12.dp)
                                    .fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text("Estimated Net P&L", style = MaterialTheme.typography.labelSmall, color = CharcoalMuted)
                                    Text(
                                        text = (if (netPnl >= 0) "+$" else "-$") + String.format(Locale.US, "%.2f", kotlin.math.abs(netPnl)),
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = if (netPnl >= 0) ProfitGreen else LossRed
                                    )
                                }
                                rMultiple?.let { r ->
                                    Column(horizontalAlignment = Alignment.End) {
                                        Text("R-Multiple", style = MaterialTheme.typography.labelSmall, color = CharcoalMuted)
                                        Text("${if (r > 0) "+" else ""}${r}R", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = OceanPrimary)
                                    }
                                }
                            }
                        }
                    }

                    // Session
                    item {
                        Text("Session", style = MaterialTheme.typography.labelSmall, color = CharcoalMuted)
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            val sessions = listOf("London", "New York", "Asia", "London/NY Overlap")
                            items(sessions) { s ->
                                FilterChip(
                                    selected = session == s,
                                    onClick = { session = s },
                                    label = { Text(s, style = MaterialTheme.typography.labelSmall) }
                                )
                            }
                        }
                    }

                    // Notes
                    item {
                        OutlinedTextField(
                            value = notes,
                            onValueChange = { notes = it },
                            label = { Text("Trade Reason / Notes") },
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 2
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Button(
                    onClick = {
                        val currentDate = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
                        val currentTime = SimpleDateFormat("HH:mm", Locale.US).format(Date())
                        val res = if (netPnl > 0) "WIN" else if (netPnl < 0) "LOSS" else "BREAKEVEN"

                        val trade = TradeEntity(
                            accountId = 1,
                            date = currentDate,
                            entryTime = currentTime,
                            exitTime = currentTime,
                            symbol = symbol,
                            direction = direction,
                            lotSize = lotSize,
                            entryPrice = entryPrice,
                            exitPrice = if (exitPrice > 0) exitPrice else null,
                            stopLoss = stopLoss,
                            takeProfit = takeProfitText.toDoubleOrNull(),
                            commission = 10.0,
                            swap = 0.0,
                            grossPnl = grossPnl,
                            netPnl = netPnl,
                            rMultiple = rMultiple,
                            result = res,
                            session = session,
                            notes = notes.ifBlank { null },
                            emotion = emotion
                        )
                        onSave(trade)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .testTag("save_trade_submit_btn"),
                    colors = ButtonDefaults.buttonColors(containerColor = OceanPrimary),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Save Trade", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
