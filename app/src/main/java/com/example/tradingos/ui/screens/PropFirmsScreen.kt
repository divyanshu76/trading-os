package com.example.tradingos.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.tradingos.data.model.PropAccountEntity
import com.example.tradingos.ui.theme.*
import java.util.Locale

@Composable
fun PropFirmsScreen(
    propAccounts: List<PropAccountEntity>,
    onSavePropAccount: (PropAccountEntity) -> Unit,
    modifier: Modifier = Modifier
) {
    var showAddDialog by remember { mutableStateOf(false) }

    Box(modifier = modifier.fillMaxSize().background(OceanBackground)) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(top = 16.dp, bottom = 88.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Prop Firm Tracker",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Track evaluations, rules, & targets",
                            style = MaterialTheme.typography.bodyMedium,
                            color = CharcoalMuted
                        )
                    }
                    Button(
                        onClick = { showAddDialog = true },
                        colors = ButtonDefaults.buttonColors(containerColor = OceanPrimary),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.testTag("add_prop_account_btn")
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Add Challenge")
                    }
                }
            }

            if (propAccounts.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth().padding(top = 30.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = OceanSurface)
                    ) {
                        Column(
                            modifier = Modifier.fillMaxWidth().padding(32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(Icons.Default.Shield, contentDescription = null, tint = CharcoalLight, modifier = Modifier.size(40.dp))
                            Spacer(modifier = Modifier.height(12.dp))
                            Text("No Prop Accounts Tracked", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                            Text("Add an evaluation or funded account to monitor daily & max drawdown rules", color = CharcoalMuted, style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            } else {
                items(propAccounts, key = { it.id }) { acc ->
                    PropAccountCard(account = acc)
                }
            }
        }

        if (showAddDialog) {
            AddPropAccountDialog(
                onDismiss = { showAddDialog = false },
                onSave = {
                    onSavePropAccount(it)
                    showAddDialog = false
                }
            )
        }
    }
}

@Composable
fun PropAccountCard(account: PropAccountEntity) {
    val profit = account.currentBalance - account.accountSize
    val targetProgress = if (account.profitTarget > 0) (profit / account.profitTarget).coerceIn(0.0, 1.0) else 0.0

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, OceanBorder, RoundedCornerShape(18.dp)),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = OceanSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(text = account.firmName.uppercase(Locale.ROOT), style = MaterialTheme.typography.labelSmall, color = OceanPrimary, fontWeight = FontWeight.Bold)
                    Text(text = account.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                }
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(OceanPrimary.copy(alpha = 0.1f))
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(text = account.phase, style = MaterialTheme.typography.labelSmall, color = OceanPrimary, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("Current Balance", style = MaterialTheme.typography.labelSmall, color = CharcoalMuted)
                    Text("$" + String.format(Locale.US, "%,.2f", account.currentBalance), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text("Profit / Target", style = MaterialTheme.typography.labelSmall, color = CharcoalMuted)
                    val pText = (if (profit >= 0) "+$" else "-$") + String.format(Locale.US, "%,.0f", kotlin.math.abs(profit)) + " / $" + String.format(Locale.US, "%,.0f", account.profitTarget)
                    Text(pText, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = if (profit >= 0) ProfitGreen else LossRed)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            LinearProgressIndicator(
                progress = { targetProgress.toFloat() },
                modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                color = ProfitGreen,
                trackColor = OceanSurfaceVariant
            )

            Spacer(modifier = Modifier.height(14.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Daily Loss Limit: $" + String.format(Locale.US, "%,.0f", account.dailyLossLimit),
                    style = MaterialTheme.typography.bodyMedium,
                    color = CharcoalMuted
                )
                Text(
                    text = "Max DD: $" + String.format(Locale.US, "%,.0f", account.overallLossLimit),
                    style = MaterialTheme.typography.bodyMedium,
                    color = CharcoalMuted
                )
            }
        }
    }
}

@Composable
fun AddPropAccountDialog(
    onDismiss: () -> Unit,
    onSave: (PropAccountEntity) -> Unit
) {
    var name by remember { mutableStateOf("100K Challenge") }
    var firmName by remember { mutableStateOf("FTMO") }
    var phase by remember { mutableStateOf("Phase 1") }
    var accountSizeText by remember { mutableStateOf("100000") }
    var profitTargetText by remember { mutableStateOf("10000") }
    var dailyLossText by remember { mutableStateOf("5000") }
    var maxLossText by remember { mutableStateOf("10000") }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = OceanSurface)
        ) {
            Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Add Prop Firm Account", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    IconButton(onClick = onDismiss) { Icon(Icons.Default.Close, contentDescription = "Close") }
                }

                OutlinedTextField(value = firmName, onValueChange = { firmName = it }, label = { Text("Prop Firm (e.g. FTMO, Apex)") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Account Name") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = accountSizeText, onValueChange = { accountSizeText = it }, label = { Text("Account Size ($)") }, modifier = Modifier.fillMaxWidth())

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(value = profitTargetText, onValueChange = { profitTargetText = it }, label = { Text("Profit Target ($)") }, modifier = Modifier.weight(1f))
                    OutlinedTextField(value = dailyLossText, onValueChange = { dailyLossText = it }, label = { Text("Daily Loss ($)") }, modifier = Modifier.weight(1f))
                }

                Button(
                    onClick = {
                        val size = accountSizeText.toDoubleOrNull() ?: 100000.0
                        onSave(
                            PropAccountEntity(
                                name = name,
                                firmName = firmName,
                                phase = phase,
                                accountSize = size,
                                currentBalance = size,
                                profitTarget = profitTargetText.toDoubleOrNull() ?: 10000.0,
                                dailyLossLimit = dailyLossText.toDoubleOrNull() ?: 5000.0,
                                overallLossLimit = maxLossText.toDoubleOrNull() ?: 10000.0,
                                status = "Active"
                            )
                        )
                    },
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = OceanPrimary),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Save Prop Account", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
