package com.example.tradingos.data.repository

import com.example.tradingos.data.local.TradingDatabase
import com.example.tradingos.data.model.*
import kotlinx.coroutines.flow.Flow

class TradingRepository(private val database: TradingDatabase) {

    val allTrades: Flow<List<TradeEntity>> = database.tradeDao().getAllTrades()
    val allAccounts: Flow<List<AccountEntity>> = database.accountDao().getAllAccounts()
    val allStrategies: Flow<List<StrategyEntity>> = database.strategyDao().getAllStrategies()
    val allPropAccounts: Flow<List<PropAccountEntity>> = database.propAccountDao().getAllPropAccounts()
    val riskSettings: Flow<RiskSettingsEntity?> = database.riskSettingsDao().getRiskSettings()
    val allNotes: Flow<List<NoteEntity>> = database.noteDao().getAllNotes()
    val allReviews: Flow<List<DailyReviewEntity>> = database.dailyReviewDao().getAllReviews()

    suspend fun getTradeById(id: Long): TradeEntity? = database.tradeDao().getTradeById(id)
    suspend fun insertTrade(trade: TradeEntity): Long = database.tradeDao().insertTrade(trade)
    suspend fun updateTrade(trade: TradeEntity) = database.tradeDao().updateTrade(trade)
    suspend fun deleteTradeById(id: Long) = database.tradeDao().deleteTradeById(id)

    suspend fun insertAccount(account: AccountEntity): Long = database.accountDao().insertAccount(account)
    suspend fun updateAccount(account: AccountEntity) = database.accountDao().updateAccount(account)

    suspend fun insertStrategy(strategy: StrategyEntity): Long = database.strategyDao().insertStrategy(strategy)

    suspend fun insertPropAccount(account: PropAccountEntity): Long = database.propAccountDao().insertPropAccount(account)
    suspend fun updatePropAccount(account: PropAccountEntity) = database.propAccountDao().updatePropAccount(account)

    suspend fun updateRiskSettings(settings: RiskSettingsEntity) = database.riskSettingsDao().insertOrUpdate(settings)

    suspend fun insertNote(note: NoteEntity): Long = database.noteDao().insertNote(note)
    suspend fun updateNote(note: NoteEntity) = database.noteDao().updateNote(note)
    suspend fun deleteNote(note: NoteEntity) = database.noteDao().deleteNote(note)

    suspend fun insertReview(review: DailyReviewEntity): Long = database.dailyReviewDao().insertReview(review)
}
