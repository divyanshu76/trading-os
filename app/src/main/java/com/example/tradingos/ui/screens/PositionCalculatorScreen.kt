package com.example.tradingos.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.tradingos.data.calculations.TradingCalculations
import com.example.tradingos.ui.theme.*
import java.util.Locale

@Composable
fun PositionCalculatorScreen(
    initialBalance: Double = 10000.0,
    modifier: Modifier = Modifier
) {
    var symbol by remember { mutableStateOf("XAUUSD") }
    var balanceText by remember { mutableStateOf(initialBalance.toInt().toString()) }
    var riskPercentText by remember { mutableStateOf("1.0") }
    var direction by remember { mutableStateOf("LONG") }
    var entryPriceText by remember { mutableStateOf("2650.0") }
    var stopLossText by remember { mutableStateOf("2640.0") }

    val balance = balanceText.toDoubleOrNull() ?: 10000.0
    val riskPercent = riskPercentText.toDoubleOrNull() ?: 1.0
    val entryPrice = entryPriceText.toDoubleOrNull() ?: 2650.0
    val stopLoss = stopLossText.toDoubleOrNull() ?: 2640.0
    val instrument = TradingCalculations.getInstrument(symbol)

    val (lotSize, riskCash) = remember(balance, riskPercent, direction, entryPrice, stopLoss, instrument) {
        TradingCalculations.calculateLotSize(balance, riskPercent, direction, entryPrice, stopLoss, instrument)
    }

    val slDistance = if (direction == "LONG") entryPrice - stopLoss else stopLoss - entryPrice

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(OceanBackground)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 88.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text("Position Size Calculator", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Text("Exact lot calculation normalized to instrument contract specs", style = MaterialTheme.typography.bodyMedium, color = CharcoalMuted)
        }

        // Output Display Card
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
                    Text("RECOMMENDED POSITION SIZE", style = MaterialTheme.typography.labelSmall, color = CharcoalMuted, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "$lotSize Lots",
                        style = MaterialTheme.typography.headlineLarge.copy(
                            fontSize = 36.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = OceanPrimary
                        )
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Max Cash Risk", style = MaterialTheme.typography.bodyMedium, color = CharcoalMuted)
                            Text("$" + String.format(Locale.US, "%.2f", riskCash), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = LossRed)
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("Stop Distance", style = MaterialTheme.typography.bodyMedium, color = CharcoalMuted)
                            Text(String.format(Locale.US, "%.2f points", kotlin.math.max(0.0, slDistance)), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Instrument Selector
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, OceanBorder, RoundedCornerShape(16.dp)),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = OceanSurface)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Select Instrument", style = MaterialTheme.typography.labelSmall, color = CharcoalMuted, fontWeight = FontWeight.Bold)
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        val symbols = listOf("XAUUSD", "EURUSD", "GBPUSD", "USDJPY", "NAS100", "US30", "BTCUSD")
                        items(symbols) { s ->
                            FilterChip(
                                selected = symbol == s,
                                onClick = {
                                    symbol = s
                                    when (s) {
                                        "XAUUSD" -> { entryPriceText = "2650.0"; stopLossText = "2640.0" }
                                        "EURUSD" -> { entryPriceText = "1.08500"; stopLossText = "1.08350" }
                                        "GBPUSD" -> { entryPriceText = "1.33000"; stopLossText = "1.32800" }
                                        "USDJPY" -> { entryPriceText = "148.500"; stopLossText = "148.200" }
                                        "NAS100" -> { entryPriceText = "20100.0"; stopLossText = "20050.0" }
                                        "US30"   -> { entryPriceText = "42100.0"; stopLossText = "42000.0" }
                                        "BTCUSD" -> { entryPriceText = "65000.0"; stopLossText = "64200.0" }
                                    }
                                },
                                label = { Text(s) }
                            )
                        }
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = { direction = "LONG" },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = if (direction == "LONG") ProfitGreen else OceanSurfaceVariant, contentColor = if (direction == "LONG") OceanSurface else CharcoalDark)
                        ) { Text("LONG", fontWeight = FontWeight.Bold) }

                        Button(
                            onClick = { direction = "SHORT" },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = if (direction == "SHORT") LossRed else OceanSurfaceVariant, contentColor = if (direction == "SHORT") OceanSurface else CharcoalDark)
                        ) { Text("SHORT", fontWeight = FontWeight.Bold) }
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedTextField(value = balanceText, onValueChange = { balanceText = it }, label = { Text("Balance ($)") }, modifier = Modifier.weight(1f))
                        OutlinedTextField(value = riskPercentText, onValueChange = { riskPercentText = it }, label = { Text("Risk (%)") }, modifier = Modifier.weight(1f))
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedTextField(value = entryPriceText, onValueChange = { entryPriceText = it }, label = { Text("Entry Price") }, modifier = Modifier.weight(1f))
                        OutlinedTextField(value = stopLossText, onValueChange = { stopLossText = it }, label = { Text("Stop Loss") }, modifier = Modifier.weight(1f))
                    }
                }
            }
        }
    }
}
