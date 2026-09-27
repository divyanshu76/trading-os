'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { StickyNote, Plus, Search, Pin, Trash2, Edit2, CheckCircle2, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Note } from '@/types/database'

interface NotesClientProps {
  initialNotes: Note[]
}

export function NotesClient({ initialNotes }: NotesClientProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [search, setSearch] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  
  const [form, setForm] = useState({ title: '', content: '' })
  const [saving, setSaving] = useState(false)

  const filteredNotes = notes.filter(n => 
    (n.title.toLowerCase().includes(search.toLowerCase()) || 
     (n.content && n.content.toLowerCase().includes(search.toLowerCase())))
  ).sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })

  async function handleSave() {
    if (!form.title.trim()) return toast.error('Title is required')
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      title: form.title,
      content: form.content,
      folder: 'general' as const,
      is_pinned: editingNote?.is_pinned ?? false,
      updated_at: new Date().toISOString()
    }

    if (editingNote) {
      const { data, error } = await (supabase.from('notes') as any).update(payload as any).eq('id', editingNote.id).select().single()
      if (!error && data) {
        setNotes(notes.map(n => n.id === data.id ? data : n))
        toast.success('Note updated')
      }
    } else {
      const { data, error } = await (supabase.from('notes') as any).insert(payload as any).select().single()
      if (!error && data) {
        setNotes([data, ...notes])
        toast.success('Note created')
      }
    }

    setSaving(false)
    setShowEditor(false)
    setForm({ title: '', content: '' })
    setEditingNote(null)
  }

  async function togglePin(note: Note) {
    const supabase = createClient()
    const newStatus = !note.is_pinned
    await (supabase.from('notes') as any).update({ is_pinned: newStatus }).eq('id', note.id)
    setNotes(notes.map(n => n.id === note.id ? { ...n, is_pinned: newStatus } : n))
  }

  async function deleteNote(id: string) {
    if (!confirm('Delete this note?')) return
    const supabase = createClient()
    await supabase.from('notes').delete().eq('id', id)
    setNotes(notes.filter(n => n.id !== id))
    toast.success('Note deleted')
  }

  function openEditor(note?: Note) {
    if (note) {
      setEditingNote(note)
      setForm({ title: note.title, content: note.content || '' })
    } else {
      setEditingNote(null)
      setForm({ title: '', content: '' })
    }
    setShowEditor(true)
  }

  const inputClass = 'w-full px-3 py-2 rounded-[10px] border border-charcoal/10 bg-[#FFFFFF] text-[#191D23] text-[14px] font-medium placeholder:text-[#979DAB] focus:outline-none focus:border-[#57707A] focus:ring-[3px] focus:ring-[#57707A]/10 transition-all shadow-sm'

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-[hsl(var(--primary))]" />
            Trading Notes
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Capture market observations and ideas.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <input 
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search notes..." 
              className={cn(inputClass, "pl-9")}
            />
          </div>
          <button 
            onClick={() => openEditor()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:bg-[hsl(var(--primary)/0.9)] transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> New Note
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Notes List */}
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
          {filteredNotes.map((note) => (
            <motion.div 
              key={note.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 hover:border-[hsl(var(--ring))] transition-colors group relative flex flex-col h-[200px]"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold truncate pr-6">{note.title}</h3>
                <button 
                  onClick={() => togglePin(note)}
                  className={cn("absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity", note.is_pinned && "opacity-100 text-[hsl(var(--primary))]")}
                >
                  <Pin className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3">
                {new Date(note.updated_at).toLocaleDateString()}
              </p>
              <div className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-4 flex-1 whitespace-pre-wrap">
                {note.content || <span className="italic opacity-50">No content...</span>}
              </div>
              <div className="pt-3 mt-3 border-t border-[hsl(var(--border))] flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditor(note)} className="text-xs font-semibold flex items-center gap-1 hover:text-[hsl(var(--primary))]">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => deleteNote(note.id)} className="text-xs font-semibold flex items-center gap-1 text-[hsl(var(--muted-foreground))] hover:text-loss">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </motion.div>
          ))}

          {filteredNotes.length === 0 && (
            <div className="col-span-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-12 text-center flex flex-col items-center justify-center">
              <FileText className="w-12 h-12 text-[hsl(var(--muted-foreground))] mb-3 opacity-20" />
              <h2 className="text-lg font-semibold">No notes found</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 mb-4">
                {search ? "Try a different search term." : "Create your first trading note to capture your thoughts."}
              </p>
              {!search && (
                <button onClick={() => openEditor()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
                  <Plus className="w-4 h-4" /> Create Note
                </button>
              )}
            </div>
          )}
        </div>

        {/* Editor Modal Overlay */}
        {showEditor && (
          <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h2 className="font-semibold text-lg">{editingNote ? 'Edit Note' : 'New Note'}</h2>
                <button onClick={() => setShowEditor(false)} className="text-[hsl(var(--muted-foreground))] hover:text-charcoal p-1">
                  ✕
                </button>
              </div>
              
              <div className="space-y-4 overflow-y-auto flex-1 min-h-[300px] pr-2 scrollbar-thin">
                <div>
                  <input 
                    value={form.title} 
                    onChange={e => setForm({...form, title: e.target.value})}
                    placeholder="Note Title..."
                    className={cn(inputClass, "text-lg font-semibold px-4 py-3")}
                    autoFocus
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <textarea 
                    value={form.content} 
                    onChange={e => setForm({...form, content: e.target.value})}
                    placeholder="Write your market observations, trade ideas, or general notes here..."
                    className={cn(inputClass, "flex-1 min-h-[300px] resize-none px-4 py-3")}
                  />
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[hsl(var(--border))] flex justify-end gap-3 shrink-0">
                <button 
                  onClick={() => setShowEditor(false)} 
                  className="px-5 py-2.5 rounded-lg border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--muted)/0.5)]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:bg-[hsl(var(--primary)/0.9)]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
