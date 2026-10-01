package com.example.tradingos.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.tradingos.data.calculations.TradingCalculations
import com.example.tradingos.data.model.*
import com.example.tradingos.data.repository.TradingRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class MainViewModel(private val repository: TradingRepository) : ViewModel() {

    val trades = repository.allTrades.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    val accounts = repository.allAccounts.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    val strategies = repository.allStrategies.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    val propAccounts = repository.allPropAccounts.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    val riskSettings = repository.riskSettings.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = null
    )

    val notes = repository.allNotes.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    val reviews = repository.allReviews.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    val analytics: StateFlow<TradingCalculations.AnalyticsSummary> = trades.map {
        TradingCalculations.computeAnalytics(it)
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = TradingCalculations.computeAnalytics(emptyList())
    )

    fun saveTrade(trade: TradeEntity) {
        viewModelScope.launch {
            if (trade.id == 0L) {
                repository.insertTrade(trade)
            } else {
                repository.updateTrade(trade)
            }
        }
    }

    fun deleteTrade(id: Long) {
        viewModelScope.launch {
            repository.deleteTradeById(id)
        }
    }

    fun savePropAccount(account: PropAccountEntity) {
        viewModelScope.launch {
            if (account.id == 0L) {
                repository.insertPropAccount(account)
            } else {
                repository.updatePropAccount(account)
            }
        }
    }

    fun saveNote(title: String, folder: String, content: String) {
        viewModelScope.launch {
            repository.insertNote(
                NoteEntity(
                    title = title,
                    folder = folder,
                    content = content
                )
            )
        }
    }

    fun deleteNote(note: NoteEntity) {
        viewModelScope.launch {
            repository.deleteNote(note)
        }
    }

    fun saveDailyReview(date: String, mood: Int, discipline: Int, wentWell: String, wentWrong: String, focus: String) {
        viewModelScope.launch {
            repository.insertReview(
                DailyReviewEntity(
                    date = date,
                    mood = mood,
                    disciplineScore = discipline,
                    whatWentWell = wentWell,
                    whatWentWrong = wentWrong,
                    focusTomorrow = focus
                )
            )
        }
    }
}

class MainViewModelFactory(private val repository: TradingRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(MainViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return MainViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
