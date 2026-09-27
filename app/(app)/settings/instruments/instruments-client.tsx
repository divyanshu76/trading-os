'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, Settings2, Plus, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const instrumentSchema = z.object({
  symbol: z.string().min(1, 'Symbol required').transform(s => s.toUpperCase()),
  display_name: z.string().optional(),
  category: z.enum(['forex','metals','indices','crypto','stocks','futures','other']),
  tick_size: z.number().min(0.00000001),
  tick_value: z.number().min(0.00000001),
  contract_size: z.number().min(1),
  digits: z.number().min(0).max(10),
  currency: z.string().min(1),
  point_size: z.number().min(0.00000001),
})

type InstrumentForm = z.infer<typeof instrumentSchema>

export function InstrumentsClient({ initialInstruments }: { initialInstruments: any[] }) {
  const [instruments, setInstruments] = useState(initialInstruments)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InstrumentForm>({
    resolver: zodResolver(instrumentSchema),
    defaultValues: {
      category: 'forex', tick_size: 0.00001, tick_value: 1, contract_size: 100000, digits: 5, currency: 'USD', point_size: 0.00001
    }
  })

  function openNew() {
    reset()
    setEditingId(null)
    setShowModal(true)
  }

  function openEdit(instrument: any) {
    if (instrument.user_id === null) {
      toast.error('Cannot edit global default instruments. Create a custom one instead.')
      return
    }
    reset(instrument)
    setEditingId(instrument.id)
    setShowModal(true)
  }

  async function onSubmit(data: InstrumentForm) {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = { ...data, user_id: user.id, is_custom: true }

    if (editingId) {
      const { error } = await (supabase.from('instruments') as any).update(payload).eq('id', editingId)
      if (error) toast.error(error.message)
      else {
        toast.success('Instrument updated')
        setInstruments(instruments.map(i => i.id === editingId ? { ...i, ...payload } : i))
        setShowModal(false)
      }
    } else {
      const { data: newInst, error } = await (supabase.from('instruments') as any).insert(payload).select().single()
      if (error) {
        if (error.code === '23505') toast.error('An instrument with this symbol already exists.')
        else toast.error(error.message)
      } else {
        toast.success('Instrument added')
        setInstruments([...instruments, newInst])
        setShowModal(false)
      }
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this custom instrument?')) return
    const supabase = createClient()
    const { error } = await supabase.from('instruments').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Instrument deleted')
      setInstruments(instruments.filter(i => i.id !== id))
    }
  }

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[#FFFFFF] text-[#191D23] text-[14px] focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-[3px] focus:ring-[hsl(var(--primary))/10]'
  const labelClass = 'block text-xs font-semibold mb-1 text-charcoal'

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/settings" className="p-2 rounded-full hover:bg-[hsl(var(--muted))] transition-colors text-[hsl(var(--muted-foreground))]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-[hsl(var(--primary))]" />
              Instruments
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Configure specification rules for precise lot sizing calculations.</p>
          </div>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:bg-[hsl(var(--primary)/0.9)]">
          <Plus className="w-4 h-4" /> Add Instrument
        </button>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-b border-[hsl(var(--border))]">
              <tr>
                <th className="px-4 py-3 font-semibold">Symbol</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Contract Size</th>
                <th className="px-4 py-3 font-semibold">Tick Size</th>
                <th className="px-4 py-3 font-semibold">Tick Value</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {instruments.map(inst => (
                <tr key={inst.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted)/0.5)]">
                  <td className="px-4 py-3 font-bold">{inst.symbol}</td>
                  <td className="px-4 py-3 capitalize">{inst.category}</td>
                  <td className="px-4 py-3 tabular-nums">{inst.contract_size}</td>
                  <td className="px-4 py-3 tabular-nums">{inst.tick_size}</td>
                  <td className="px-4 py-3 tabular-nums">{inst.tick_value}</td>
                  <td className="px-4 py-3">
                    {inst.user_id ? <span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded text-xs font-semibold">Custom</span> : <span className="px-2 py-1 bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] rounded text-xs font-medium">Global</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(inst)} className="p-1.5 text-[hsl(var(--muted-foreground))] hover:text-charcoal"><Edit className="w-4 h-4" /></button>
                    {inst.user_id && (
                      <button onClick={() => handleDelete(inst.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded ml-1"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-6">
            <h2 className="font-semibold text-lg">{editingId ? 'Edit Instrument' : 'Add Custom Instrument'}</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Symbol <span className="text-red-500">*</span></label>
                  <input {...register('symbol')} placeholder="e.g. BTCUSD" className={inputClass} />
                  {errors.symbol && <p className="text-red-500 text-xs mt-1">{errors.symbol.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <select {...register('category')} className={inputClass}>
                    {['forex','metals','indices','crypto','stocks','futures','other'].map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Contract Size</label>
                  <input type="number" step="0.01" {...register('contract_size', { valueAsNumber: true })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Currency</label>
                  <input {...register('currency')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Tick Size</label>
                  <input type="number" step="0.00000001" {...register('tick_size', { valueAsNumber: true })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Tick Value</label>
                  <input type="number" step="0.00000001" {...register('tick_value', { valueAsNumber: true })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Point Size</label>
                  <input type="number" step="0.00000001" {...register('point_size', { valueAsNumber: true })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Digits</label>
                  <input type="number" {...register('digits', { valueAsNumber: true })} className={inputClass} />
                </div>
              </div>

              <div className="pt-4 border-t border-[hsl(var(--border))] flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
                  {saving ? 'Saving...' : 'Save Instrument'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
