import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode, CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Plus, Pencil, Trash2, ArrowLeft, Save, X, AlertCircle, Image as ImageIcon, FileText, ArrowUp, ArrowDown } from 'lucide-react'
import Logo from '../components/Logo'
import { useAuth } from '../lib/useAuth'
import { useStore } from '../store/useStore'
import {
  saveContent, deleteContent,
  saveSubjectMeta, deleteSubjectMeta, type SubjectMetaRow,
} from '../lib/contentApi'
import { SUBJECT_CONFIG, getTagStyle, type ContentItem } from '../data/content'

const EMPTY: ContentItem = {
  id: '', title: '', subject: '',
  tags: [], slidesEmbedUrl: '', driveUrl: '', canvaUrl: '', slideCount: 0,
  updatedAt: new Date().toISOString().slice(0, 10),
}

export default function Admin() {
  const { session, loading, signIn, signOut, configured } = useAuth()
  const { content, loadContent, subjectMeta, loadSubjectMeta } = useStore()

  useEffect(() => { loadContent(); loadSubjectMeta() }, [])

  if (!configured) return <NotConfigured />
  if (loading) return <Centered>กำลังโหลด...</Centered>
  if (!session) return <Login onSignIn={signIn} />

  return <Dashboard
    email={session.user.email ?? ''}
    content={content}
    subjectMeta={subjectMeta}
    onSignOut={signOut}
    onContentChanged={loadContent}
    onMetaChanged={loadSubjectMeta}
  />
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

function Dashboard({ email, content, subjectMeta, onSignOut, onContentChanged, onMetaChanged }: {
  email: string
  content: ContentItem[]
  subjectMeta: SubjectMetaRow[]
  onSignOut: () => void
  onContentChanged: () => Promise<void>
  onMetaChanged: () => Promise<void>
}) {
  const [tab, setTab] = useState<'summaries' | 'subjects'>('summaries')
  const [editing, setEditing] = useState<ContentItem | null>(null)
  const [editingMeta, setEditingMeta] = useState<SubjectMetaRow | null>(null)

  if (editing) {
    return <EditForm
      item={editing}
      onCancel={() => setEditing(null)}
      onSaved={async () => { await onContentChanged(); setEditing(null) }}
    />
  }
  if (editingMeta) {
    return <EditMetaForm
      item={editingMeta}
      onCancel={() => setEditingMeta(null)}
      onSaved={async () => { await onMetaChanged(); setEditingMeta(null) }}
    />
  }

  async function remove(item: ContentItem) {
    if (!confirm(`ลบ "${item.title}" ?`)) return
    try { await deleteContent(item.id); await onContentChanged() }
    catch (e) { alert(e instanceof Error ? e.message : 'ลบไม่สำเร็จ') }
  }

  async function removeMeta(name: string) {
    if (!confirm(`ลบหมวด/รูปวิชา "${name}" ? (ตัวสรุปจะยังอยู่)`)) return
    try { await deleteSubjectMeta(name); await onMetaChanged() }
    catch (e) { alert(e instanceof Error ? e.message : 'ลบไม่สำเร็จ') }
  }

  async function reorder(name: string, dir: -1 | 1) {
    const sorted = [...subjectMeta].sort((a, b) => a.sortOrder - b.sortOrder)
    const idx = sorted.findIndex(m => m.name === name)
    const swap = idx + dir
    if (idx < 0 || swap < 0 || swap >= sorted.length) return
    const a = sorted[idx], b = sorted[swap]
    try {
      await saveSubjectMeta({ ...a, sortOrder: b.sortOrder })
      await saveSubjectMeta({ ...b, sortOrder: a.sortOrder })
      await onMetaChanged()
    } catch (e) { alert(e instanceof Error ? e.message : 'จัดลำดับไม่สำเร็จ') }
  }

  // วิชาในระบบ = จาก content + จาก subjectMeta
  const allSubjectNames = [...new Set([...content.map(c => c.subject), ...subjectMeta.map(m => m.name)])]
  const metaByName = new Map(subjectMeta.map(m => [m.name, m]))

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '1.5rem 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {([
          { id: 'summaries', label: 'สรุป', Icon: FileText },
          { id: 'subjects', label: 'หมวดหมู่/วิชา', Icon: ImageIcon },
        ] as const).map(({ id, label, Icon }) => {
          const active = tab === id
          return (
            <button key={id} onClick={() => setTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 16px', borderRadius: '8px 8px 0 0',
              background: active ? 'var(--accent-light)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--text-muted)',
              border: 'none', borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
              fontFamily: 'var(--font)', fontSize: 'var(--text-sm)', fontWeight: 600,
              cursor: 'pointer', marginBottom: -1,
            }}>
              <Icon size={15} /> {label}
            </button>
          )
        })}
      </div>

      {tab === 'summaries' && (
        <>
          <button onClick={() => setEditing({ ...EMPTY })} style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center',
            padding: '12px', borderRadius: 'var(--radius)', border: '1.5px dashed var(--accent)',
            background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 600,
            fontSize: 'var(--text-base)', fontFamily: 'var(--font)', cursor: 'pointer', marginBottom: 20,
          }}>
            <Plus size={18} /> เพิ่มสรุปใหม่
          </button>

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
        </>
      )}

      {tab === 'subjects' && (
        <>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 14, lineHeight: 1.6 }}>
            ตั้ง <strong>รูปการ์ดวิชา</strong> ในหน้าแรก, <strong>หมวดหมู่ใหญ่</strong> (ใช้จัดกลุ่มใน sidebar "วิชาทั้งหมด") และ <strong>ลำดับ</strong>
          </p>

          <button
            onClick={() => setEditingMeta({ name: '', coverUrl: '', category: '', sortOrder: (subjectMeta.length ? Math.max(...subjectMeta.map(m => m.sortOrder)) + 1 : 0) })}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center',
              padding: '12px', borderRadius: 'var(--radius)', border: '1.5px dashed var(--accent)',
              background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 600,
              fontSize: 'var(--text-base)', fontFamily: 'var(--font)', cursor: 'pointer', marginBottom: 20,
            }}>
            <Plus size={18} /> เพิ่มหมวด/วิชาใหม่
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {allSubjectNames.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: 'var(--text-sm)' }}>
                ยังไม่มีวิชา — เพิ่มสรุปก่อน หรือกดปุ่มด้านบนเพื่อตั้งวิชาล่วงหน้า
              </p>
            )}
            {allSubjectNames
              .map(n => metaByName.get(n) ?? ({ name: n, sortOrder: 9999 } as SubjectMetaRow))
              .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'th'))
              .map(meta => (
                <div key={meta.name} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: '10px 12px',
                }}>
                  <div style={{
                    width: 56, height: 42, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                    background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {meta.coverUrl
                      ? <img src={meta.coverUrl} alt={meta.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <ImageIcon size={16} style={{ color: 'var(--accent)' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 2 }}>{meta.name}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      หมวด: {meta.category || '—'} · ลำดับ {meta.sortOrder}
                    </p>
                  </div>
                  <button onClick={() => reorder(meta.name, -1)} aria-label="เลื่อนขึ้น" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                    <ArrowUp size={15} />
                  </button>
                  <button onClick={() => reorder(meta.name, 1)} aria-label="เลื่อนลง" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                    <ArrowDown size={15} />
                  </button>
                  <button onClick={() => setEditingMeta({ ...meta, coverUrl: meta.coverUrl ?? '', category: meta.category ?? '' })} aria-label="แก้ไข" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6 }}>
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => removeMeta(meta.name)} aria-label="ลบ" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 6 }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ───────────────────────── Edit subject meta ───────────────────────── */

