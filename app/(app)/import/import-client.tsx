'use client'

import { useState } from 'react'
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X, ChevronRight, ArrowRight } from 'lucide-react'
import Papa from 'papaparse'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Account } from '@/types/database'
import { useRouter } from 'next/navigation'

interface ImportClientProps {
  accounts: Account[]
}

export function ImportClient({ accounts }: ImportClientProps) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [parsedData, setParsedData] = useState<any[]>([])
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [mapping, setMapping] = useState<{ [key: string]: string }>({
    date: '', symbol: '', direction: '', lot_size: '', entry_price: '', net_pnl: '', external_id: ''
  })

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setFile(selected)
      Papa.parse(selected, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          setParsedData(results.data)
          if (results.meta.fields) {
            // Auto-map common headers
            const m = { ...mapping }
            results.meta.fields.forEach((f: string) => {
              const lower = f.toLowerCase()
              if (lower.includes('date') || lower.includes('time')) m.date = f
              if (lower.includes('symbol') || lower.includes('asset')) m.symbol = f
              if (lower.includes('type') || lower.includes('side') || lower.includes('dir')) m.direction = f
              if (lower.includes('size') || lower.includes('lot') || lower.includes('qty') || lower.includes('volume')) m.lot_size = f
              if (lower.includes('price') && lower.includes('entry')) m.entry_price = f
              else if (lower.includes('price')) m.entry_price = f
              if (lower.includes('profit') || lower.includes('pnl') || lower.includes('net')) m.net_pnl = f
              if (lower.includes('ticket') || lower.includes('order') || lower.includes('position')) m.external_id = f
            })
            setMapping(m as any)
          }
          setStep(2)
        },
        error: () => toast.error('Failed to parse CSV file')
      })
    }
  }

  const headers = parsedData.length > 0 ? Object.keys(parsedData[0]) : []

  async function handleImport() {
    if (!selectedAccount) return toast.error('Please select an account')
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const tradesToInsert = parsedData.map(row => {
      let dir = (row[mapping.direction] || '').toLowerCase()
      if (dir.includes('buy')) dir = 'long'
      if (dir.includes('sell')) dir = 'short'
      if (dir !== 'long' && dir !== 'short') dir = 'long' // default fallback

      const pnl = parseFloat(row[mapping.net_pnl] || '0')
      let result = 'breakeven'
      if (pnl > 0) result = 'win'
      else if (pnl < 0) result = 'loss'

      // Construct a valid ISO date
      let dateStr = row[mapping.date] || new Date().toISOString()
      try {
        const d = new Date(dateStr)
        if (!isNaN(d.getTime())) {
          dateStr = d.toISOString().split('T')[0]
        } else {
          dateStr = new Date().toISOString().split('T')[0]
        }
      } catch (e) {
        dateStr = new Date().toISOString().split('T')[0]
      }

      return {
        user_id: user.id,
        account_id: selectedAccount,
        date: dateStr,
        entry_time: new Date().toISOString(),
        symbol: (row[mapping.symbol] || 'UNKNOWN').toUpperCase(),
        direction: dir,
        lot_size: parseFloat(row[mapping.lot_size] || '1'),
        entry_price: parseFloat(row[mapping.entry_price] || '0'),
        net_pnl: pnl,
        gross_pnl: pnl,
        result,
        external_id: row[mapping.external_id] || `${dateStr}-${(row[mapping.symbol] || '').toUpperCase()}-${pnl}`,
        source: 'import'
      }
    })

    const { error } = await supabase.from('trades').insert(tradesToInsert as any)
    setLoading(false)

    if (error) {
      toast.error('Failed to import trades. Please check your data format.')
    } else {
      toast.success(`Successfully imported ${tradesToInsert.length} trades!`)
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold">Import Trades</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Upload a CSV file to bulk import trading history.</p>
      </div>

      {step === 1 && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-12 flex flex-col items-center justify-center">
          <FileSpreadsheet className="w-12 h-12 text-[hsl(var(--primary))] mb-4" />
          <h2 className="text-lg font-semibold mb-2">Upload CSV File</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 text-center max-w-md">
            Export your trades from your broker as a CSV file and upload it here.
          </p>
          <label className="cursor-pointer px-6 py-3 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:bg-[hsl(var(--primary)/0.9)] transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Select CSV File
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[hsl(var(--primary))]" />
              File Parsed Successfully ({parsedData.length} rows)
            </h2>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Select Target Account</label>
              <select 
                value={selectedAccount} 
                onChange={e => setSelectedAccount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-charcoal/10 bg-[#FFFFFF] text-[#191D23] text-sm font-medium focus:outline-none focus:border-[#57707A] focus:ring-[3px] focus:ring-[#57707A]/10"
              >
                <option value="">-- Choose Account --</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.account_number || 'No #'})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <h2 className="font-semibold text-lg mb-4">Map Columns</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
              Match your CSV columns to Trading OS fields. We've auto-detected some for you.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {[
                { key: 'date', label: 'Date / Time', req: true },
                { key: 'symbol', label: 'Symbol / Asset', req: true },
                { key: 'direction', label: 'Type (Buy/Sell)', req: true },
                { key: 'lot_size', label: 'Lot Size / Volume', req: true },
                { key: 'entry_price', label: 'Entry Price', req: true },
                { key: 'net_pnl', label: 'Net Profit / P&L', req: true },
                { key: 'external_id', label: 'Ticket / Order ID', req: false },
              ].map(({ key, label, req }) => (
                <div key={key} className="p-4 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))]">
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-2 text-[hsl(var(--muted-foreground))]">
                    {label} {req && <span className="text-[hsl(var(--primary))]">*</span>}
                  </label>
                  <select 
                    value={(mapping as any)[key]} 
                    onChange={e => setMapping({...mapping, [key]: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-charcoal/10 bg-[#FFFFFF] text-[#191D23] text-sm font-medium focus:outline-none focus:border-[#57707A] focus:ring-[3px] focus:ring-[#57707A]/10"
                  >
                    <option value="">-- Ignore --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-lg border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--muted)/0.5)]">
                Cancel
              </button>
              <button 
                onClick={handleImport}
                disabled={loading || !selectedAccount || !mapping.date || !mapping.symbol || !mapping.direction || !mapping.net_pnl}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:bg-[hsl(var(--primary)/0.9)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Importing...' : 'Start Import'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
