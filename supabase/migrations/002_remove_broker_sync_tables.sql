-- ============================================================
-- Trading OS — Remove Broker Connections & Sync Logs
-- Migration: 002_remove_broker_sync_tables.sql
--
-- Rationale: Trading OS is a manual trading journal.
-- The broker_connections and sync_logs tables were created for
-- an MT5/broker auto-sync feature that has been removed.
-- These tables have no dependencies from other features.
-- CSV import uses the `imports` table (kept intact).
-- Trade records from previous broker syncs remain in `trades`.
--
-- IMPORTANT: This migration is ADDITIVE-SAFE.
-- It drops only the broker sync infrastructure tables.
-- User trade data (trades table) is NOT affected.
-- ============================================================

-- Drop sync_logs first (references broker_connections)
drop table if exists public.sync_logs cascade;

-- Drop broker_connections
drop table if exists public.broker_connections cascade;

-- NOTE: The trades.source column check constraint is intentionally
-- kept as-is in the database to not invalidate any existing rows
-- that may have source='broker_sync' from previous imports.
-- No new broker_sync trades will be created (code path removed).
-- The TypeScript type has been updated to 'manual' | 'import' only.
