package com.example.tradingos.data.local

import androidx.room.*
import com.example.tradingos.data.model.*
import kotlinx.coroutines.flow.Flow

@Dao
interface TradeDao {
    @Query("SELECT * FROM trades ORDER BY date DESC, id DESC")
    fun getAllTrades(): Flow<List<TradeEntity>>

    @Query("SELECT * FROM trades WHERE accountId = :accountId ORDER BY date DESC, id DESC")
    fun getTradesForAccount(accountId: Long): Flow<List<TradeEntity>>

    @Query("SELECT * FROM trades WHERE id = :id")
    suspend fun getTradeById(id: Long): TradeEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTrade(trade: TradeEntity): Long

    @Update
    suspend fun updateTrade(trade: TradeEntity)

    @Delete
    suspend fun deleteTrade(trade: TradeEntity)

    @Query("DELETE FROM trades WHERE id = :id")
    suspend fun deleteTradeById(id: Long)
}

@Dao
interface AccountDao {
    @Query("SELECT * FROM accounts ORDER BY isDefault DESC, id ASC")
    fun getAllAccounts(): Flow<List<AccountEntity>>

    @Query("SELECT * FROM accounts WHERE id = :id")
    suspend fun getAccountById(id: Long): AccountEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAccount(account: AccountEntity): Long

    @Update
    suspend fun updateAccount(account: AccountEntity)

    @Delete
    suspend fun deleteAccount(account: AccountEntity)
}

@Dao
interface StrategyDao {
    @Query("SELECT * FROM strategies ORDER BY name ASC")
    fun getAllStrategies(): Flow<List<StrategyEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStrategy(strategy: StrategyEntity): Long

    @Delete
    suspend fun deleteStrategy(strategy: StrategyEntity)
}

@Dao
interface PropAccountDao {
    @Query("SELECT * FROM prop_accounts ORDER BY id DESC")
    fun getAllPropAccounts(): Flow<List<PropAccountEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPropAccount(account: PropAccountEntity): Long

    @Update
    suspend fun updatePropAccount(account: PropAccountEntity)

    @Delete
    suspend fun deletePropAccount(account: PropAccountEntity)
}

@Dao
interface RiskSettingsDao {
    @Query("SELECT * FROM risk_settings WHERE id = 1")
    fun getRiskSettings(): Flow<RiskSettingsEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(settings: RiskSettingsEntity)
}

@Dao
interface NoteDao {
    @Query("SELECT * FROM notes ORDER BY isPinned DESC, updatedAt DESC")
    fun getAllNotes(): Flow<List<NoteEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNote(note: NoteEntity): Long

    @Update
    suspend fun updateNote(note: NoteEntity)

    @Delete
    suspend fun deleteNote(note: NoteEntity)
}

@Dao
interface DailyReviewDao {
    @Query("SELECT * FROM daily_reviews ORDER BY date DESC")
    fun getAllReviews(): Flow<List<DailyReviewEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReview(review: DailyReviewEntity): Long
}
