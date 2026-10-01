package com.example.tradingos.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "trades")
data class TradeEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val accountId: Long = 1,
    val date: String, // YYYY-MM-DD
    val entryTime: String,
    val exitTime: String? = null,
    val symbol: String,
    val direction: String, // "LONG", "SHORT"
    val lotSize: Double,
    val entryPrice: Double,
    val exitPrice: Double? = null,
    val stopLoss: Double? = null,
    val takeProfit: Double? = null,
    val commission: Double = 0.0,
    val swap: Double = 0.0,
    val grossPnl: Double = 0.0,
    val netPnl: Double = 0.0,
    val rMultiple: Double? = null,
    val result: String = "OPEN", // "WIN", "LOSS", "BREAKEVEN", "OPEN"
    val session: String = "London", // "London", "New York", "Asia", "London/NY Overlap"
    val notes: String? = null,
    val strategyId: Long? = null,
    val emotion: String? = null,
    val checklistCompleted: Boolean = true
)

@Entity(tableName = "accounts")
data class AccountEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val type: String, // "personal", "prop_firm", "demo", "crypto"
    val currency: String = "USD",
    val initialBalance: Double,
    val currentBalance: Double,
    val isDefault: Boolean = false
)

@Entity(tableName = "strategies")
data class StrategyEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val market: String,
    val description: String? = null,
    val color: String = "#386382"
)

@Entity(tableName = "prop_accounts")
data class PropAccountEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val firmName: String,
    val phase: String, // "Challenge", "Phase 1", "Phase 2", "Funded"
    val accountSize: Double,
    val currentBalance: Double,
    val profitTarget: Double,
    val dailyLossLimit: Double,
    val overallLossLimit: Double,
    val status: String = "Active" // "Active", "Passed", "Failed"
)

@Entity(tableName = "risk_settings")
data class RiskSettingsEntity(
    @PrimaryKey val id: Long = 1,
    val defaultRiskPercent: Double = 1.0,
    val maxDailyLossAmount: Double = 500.0,
    val maxDailyLossPercent: Double = 3.0,
    val maxDrawdownPercent: Double = 8.0,
    val maxTradesPerDay: Int = 4
)

@Entity(tableName = "notes")
data class NoteEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val folder: String = "General",
    val content: String,
    val isPinned: Boolean = false,
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "daily_reviews")
data class DailyReviewEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val date: String,
    val mood: Int = 7, // 1-10
    val disciplineScore: Int = 8, // 1-10
    val whatWentWell: String = "",
    val whatWentWrong: String = "",
    val focusTomorrow: String = ""
)

data class InstrumentSpec(
    val symbol: String,
    val category: String,
    val tickSize: Double,
    val tickValue: Double,
    val contractSize: Double,
    val digits: Int
)
