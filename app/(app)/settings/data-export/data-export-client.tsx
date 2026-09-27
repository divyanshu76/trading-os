'use client'

import { useState } from 'react'
import { ArrowLeft, Download, FileJson, FileSpreadsheet } from 'lucide-react'
import Link from 'next/link'
import Papa from 'papaparse'
import { toast } from 'sonner'
import type { Trade } from '@/types/database'

type TradeWithAccount = Trade & { account?: { name: string } | null }

export function DataExportClient({ trades }: { trades: TradeWithAccount[] }) {
  const [exporting, setExporting] = useState(false)

  function exportCSV() {
    if (trades.length === 0) return toast.error('No trades to export.')
    setExporting(true)
    try {
      const csvData = trades.map(t => ({
        ID: t.id,
        Account: t.account?.name || 'Unknown',
        Ticket: t.external_id || '',
        Symbol: t.symbol,
        Direction: t.direction,
        Lot_Size: t.lot_size,
        Open_Time: t.entry_time,
        Close_Time: t.exit_time || '',
        Entry_Price: t.entry_price,
        Exit_Price: t.exit_price || '',
        Stop_Loss: t.stop_loss || '',
        Take_Profit: t.take_profit || '',
        PnL: t.net_pnl || 0,
        Status: t.result,
      }))
      
      const csv = Papa.unparse(csvData)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      downloadBlob(blob, `trading-os-export-${new Date().toISOString().split('T')[0]}.csv`)
      toast.success('CSV Exported successfully')
    } catch (e) {
      toast.error('Export failed')
    }
    setExporting(false)
  }

  function exportJSON() {
    if (trades.length === 0) return toast.error('No trades to export.')
    setExporting(true)
    try {
      const blob = new Blob([JSON.stringify(trades, null, 2)], { type: 'application/json' })
      downloadBlob(blob, `trading-os-export-${new Date().toISOString().split('T')[0]}.json`)
      toast.success('JSON Exported successfully')
    } catch (e) {
      toast.error('Export failed')
    }
    setExporting(false)
  }

  function downloadBlob(blob: Blob, filename: string) {
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/settings" className="p-2 rounded-full hover:bg-[hsl(var(--muted))] transition-colors text-[hsl(var(--muted-foreground))]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Download className="w-5 h-5 text-[hsl(var(--primary))]" />
            Data Export
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Export your complete trading history for external analysis.</p>
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-6">
        
        <div>
          <p className="text-sm font-semibold mb-1">Total Trades Available</p>
          <p className="text-3xl font-bold">{trades.length}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-[hsl(var(--border))]">
          <button 
            onClick={exportCSV} 
            disabled={exporting || trades.length === 0}
            className="flex flex-col items-center justify-center p-6 gap-3 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] bg-[hsl(var(--background))] transition-colors disabled:opacity-50"
          >
            <FileSpreadsheet className="w-8 h-8 text-emerald-500" />
            <div className="text-center">
              <p className="font-semibold text-sm text-charcoal">Export CSV</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Best for Excel or Sheets</p>
            </div>
          </button>

          <button 
            onClick={exportJSON} 
            disabled={exporting || trades.length === 0}
            className="flex flex-col items-center justify-center p-6 gap-3 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] bg-[hsl(var(--background))] transition-colors disabled:opacity-50"
          >
            <FileJson className="w-8 h-8 text-blue-500" />
            <div className="text-center">
              <p className="font-semibold text-sm text-charcoal">Export JSON</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Best for developers & API</p>
            </div>
          </button>
        </div>

      </div>
    </div>
  )
}
