package com.example.tradingos.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.tradingos.ui.screens.*
import com.example.tradingos.ui.theme.*

enum class AppScreen(val label: String) {
    DASHBOARD("Dashboard"),
    TRADES("Journal"),
    ANALYTICS("Analytics"),
    PROP_FIRMS("Prop Firms"),
    CALCULATOR("Calculator"),
    RISK_MANAGER("Risk"),
    CALENDAR("Calendar"),
    PSYCHOLOGY("Psychology")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TradingOsApp(viewModel: MainViewModel) {
    var currentScreen by remember { mutableStateOf(AppScreen.DASHBOARD) }

    val trades by viewModel.trades.collectAsStateWithLifecycle()
    val accounts by viewModel.accounts.collectAsStateWithLifecycle()
    val propAccounts by viewModel.propAccounts.collectAsStateWithLifecycle()
    val riskSettings by viewModel.riskSettings.collectAsStateWithLifecycle()
    val notes by viewModel.notes.collectAsStateWithLifecycle()
    val reviews by viewModel.reviews.collectAsStateWithLifecycle()
    val analytics by viewModel.analytics.collectAsStateWithLifecycle()

    // Android back handler
    BackHandler(enabled = currentScreen != AppScreen.DASHBOARD) {
        currentScreen = AppScreen.DASHBOARD
    }

    Scaffold(
        contentWindowInsets = WindowInsets.safeDrawing,
        topBar = {
            TopAppBar(
                title = {
                    Row(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = "Trading OS",
                            fontWeight = FontWeight.ExtraBold,
                            color = CharcoalDark
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "• ${currentScreen.label}",
                            fontWeight = FontWeight.Medium,
                            color = OceanPrimary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = OceanBackground
                ),
                actions = {
                    IconButton(
                        onClick = { currentScreen = AppScreen.CALCULATOR },
                        modifier = Modifier.testTag("top_action_calc")
                    ) {
                        Icon(Icons.Default.Calculate, contentDescription = "Calculator", tint = OceanPrimary)
                    }
                    IconButton(
                        onClick = { currentScreen = AppScreen.RISK_MANAGER },
                        modifier = Modifier.testTag("top_action_risk")
                    ) {
                        Icon(Icons.Default.Shield, contentDescription = "Risk Rules", tint = OceanPrimary)
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = OceanSurface,
                modifier = Modifier
                    .windowInsetsPadding(WindowInsets.navigationBars)
                    .testTag("bottom_nav_bar")
            ) {
                val navItems = listOf(
                    Triple(AppScreen.DASHBOARD, Icons.Default.Dashboard, "Home"),
                    Triple(AppScreen.TRADES, Icons.Default.FormatListBulleted, "Journal"),
                    Triple(AppScreen.ANALYTICS, Icons.Default.BarChart, "Analytics"),
                    Triple(AppScreen.PROP_FIRMS, Icons.Default.Shield, "Prop"),
                    Triple(AppScreen.CALENDAR, Icons.Default.CalendarToday, "Calendar")
                )

                navItems.forEach { (screen, icon, label) ->
                    val isSelected = currentScreen == screen
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { currentScreen = screen },
                        icon = { Icon(icon, contentDescription = label) },
                        label = { Text(label, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = OceanPrimary,
                            selectedTextColor = OceanPrimary,
                            indicatorColor = OceanSurfaceVariant
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(OceanBackground)
        ) {
            when (currentScreen) {
                AppScreen.DASHBOARD -> DashboardScreen(
                    trades = trades,
                    accounts = accounts,
                    analytics = analytics,
                    onAddTradeClick = { currentScreen = AppScreen.TRADES },
                    onCalculatorClick = { currentScreen = AppScreen.CALCULATOR },
                    onPropFirmsClick = { currentScreen = AppScreen.PROP_FIRMS },
                    onDeleteTrade = { viewModel.deleteTrade(it) }
                )
                AppScreen.TRADES -> TradesScreen(
                    trades = trades,
                    onSaveTrade = { viewModel.saveTrade(it) },
                    onDeleteTrade = { viewModel.deleteTrade(it) }
                )
                AppScreen.ANALYTICS -> AnalyticsScreen(
                    trades = trades,
                    analytics = analytics
                )
                AppScreen.PROP_FIRMS -> PropFirmsScreen(
                    propAccounts = propAccounts,
                    onSavePropAccount = { viewModel.savePropAccount(it) }
                )
                AppScreen.CALCULATOR -> PositionCalculatorScreen(
                    initialBalance = accounts.firstOrNull()?.currentBalance ?: 10000.0
                )
                AppScreen.RISK_MANAGER -> RiskManagerScreen(
                    trades = trades,
                    riskSettings = riskSettings
                )
                AppScreen.CALENDAR -> CalendarScreen(
                    trades = trades
                )
                AppScreen.PSYCHOLOGY -> PsychologyNotesScreen(
                    reviews = reviews,
                    notes = notes,
                    onSaveReview = { date, mood, discipline, well, wrong, focus ->
                        viewModel.saveDailyReview(date, mood, discipline, well, wrong, focus)
                    },
                    onSaveNote = { title, folder, content ->
                        viewModel.saveNote(title, folder, content)
                    },
                    onDeleteNote = { viewModel.deleteNote(it) }
                )
            }
        }
    }
}
