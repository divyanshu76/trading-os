'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Plus, Search, Filter, ArrowUpDown, Trash2, Edit, Eye,
  Copy, Download, ChevronDown, ChevronUp, X
} from 'lucide-react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn, getPnlColor, getResultBadgeClass, formatCurrency, formatRMultiple, formatHoldingTime } from '@/lib/utils'
import type { Trade } from '@/types/database'

interface TradesClientProps {
  initialTrades: Trade[]
  accounts: Array<{ id: string; name: string; currency: string; color: string | null }>
  strategies: Array<{ id: string; name: string; color: string | null }>
  currency: string
}

export function TradesClient({ initialTrades, accounts, strategies, currency }: TradesClientProps) {
  const router = useRouter()
  const [trades, setTrades] = useState(initialTrades)
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [filters, setFilters] = useState({
    accountId: '',
    direction: '',
    result: '',
    strategyId: '',
    session: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Filtered data
  const filteredData = useMemo(() => {
    let data = trades
    if (filters.accountId) data = data.filter(t => t.account_id === filters.accountId)
    if (filters.direction) data = data.filter(t => t.direction === filters.direction)
    if (filters.result)    data = data.filter(t => t.result === filters.result)
    if (filters.strategyId) data = data.filter(t => t.strategy_id === filters.strategyId)
    if (filters.session)   data = data.filter(t => t.session === filters.session)
    return data
  }, [trades, filters])

  const columns = useMemo<ColumnDef<Trade>[]>(() => [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap">
          {row.original.date ? format(new Date(row.original.date), 'MMM d, yyyy') : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'symbol',
      header: 'Symbol',
      cell: ({ row }) => (
        <Link href={`/trades/${row.original.id}`} className="font-semibold hover:text-[hsl(var(--primary))] transition-colors whitespace-nowrap">
          {row.original.symbol}
        </Link>
      ),
    },
    {
      accessorKey: 'direction',
      header: 'Dir',
      cell: ({ row }) => (
        <span className={cn(
          'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase',
          row.original.direction === 'long'
            ? 'bg-emerald-400/15 text-emerald-400'
            : 'bg-red-400/15 text-red-400'
        )}>
          {row.original.direction === 'long' ? 'LONG' : 'SHORT'}
        </span>
      ),
    },
    {
      accessorKey: 'lot_size',
      header: 'Lots',
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.lot_size}</span>,
    },
    {
      accessorKey: 'entry_price',
      header: 'Entry',
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.entry_price?.toFixed(5)}</span>,
    },
    {
      accessorKey: 'stop_loss',
      header: 'SL',
      cell: ({ row }) => (
        <span className="tabular-nums text-xs text-[hsl(var(--muted-foreground))]">
          {row.original.stop_loss?.toFixed(5) ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'take_profit',
      header: 'TP',
      cell: ({ row }) => (
        <span className="tabular-nums text-xs text-[hsl(var(--muted-foreground))]">
          {row.original.take_profit?.toFixed(5) ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'exit_price',
      header: 'Exit',
      cell: ({ row }) => (
        <span className="tabular-nums text-xs">
          {row.original.exit_price?.toFixed(5) ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'net_pnl',
      header: 'Net P&L',
      cell: ({ row }) => {
        const pnl = row.original.net_pnl
        return (
          <span className={cn('tabular-nums text-xs font-semibold whitespace-nowrap', getPnlColor(pnl ?? 0))}>
            {pnl !== null && pnl !== undefined
              ? `${pnl >= 0 ? '+' : ''}${formatCurrency(pnl, currency)}`
              : '—'}
          </span>
        )
      },
    },
    {
      accessorKey: 'r_multiple',
      header: 'R',
      cell: ({ row }) => (
        <span className={cn('tabular-nums text-xs font-medium', getPnlColor(row.original.r_multiple ?? 0))}>
          {formatRMultiple(row.original.r_multiple)}
        </span>
      ),
    },
    {
      accessorKey: 'result',
      header: 'Result',
      cell: ({ row }) => row.original.result ? (
        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold border', getResultBadgeClass(row.original.result))}>
          {row.original.result.toUpperCase()}
        </span>
      ) : null,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/trades/${row.original.id}`}
            className="p-1.5 rounded-md hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            title="View"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/trades/${row.original.id}/edit`}
            className="p-1.5 rounded-md hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            title="Edit"
          >
            <Edit className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => handleDelete(row.original.id)}
            disabled={deletingId === row.original.id}
            className="p-1.5 rounded-md hover:bg-red-400/15 text-[hsl(var(--muted-foreground))] hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ], [currency, deletingId])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 50 } },
  })

  async function handleDelete(id: string) {
    if (!confirm('Delete this trade? This cannot be undone.')) return
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('trades').delete().eq('id', id)
    setDeletingId(null)
    if (error) {
      toast.error('Failed to delete trade')
      return
    }
    setTrades(prev => prev.filter(t => t.id !== id))
    toast.success('Trade deleted')
  }

  function clearFilters() {
    setFilters({ accountId: '', direction: '', result: '', strategyId: '', session: '' })
    setGlobalFilter('')
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length + (globalFilter ? 1 : 0)

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Trade Journal</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {filteredData.length} trades
          </p>
        </div>
        <Link
          href="/trades/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:bg-[hsl(var(--primary)/0.9)] transition-colors"
          id="trades-add-trade-btn"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Trade</span>
        </Link>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search trades…"
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-sm placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
            showFilters || activeFilterCount > 0
              ? 'border-[hsl(var(--primary)/0.5)] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
              : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
          )}
          aria-label="Toggle filters"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[hsl(var(--primary))] text-white text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Filter dropdowns */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
        >
          {[
            { key: 'accountId', label: 'Account', options: accounts.map(a => ({ value: a.id, label: a.name })) },
            { key: 'direction', label: 'Direction', options: [{ value: 'long', label: 'Long' }, { value: 'short', label: 'Short' }] },
            { key: 'result', label: 'Result', options: [{ value: 'win', label: 'Win' }, { value: 'loss', label: 'Loss' }, { value: 'breakeven', label: 'Breakeven' }] },
            { key: 'strategyId', label: 'Strategy', options: strategies.map(s => ({ value: s.id, label: s.name })) },
            { key: 'session', label: 'Session', options: [
              { value: 'london', label: 'London' },
              { value: 'new_york', label: 'New York' },
              { value: 'asia', label: 'Asia' },
            ]},
          ].map(({ key, label, options }) => (
            <select
              key={key}
              value={filters[key as keyof typeof filters]}
              onChange={e => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
              className="px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            >
              <option value="">All {label}s</option>
              {options.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ))}
        </motion.div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="border-b border-[hsl(var(--border))]">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide whitespace-nowrap select-none"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            'flex items-center gap-1',
                            header.column.getCanSort() && 'cursor-pointer hover:text-[hsl(var(--foreground))]'
                          )}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() === 'asc' && <ChevronUp className="w-3 h-3" />}
                          {header.column.getIsSorted() === 'desc' && <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-16 text-center text-[hsl(var(--muted-foreground))] text-sm">
                    <div className="flex flex-col items-center gap-3">
                      <p>No trades found.</p>
                      <Link href="/trades/new" className="text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
                        <Plus className="w-4 h-4" />Add your first trade
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="group hover:bg-[hsl(var(--muted)/0.4)] transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {table.getRowModel().rows.length === 0 ? (
          <div className="p-8 text-center text-[hsl(var(--muted-foreground))] text-sm bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
            <div className="flex flex-col items-center gap-3">
              <p>No trades found.</p>
              <Link href="/trades/new" className="text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
                <Plus className="w-4 h-4" />Add your first trade
              </Link>
            </div>
          </div>
        ) : (
          table.getRowModel().rows.map(row => {
            const trade = row.original
            const pnl = trade.net_pnl
            const isWin = pnl && pnl > 0
            
            return (
              <Link 
                href={`/trades/${trade.id}`}
                key={row.id} 
                className="block bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4 shadow-sm hover:border-slate/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-charcoal">{trade.symbol}</span>
                      <span className={cn(
                        'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase',
                        trade.direction === 'long' ? 'bg-emerald-400/15 text-emerald-400' : 'bg-red-400/15 text-red-400'
                      )}>
                        {trade.direction === 'long' ? 'L' : 'S'}
                      </span>
                    </div>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {trade.date ? format(new Date(trade.date), 'MMM d, yyyy') : '—'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={cn('text-sm font-extrabold tabular-nums', getPnlColor(pnl ?? 0))}>
                      {pnl !== null && pnl !== undefined ? `${pnl >= 0 ? '+' : ''}${formatCurrency(pnl, currency)}` : '—'}
                    </div>
                    <div className={cn('text-xs font-bold tabular-nums mt-0.5', getPnlColor(trade.r_multiple ?? 0))}>
                      {trade.r_multiple !== null && trade.r_multiple !== undefined ? formatRMultiple(trade.r_multiple) : '—'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))] border-t border-border/10 pt-3">
                  <div className="flex gap-4">
                    <span><strong className="font-medium text-grey">Entry:</strong> {trade.entry_price?.toFixed(5) ?? '—'}</span>
                    <span><strong className="font-medium text-grey">Exit:</strong> {trade.exit_price?.toFixed(5) ?? '—'}</span>
                  </div>
                  {trade.result && (
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold border', getResultBadgeClass(trade.result))}>
                      {trade.result.toUpperCase()}
                    </span>
                  )}
                </div>
              </Link>
            )
          })
        )}
      </div>

      {/* Pagination Container (Shared) */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 gap-3 text-xs text-[hsl(var(--muted-foreground))]">
          <span>
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredData.length)} of {filteredData.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 rounded-md border border-[hsl(var(--border))] disabled:opacity-40 hover:bg-[hsl(var(--muted))] transition-colors"
            >
              Previous
            </button>
            <span className="px-2">
              Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 rounded-md border border-[hsl(var(--border))] disabled:opacity-40 hover:bg-[hsl(var(--muted))] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
