# Trading OS — Professional Trading Journal & Analytics for Android

A native Android application built with **Kotlin**, **Jetpack Compose (Material 3)**, and **Room Database**, providing serious retail traders with institutional-grade journal tracking, live position size calculations, risk management rules, and prop firm evaluation monitoring.

## Features

- **Authoritative Balance & Trade Journal**: Track trades across multiple accounts (Personal, Prop Firm, Demo) with authoritative realized P&L calculations.
- **Financial Analytics Engine**:
  - Live Win Rate, Profit Factor, Expectancy, and Average Win/Loss.
  - Drawdown monitoring with peak equity tracking.
  - Win/Loss streak counter and current streak status.
  - Directional performance (Long vs Short) and session breakdown (London, New York, Asia).
- **Interactive Equity Curve**: Native Canvas-rendered equity curve visualizer with gradient fills.
- **Position Size Calculator**: Normalized position sizing based on tick size, tick value, and contract specs for Forex, Metals (Gold), Indices (NAS100, US30, SP500), and Crypto (BTC, ETH).
- **Prop Firm Tracker**: Monitor challenge phases (Phase 1, Phase 2, Funded) with real-time target progress, daily loss buffers, and overall drawdown limits.
- **Risk Manager**: Capital preservation rules with automated warnings (Safe, Caution, Breached) comparing daily closed trade losses against account parameters.
- **Trade Calendar**: Day-by-day P&L breakdown highlighting winning vs losing days.
- **Psychology & Strategy Playbook**: Daily discipline scoring, emotional reflections, and strategy playbook notes.

## Tech Stack & Architecture

- **UI**: 100% Jetpack Compose with Material Design 3.
- **Architecture**: MVVM with Repository Pattern and Kotlin Coroutines / StateFlow.
- **Local Persistence**: Android Room Database with reactive Flow queries and schema versioning.
- **Build System**: Gradle Kotlin DSL (`build.gradle.kts`) with Version Catalog (`libs.versions.toml`).
