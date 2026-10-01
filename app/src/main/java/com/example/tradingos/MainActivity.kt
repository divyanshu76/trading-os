package com.example.tradingos

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import com.example.tradingos.ui.MainViewModel
import com.example.tradingos.ui.MainViewModelFactory
import com.example.tradingos.ui.TradingOsApp
import com.example.tradingos.ui.theme.TradingOSTheme

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels {
        MainViewModelFactory((application as TradingOsApplication).repository)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            TradingOSTheme {
                TradingOsApp(viewModel = viewModel)
            }
        }
    }
}
