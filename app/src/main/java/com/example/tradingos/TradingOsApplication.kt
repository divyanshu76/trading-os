package com.example.tradingos

import android.app.Application
import com.example.tradingos.data.local.TradingDatabase
import com.example.tradingos.data.repository.TradingRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob

class TradingOsApplication : Application() {
    val applicationScope = CoroutineScope(SupervisorJob())

    val database by lazy { TradingDatabase.getDatabase(this, applicationScope) }
    val repository by lazy { TradingRepository(database) }
}
