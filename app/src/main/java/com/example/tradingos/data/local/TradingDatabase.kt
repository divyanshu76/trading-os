package com.example.tradingos.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.tradingos.data.model.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        TradeEntity::class,
        AccountEntity::class,
        StrategyEntity::class,
        PropAccountEntity::class,
        RiskSettingsEntity::class,
        NoteEntity::class,
        DailyReviewEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class TradingDatabase : RoomDatabase() {
    abstract fun tradeDao(): TradeDao
    abstract fun accountDao(): AccountDao
    abstract fun strategyDao(): StrategyDao
    abstract fun propAccountDao(): PropAccountDao
    abstract fun riskSettingsDao(): RiskSettingsDao
    abstract fun noteDao(): NoteDao
    abstract fun dailyReviewDao(): DailyReviewDao

    companion object {
        @Volatile
        private var INSTANCE: TradingDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): TradingDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    TradingDatabase::class.java,
                    "trading_os_database"
                )
                    .addCallback(TradingDatabaseCallback(scope))
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }

    private class TradingDatabaseCallback(
        private val scope: CoroutineScope
    ) : RoomDatabase.Callback() {
        override fun onCreate(db: SupportSQLiteDatabase) {
            super.onCreate(db)
            INSTANCE?.let { database ->
                scope.launch(Dispatchers.IO) {
                    populateInitialData(database)
                }
            }
        }

        suspend fun populateInitialData(db: TradingDatabase) {
            // Default Account
            db.accountDao().insertAccount(
                AccountEntity(
                    id = 1,
                    name = "Primary Live Account",
                    type = "personal",
                    currency = "USD",
                    initialBalance = 10000.0,
                    currentBalance = 12480.0,
                    isDefault = true
                )
            )
            db.accountDao().insertAccount(
                AccountEntity(
                    id = 2,
                    name = "FTMO 100k Challenge",
                    type = "prop_firm",
                    currency = "USD",
                    initialBalance = 100000.0,
                    currentBalance = 104250.0,
                    isDefault = false
                )
            )

            // Default Strategies
            db.strategyDao().insertStrategy(
                StrategyEntity(
                    id = 1,
                    name = "London Breakout",
                    market = "Forex",
                    description = "Breakout of Asian range during London open session.",
                    color = "#386382"
                )
            )
            db.strategyDao().insertStrategy(
                StrategyEntity(
                    id = 2,
                    name = "Supply & Demand Reversal",
                    market = "Metals & Indices",
                    description = "15m mitigation into 4h order block with sweep.",
                    color = "#357D71"
                )
            )
            db.strategyDao().insertStrategy(
                StrategyEntity(
                    id = 3,
                    name = "FVG Trend Continuation",
                    market = "Indices",
                    description = "NY AM session fair value gap retest following displacement.",
                    color = "#B87333"
                )
            )

            // Default Risk Settings
            db.riskSettingsDao().insertOrUpdate(
                RiskSettingsEntity(
                    id = 1,
                    defaultRiskPercent = 1.0,
                    maxDailyLossAmount = 500.0,
                    maxDailyLossPercent = 3.0,
                    maxDrawdownPercent = 8.0,
                    maxTradesPerDay = 4
                )
            )

            // Prop Account
            db.propAccountDao().insertPropAccount(
                PropAccountEntity(
                    id = 1,
                    name = "100K Evaluation",
                    firmName = "FTMO",
                    phase = "Phase 1",
                    accountSize = 100000.0,
                    currentBalance = 104250.0,
                    profitTarget = 10000.0,
                    dailyLossLimit = 5000.0,
                    overallLossLimit = 10000.0,
                    status = "Active"
                )
            )

            // Seed Realistic Trades
            db.tradeDao().insertTrade(
                TradeEntity(
                    accountId = 1,
                    date = "2026-09-30",
                    entryTime = "13:30",
                    exitTime = "15:45",
                    symbol = "XAUUSD",
                    direction = "LONG",
                    lotSize = 1.5,
                    entryPrice = 2650.50,
                    exitPrice = 2668.20,
                    stopLoss = 2642.00,
                    takeProfit = 2670.00,
                    commission = 15.0,
                    swap = 0.0,
                    grossPnl = 2655.0,
                    netPnl = 2640.0,
                    rMultiple = 2.1,
                    result = "WIN",
                    session = "New York",
                    notes = "Clean sweep of pre-market lows followed by strong momentum.",
                    strategyId = 2,
                    emotion = "Confident"
                )
            )

            db.tradeDao().insertTrade(
                TradeEntity(
                    accountId = 1,
                    date = "2026-09-29",
                    entryTime = "08:15",
                    exitTime = "10:30",
                    symbol = "EURUSD",
                    direction = "SHORT",
                    lotSize = 2.0,
                    entryPrice = 1.0880,
                    exitPrice = 1.0845,
                    stopLoss = 1.0898,
                    takeProfit = 1.0830,
                    commission = 12.0,
                    swap = 2.0,
                    grossPnl = 700.0,
                    netPnl = 686.0,
                    rMultiple = 1.9,
                    result = "WIN",
                    session = "London",
                    notes = "Asian high swept into 1h Bearish OB.",
                    strategyId = 1,
                    emotion = "Calm"
                )
            )

            db.tradeDao().insertTrade(
                TradeEntity(
                    accountId = 1,
                    date = "2026-09-28",
                    entryTime = "14:00",
                    exitTime = "14:40",
                    symbol = "NAS100",
                    direction = "LONG",
                    lotSize = 3.0,
                    entryPrice = 20150.0,
                    exitPrice = 20080.0,
                    stopLoss = 20080.0,
                    takeProfit = 20300.0,
                    commission = 18.0,
                    swap = 0.0,
                    grossPnl = -210.0,
                    netPnl = -228.0,
                    rMultiple = -1.0,
                    result = "LOSS",
                    session = "New York",
                    notes = "Chased extension before CPI news. Cut according to plan.",
                    strategyId = 3,
                    emotion = "Frustrated"
                )
            )

            db.tradeDao().insertTrade(
                TradeEntity(
                    accountId = 1,
                    date = "2026-09-25",
                    entryTime = "09:00",
                    exitTime = "11:20",
                    symbol = "GBPUSD",
                    direction = "LONG",
                    lotSize = 2.0,
                    entryPrice = 1.3320,
                    exitPrice = 1.3385,
                    stopLoss = 1.3290,
                    takeProfit = 1.3400,
                    commission = 12.0,
                    swap = 0.0,
                    grossPnl = 1300.0,
                    netPnl = 1288.0,
                    rMultiple = 2.15,
                    result = "WIN",
                    session = "London",
                    notes = "Reclaimed key daily pivot level with high volume.",
                    strategyId = 1,
                    emotion = "Calm"
                )
            )

            // Seed Notes
            db.noteDao().insertNote(
                NoteEntity(
                    title = "Rules for London Open",
                    folder = "Strategies",
                    content = "1. Never trade inside first 15 mins.\n2. Wait for liquidity sweep of high/low.\n3. Stop loss beyond the trigger candle.\n4. Risk strictly 1%.",
                    isPinned = true
                )
            )

            db.noteDao().insertNote(
                NoteEntity(
                    title = "Psychology: Handling Red Days",
                    folder = "Lessons",
                    content = "Taking a loss is the cost of doing business. If 2 consecutive losses hit, close the charts for the day.",
                    isPinned = false
                )
            )

            // Seed Daily Review
            db.dailyReviewDao().insertReview(
                DailyReviewEntity(
                    date = "2026-09-30",
                    mood = 9,
                    disciplineScore = 9,
                    whatWentWell = "Waited patiently for XAUUSD setup, executed cleanly at planned entry.",
                    whatWentWrong = "Slight hesitation before pulling trigger.",
                    focusTomorrow = "Continue respecting maximum 2 trades limit."
                )
            )
        }
    }
}
