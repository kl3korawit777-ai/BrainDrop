import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode, CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Plus, Pencil, Trash2, ArrowLeft, Save, X, AlertCircle } from 'lucide-react'
import Logo from '../components/Logo'
import { useAuth } from '../lib/useAuth'
import { useStore } from '../store/useStore'
import { saveContent, deleteContent } from '../lib/contentApi'
import { SUBJECT_CONFIG, getTagStyle, type ContentItem } from '../data/content'

const EMPTY: ContentItem = {
  id: '', title: '', subject: Object.keys(SUBJECT_CONFIG)[0] ?? '',
  tags: [], slidesEmbedUrl: '', driveUrl: '', slideCount: 0,
  updatedAt: new Date().toISOString().slice(0, 10),
}

export default function Admin() {
  const { session, loading, signIn, signOut, configured } = useAuth()
  const { content, loadContent } = useStore()

  useEffect(() => { loadContent() }, [])

  if (!configured) return <NotConfigured />
  if (loading) return <Centered>กำลังโหลด...</Centered>
  if (!session) return <Login onSignIn={signIn} />

  return <Dashboard email={session.user.email ?? ''} content={content} onSignOut={signOut} onChanged={loadContent} />
}

/* ───────────────────────── Layout helpers ───────────────────────── */

function Centered({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      {children}
    </div>
  )
}

function NotConfigured() {
  return (
    <Centered>
      <div style={{ maxWidth: 440, textAlign: 'center', padding: '2rem' }}>
        <AlertCircle size={36} style={{ color: 'var(--accent)', margin: '0 auto 16px' }} />
        <h2 style={{ marginBottom: 10 }}>ยังไม่ได้ตั้งค่า Supabase</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
          สร้างไฟล์ <code style={{ background: 'var(--surface-hover)', padding: '2px 6px', borderRadius: 4 }}>.env.local</code> แล้วใส่
          <br />VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY
          <br />ดูขั้นตอนใน <code style={{ background: 'var(--surface-hover)', padding: '2px 6px', borderRadius: 4 }}>supabase/README.md</code>
        </p>
        <a href="/" style={{ display: 'inline-block', marginTop: 20, color: 'var(--accent)', fontSize: 'var(--text-sm)' }}>← กลับหน้าหลัก</a>
      </div>
    </Centered>
  )
}

/* ───────────────────────── Login ───────────────────────── */

