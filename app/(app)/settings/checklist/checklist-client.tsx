'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, CheckSquare, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function ChecklistClient({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems)
  const [newItemText, setNewItemText] = useState('')
  const [adding, setAdding] = useState(false)

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    if (!newItemText.trim()) return
    setAdding(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.from('trade_checklist_items').insert({
      user_id: user.id,
      text: newItemText.trim(),
      order_index: items.length
    } as any).select().single()

    setAdding(false)
    if (error) {
      toast.error(error.message)
    } else if (data) {
      toast.success('Checklist item added')
      setItems([...items, data])
      setNewItemText('')
    }
  }

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient()
    const { error } = await (supabase.from('trade_checklist_items') as any).update({ is_active: !current }).eq('id', id)
    if (error) {
      toast.error(error.message)
    } else {
      setItems(items.map(i => i.id === id ? { ...i, is_active: !current } : i))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this checklist item?')) return
    const supabase = createClient()
    const { error } = await supabase.from('trade_checklist_items').delete().eq('id', id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Checklist item deleted')
      setItems(items.filter(i => i.id !== id))
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/settings" className="p-2 rounded-full hover:bg-[hsl(var(--muted))] transition-colors text-[hsl(var(--muted-foreground))]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[hsl(var(--primary))]" />
            Pre-Trade Checklist
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Manage rules you must verify before entering a trade.</p>
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-6">
        <form onSubmit={handleAddItem} className="flex gap-2">
          <input 
            value={newItemText} 
            onChange={e => setNewItemText(e.target.value)} 
            placeholder="e.g. Higher timeframe trend confirmed" 
            className="flex-1 px-3 py-2 rounded-[10px] border border-[hsl(var(--border))] bg-[#FFFFFF] text-[#191D23] text-[14px] focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-[3px] focus:ring-[hsl(var(--primary))/10]"
          />
          <button type="submit" disabled={adding || !newItemText.trim()} className="px-4 py-2 rounded-[10px] bg-[hsl(var(--primary))] text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add
          </button>
        </form>

        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-4">No checklist items configured.</p>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] group">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={item.is_active} 
                    onChange={() => toggleActive(item.id, item.is_active)}
                    className="w-4 h-4 rounded text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
                  />
                  <span className={item.is_active ? 'text-sm font-medium' : 'text-sm font-medium text-[hsl(var(--muted-foreground))] line-through'}>
                    {item.text}
                  </span>
                </div>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