function EditMetaForm({ item, onCancel, onSaved }: {
  item: SubjectMetaRow
  onCancel: () => void
  onSaved: () => Promise<void>
}) {
  const [name, setName] = useState(item.name)
  const [coverUrl, setCoverUrl] = useState(item.coverUrl ?? '')
  const [category, setCategory] = useState(item.category ?? '')
  const [sortOrder, setSortOrder] = useState(String(item.sortOrder))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isNew = !item.name

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('ใส่ชื่อวิชา'); return }
    setBusy(true)
    try {
      await saveSubjectMeta({
        name: name.trim(),
        coverUrl: coverUrl.trim() || undefined,
        category: category.trim() || undefined,
        sortOrder: Number(sortOrder) || 0,
      })
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
        <h1 style={{ fontSize: 'var(--text-xl)', marginLeft: 'auto' }}>{isNew ? 'เพิ่มหมวด/วิชา' : 'แก้ไขหมวด/วิชา'}</h1>
      </div>

      <form onSubmit={submit} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }}>
        <label style={{ ...labelStyle, marginTop: 0 }}>ชื่อวิชา *</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} disabled={!isNew} required />
        {!isNew && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', marginTop: 4 }}>
            แก้ชื่อวิชาไม่ได้ — ถ้าต้องการเปลี่ยน ให้ลบแล้วเพิ่มใหม่
          </p>
        )}

        <label style={labelStyle}>หมวดหมู่ใหญ่ (เช่น "วิทยาศาสตร์", "ภาษา")</label>
        <input type="text" value={category} onChange={e => setCategory(e.target.value)} />

        <label style={labelStyle}>รูปการ์ดวิชา (URL — ใช้ในหน้าแรก fan)</label>
        <input type="text" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} />
        {coverUrl && (
          <img src={coverUrl} alt="preview" loading="lazy" style={{ marginTop: 8, width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
        )}

        <label style={labelStyle}>ลำดับ (เลขน้อย = แสดงก่อน)</label>
        <input type="text" inputMode="numeric" value={sortOrder} onChange={e => setSortOrder(e.target.value.replace(/\D/g, ''))} />

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

/* ───────────────────────── Edit form ───────────────────────── */

function EditForm({ item, onCancel, onSaved }: {
  item: ContentItem
  onCancel: () => void
  onSaved: () => Promise<void>
}) {
  const [form, setForm] = useState<ContentItem>(item)
  const [tagInput, setTagInput] = useState(item.tags.join(' '))
  // เก็บ slideCount เป็น string เพื่อให้ลบจนว่างได้ (bug fix: เดิม "0" ค้างทำให้พิมพ์ต่อไม่ได้)
  const [slideCountInput, setSlideCountInput] = useState(item.slideCount ? String(item.slideCount) : '')
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
    // ต้องมีแหล่งเนื้อหาอย่างน้อย 1 อย่าง — Google Slides / Canva / Drive / PDF
    if (!form.slidesEmbedUrl.trim() && !form.pdfUrl?.trim() && !form.canvaUrl?.trim()) {
      setError('ใส่ Google Slides, Canva หรือลิงก์ Drive/PDF อย่างน้อย 1 อัน')
      return
    }

    setBusy(true)
    try {
      await saveContent({ ...form, id, tags, slideCount: Number(slideCountInput) || 0, updatedAt: new Date().toISOString().slice(0, 10) })
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
        <input type="text" value={form.title} onChange={e => set('title', e.target.value)} required />

        <label style={labelStyle}>วิชา *</label>
        <input type="text" value={form.subject} onChange={e => set('subject', e.target.value)} list="subject-list" required />
        <datalist id="subject-list">
          {Object.keys(SUBJECT_CONFIG).map(s => <option key={s} value={s} />)}
        </datalist>

        <label style={labelStyle}>Tags (เว้นวรรคหรือคอมมา)</label>
        <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} />

        <label style={labelStyle}>Google Slides embed URL</label>
        <input type="text" value={form.slidesEmbedUrl} onChange={e => set('slidesEmbedUrl', e.target.value)} />
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', marginTop: 4 }}>
          ใส่อันใดอันหนึ่ง: Google Slides, Canva, หรือลิงก์ Drive/PDF (สำหรับสไลด์หน้าเดียว)
        </p>

        <label style={labelStyle}>ลิงก์ Canva (ไม่บังคับ)</label>
        <input type="text" value={form.canvaUrl ?? ''} onChange={e => set('canvaUrl', e.target.value)} />

        <label style={labelStyle}>ลิงก์ดาวน์โหลด PDF (ไม่บังคับ)</label>
        <input type="text" value={form.driveUrl ?? ''} onChange={e => set('driveUrl', e.target.value)} />

        <label style={labelStyle}>ลิงก์ Google Drive — สไลด์เดี่ยว/PDF หน้าเดียว (ไม่บังคับ)</label>
        <input type="text" value={form.pdfUrl ?? ''} onChange={e => set('pdfUrl', e.target.value)} />

        <label style={labelStyle}>รูปปก (URL รูปภาพ — ปล่อยว่างเพื่อดึงจากสไลด์อัตโนมัติ)</label>
        <input type="text" value={form.coverUrl ?? ''} onChange={e => set('coverUrl', e.target.value)} />
        {form.coverUrl && (
          <img src={form.coverUrl} alt="ตัวอย่างรูปปก" loading="lazy" style={{ marginTop: 8, width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
        )}

        <label style={labelStyle}>จำนวนสไลด์</label>
        <input type="text" inputMode="numeric" value={slideCountInput} onChange={e => setSlideCountInput(e.target.value.replace(/\D/g, ''))} />

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