function Login({ onSignIn }: { onSignIn: (e: string, p: string) => Promise<void> }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(''); setBusy(true)
    try { await onSignIn(email, password) }
    catch (err) { setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ') }
    finally { setBusy(false) }
  }

  return (
    <Centered>
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{
          width: 360, maxWidth: '90vw', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 16, padding: '2rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <Logo size={48} />
          <h2 style={{ marginTop: 8 }}>เข้าสู่ระบบ Admin</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>สำหรับจัดการเนื้อหา BrainDrop</p>
        </div>

        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, display: 'block', marginBottom: 6 }}>อีเมล</label>
        <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={{ marginBottom: 14 }} required />

        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, display: 'block', marginBottom: 6 }}>รหัสผ่าน</label>
        <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
          style={{ marginBottom: 18, WebkitTextSecurity: 'disc' } as CSSProperties} required />

        {error && (
          <p style={{ color: '#EF4444', fontSize: 'var(--text-sm)', marginBottom: 14, display: 'flex', gap: 6, alignItems: 'center' }}>
            <AlertCircle size={15} /> {error}
          </p>
        )}

        <button type="submit" disabled={busy} style={{
          width: '100%', padding: '11px', borderRadius: 'var(--radius)', border: 'none',
          background: 'var(--accent)', color: 'white', fontWeight: 600, fontSize: 'var(--text-base)',
          fontFamily: 'var(--font)', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1,
        }}>
          {busy ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>

        <a href="/" style={{ display: 'block', textAlign: 'center', marginTop: 16, color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>← กลับหน้าหลัก</a>
      </motion.form>
    </Centered>
  )
}

/* ───────────────────────── Dashboard ───────────────────────── */

function Dashboard({ email, content, onSignOut, onChanged }: {
  email: string
  content: ContentItem[]
  onSignOut: () => void
  onChanged: () => Promise<void>
}) {
  const [editing, setEditing] = useState<ContentItem | null>(null)

  if (editing) {
    return <EditForm
      item={editing}
      onCancel={() => setEditing(null)}
      onSaved={async () => { await onChanged(); setEditing(null) }}
    />
  }

  async function remove(item: ContentItem) {
    if (!confirm(`ลบ "${item.title}" ?`)) return
    try { await deleteContent(item.id); await onChanged() }
    catch (e) { alert(e instanceof Error ? e.message : 'ลบไม่สำเร็จ') }
  }

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '1.5rem 1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={28} />
          <div>
            <h1 style={{ fontSize: 'var(--text-xl)' }}>จัดการเนื้อหา</h1>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            <ArrowLeft size={15} /> หน้าเว็บ
          </a>
          <button onClick={onSignOut} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
            <LogOut size={15} /> ออก
          </button>
        </div>
      </div>

      {/* Add button */}
      <button onClick={() => setEditing({ ...EMPTY })} style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center',
        padding: '12px', borderRadius: 'var(--radius)', border: '1.5px dashed var(--accent)',
        background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 600,
        fontSize: 'var(--text-base)', fontFamily: 'var(--font)', cursor: 'pointer', marginBottom: 20,
      }}>
        <Plus size={18} /> เพิ่มสรุปใหม่
      </button>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {content.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: 'var(--text-sm)' }}>
            ยังไม่มีเนื้อหา — กดปุ่มด้านบนเพื่อเพิ่ม
          </p>
        )}
        {content.map(item => (
          <div key={item.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '12px 16px',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{item.subject} · {item.slideCount} สไลด์</span>
                {item.tags.map(t => {
                  const s = getTagStyle(t)
                  return <span key={t} style={{ background: s.bg, color: s.color, fontSize: 10, padding: '1px 7px', borderRadius: 20, fontWeight: 600 }}>{t}</span>
                })}
              </div>
            </div>
            <button onClick={() => setEditing(item)} aria-label="แก้ไข" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6 }}>
              <Pencil size={16} />
            </button>
            <button onClick={() => remove(item)} aria-label="ลบ" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 6 }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───────────────────────── Edit form ───────────────────────── */

function EditForm({ item, onCancel, onSaved }: {
  item: ContentItem
  onCancel: () => void
  onSaved: () => Promise<void>
}) {
  const [form, setForm] = useState<ContentItem>(item)
  const [tagInput, setTagInput] = useState(item.tags.join(' '))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isNew = !item.id

  function set<K extends keyof ContentItem>(k: K, v: ContentItem[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const tags = tagInput.split(/[\s,]+/).map(t => t.trim()).filter(Boolean).map(t => t.startsWith('#') ? t : '#' + t)
    const id = form.id || form.title.toLowerCase().replace(/[^a-z0-9ก-๙]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 50) || `item-${Date.now()}`
    if (!form.title.trim()) { setError('กรุณาใส่ชื่อเรื่อง'); return }
    if (!form.slidesEmbedUrl.trim()) { setError('กรุณาใส่ Google Slides embed URL'); return }

    setBusy(true)
    try {
      await saveContent({ ...form, id, tags, updatedAt: new Date().toISOString().slice(0, 10) })
      await onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ')
    } finally { setBusy(false) }
  }

  const labelStyle: CSSProperties = { fontSize: 'var(--text-sm)', fontWeight: 500, display: 'block', marginBottom: 6, marginTop: 16 }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1.5rem 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 'var(--text-sm)' }}>
          <X size={18} /> ยกเลิก
        </button>
        <h1 style={{ fontSize: 'var(--text-xl)', marginLeft: 'auto' }}>{isNew ? 'เพิ่มสรุปใหม่' : 'แก้ไขสรุป'}</h1>
      </div>

      <form onSubmit={submit} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }}>
        <label style={{ ...labelStyle, marginTop: 0 }}>ชื่อเรื่อง *</label>
        <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="ชีววิทยา บทที่ 1–3 เซลล์" required />

        <label style={labelStyle}>วิชา *</label>
        <input type="text" value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="ชีววิทยา" list="subject-list" required />
        <datalist id="subject-list">
          {Object.keys(SUBJECT_CONFIG).map(s => <option key={s} value={s} />)}
        </datalist>

        <label style={labelStyle}>Tags (เว้นวรรคหรือคอมมา)</label>
        <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="#midterm #บทที่1 #สรุป" />

        <label style={labelStyle}>Google Slides embed URL *</label>
        <input type="text" value={form.slidesEmbedUrl} onChange={e => set('slidesEmbedUrl', e.target.value)} placeholder="https://docs.google.com/presentation/d/.../embed" required />

        <label style={labelStyle}>ลิงก์ดาวน์โหลด PDF (ไม่บังคับ)</label>
        <input type="text" value={form.driveUrl ?? ''} onChange={e => set('driveUrl', e.target.value)} placeholder="https://drive.google.com/..." />

        <label style={labelStyle}>จำนวนสไลด์</label>
        <input type="text" inputMode="numeric" value={String(form.slideCount)} onChange={e => set('slideCount', Number(e.target.value.replace(/\D/g, '')) || 0)} placeholder="22" />

        {error && (
          <p style={{ color: '#EF4444', fontSize: 'var(--text-sm)', marginTop: 16, display: 'flex', gap: 6, alignItems: 'center' }}>
            <AlertCircle size={15} /> {error}
          </p>
        )}

        <button type="submit" disabled={busy} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: 'none',
          background: 'var(--accent)', color: 'white', fontWeight: 600, fontSize: 'var(--text-base)',
          fontFamily: 'var(--font)', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1, marginTop: 24,
        }}>
          <Save size={17} /> {busy ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </form>
    </div>
  )
}
