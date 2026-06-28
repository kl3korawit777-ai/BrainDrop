import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, X, ChevronDown, Menu, Eraser } from 'lucide-react'
import type { ContentItem } from '../data/content'
import { coverFor, getTagStyle } from '../data/content'
import { useTypewriter, SEARCH_TYPEWRITER_WORDS } from '../components/TypewriterPlaceholder'
import { useStore } from '../store/useStore'

interface Props {
  onOpenItem: (id: string) => void
}

const UNCATEGORIZED = 'ไม่จัดหมวด'

/** หน้า "วิชาทั้งหมด" — sidebar หมวดหมู่ (แอดมินจัดได้) → วิชา → tags */
export default function AllSubjects({ onOpenItem }: Props) {
  const { content, contentLoading, setSidebarOpen, subjectMeta } = useStore()
  const [query, setQuery] = useState('')
  const [activeSubject, setActiveSubject] = useState<string | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [openSubject, setOpenSubject] = useState<string | null>(null)
  const [openCategory, setOpenCategory] = useState<Set<string>>(() => new Set())
  const typedPlaceholder = useTypewriter({ words: SEARCH_TYPEWRITER_WORDS })

  // ─── tree: หมวดหมู่ → วิชา → tags ───
  const tree = useMemo(() => {
    const subjectMap = new Map<string, { tags: Set<string>; count: number }>()
    content.forEach(c => {
      const cur = subjectMap.get(c.subject) ?? { tags: new Set<string>(), count: 0 }
      c.tags.forEach(t => cur.tags.add(t))
      cur.count += 1
      subjectMap.set(c.subject, cur)
    })

    const metaMap = new Map(subjectMeta.map(m => [m.name, m]))

    const catGroups = new Map<string, { subject: string; tags: string[]; count: number; sortOrder: number }[]>()
    for (const [subject, { tags, count }] of subjectMap) {
      const meta = metaMap.get(subject)
      const cat = meta?.category || UNCATEGORIZED
      const item = { subject, tags: [...tags].sort(), count, sortOrder: meta?.sortOrder ?? 9999 }
      if (!catGroups.has(cat)) catGroups.set(cat, [])
      catGroups.get(cat)!.push(item)
    }
    for (const list of catGroups.values()) {
      list.sort((a, b) => a.sortOrder - b.sortOrder || a.subject.localeCompare(b.subject, 'th'))
    }

    const catOrder = new Map<string, number>()
    subjectMeta.forEach(m => {
      if (m.category && !catOrder.has(m.category)) catOrder.set(m.category, m.sortOrder)
    })

    return [...catGroups.entries()]
      .sort(([a], [b]) => {
        if (a === UNCATEGORIZED) return 1
        if (b === UNCATEGORIZED) return -1
        return (catOrder.get(a) ?? 9999) - (catOrder.get(b) ?? 9999) || a.localeCompare(b, 'th')
      })
      .map(([category, subjects]) => ({ category, subjects }))
  }, [content, subjectMeta])

  // เปิดหมวดหมู่ทุกหมวดอัตโนมัติเมื่อ tree เปลี่ยน (ครั้งแรก)
  useMemo(() => {
    setOpenCategory(prev => {
      if (prev.size > 0) return prev
      return new Set(tree.map(t => t.category))
    })
  }, [tree])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return content.filter(c => {
      if (activeSubject && c.subject !== activeSubject) return false
      if (activeTag && !c.tags.includes(activeTag)) return false
      if (!q) return true
      return c.title.toLowerCase().includes(q)
        || c.subject.toLowerCase().includes(q)
        || c.tags.some(t => t.includes(q))
    })
  }, [content, query, activeSubject, activeTag])

  function clearFilters() {
    setQuery(''); setActiveSubject(null); setActiveTag(null)
  }
  const hasFilter = !!query || !!activeSubject || !!activeTag

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0.875rem 1.25rem',
        background: 'var(--bg)', borderBottom: '1px solid var(--border)',
      }}>
        <button onClick={() => setSidebarOpen(true)} aria-label="เปิดเมนู" className="flex md:hidden"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
          <Menu size={20} />
        </button>
        <div style={{ position: 'relative', flex: 1, maxWidth: 560 }}>
          <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input type="search" placeholder={typedPlaceholder}
            value={query} onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: 38, paddingRight: query ? 36 : 16 }} />
          {query && (
            <button onClick={() => setQuery('')} aria-label="ล้าง"
              style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}>
              <X size={14} />
            </button>
          )}
        </div>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', padding: '6px 12px', background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
          {filtered.length} รายการ
        </span>
      </div>

      <div style={{ display: 'flex', flex: 1, alignItems: 'flex-start' }}>
        {/* Left: หมวดหมู่ → วิชา → tags */}
        <aside style={{
          width: 240, flexShrink: 0, padding: '1.25rem 1rem',
          borderRight: '1px solid var(--border)', background: 'var(--surface)',
          minHeight: 'calc(100vh - 56px)',
        }} className="hidden md:block">
          <p style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, padding: '0 6px' }}>
            หมวดหมู่
          </p>

          {tree.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '0 6px' }}>ยังไม่มีวิชา</p>
          ) : (
            tree.map(({ category, subjects }) => {
              const catOpen = openCategory.has(category)
              return (
                <div key={category} style={{ marginBottom: 8 }}>
                  <button
                    onClick={() => setOpenCategory(prev => {
                      const next = new Set(prev)
                      if (next.has(category)) next.delete(category); else next.add(category)
                      return next
                    })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                      padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font)', fontSize: 11.5, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      background: 'transparent', color: 'var(--text-subtle)', textAlign: 'left',
                    }}
                  >
                    <ChevronDown size={12} style={{ transform: catOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
                    <span style={{ flex: 1 }}>{category}</span>
                  </button>

                  {catOpen && subjects.map(({ subject, tags, count }) => {
                    const isOpen = openSubject === subject
                    const isActive = activeSubject === subject
                    return (
                      <div key={subject} style={{ marginLeft: 4 }}>
                        <button
                          onClick={() => {
                            setActiveSubject(isActive ? null : subject)
                            setActiveTag(null)
                            setOpenSubject(isOpen ? null : subject)
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                            padding: '7px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                            fontFamily: 'var(--font)', fontSize: 13,
                            fontWeight: isActive ? 600 : 500,
                            background: isActive ? 'var(--accent-light)' : 'transparent',
                            color: isActive ? 'var(--accent)' : 'var(--text)',
                            transition: 'all 0.15s', textAlign: 'left',
                          }}
                        >
                          <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: isActive ? 'var(--accent)' : 'var(--accent-mid)',
                            flexShrink: 0,
                          }} />
                          <span style={{ flex: 1 }}>{subject}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{count}</span>
                          {tags.length > 0 && (
                            <ChevronDown size={13} style={{
                              color: 'var(--text-subtle)',
                              transform: isOpen ? 'rotate(180deg)' : 'none',
                              transition: 'transform 0.2s',
                            }} />
                          )}
                        </button>

                        {isOpen && tags.length > 0 && (
                          <div style={{ paddingLeft: 22, marginTop: 2 }}>
                            {tags.map(tag => {
                              const tagActive = activeTag === tag
                              return (
                                <button key={tag}
                                  onClick={() => {
                                    setActiveSubject(subject)
                                    setActiveTag(tagActive ? null : tag)
                                  }}
                                  style={{
                                    display: 'block', width: '100%', textAlign: 'left',
                                    padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                                    fontFamily: 'var(--font)', fontSize: 12.5,
                                    background: tagActive ? 'var(--accent-light)' : 'transparent',
                                    color: tagActive ? 'var(--accent)' : 'var(--text-muted)',
                                    fontWeight: tagActive ? 600 : 400,
                                    marginBottom: 1,
                                  }}
                                >
                                  {tag}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })
          )}

          {hasFilter && (
            <button onClick={clearFilters}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: '100%', marginTop: 16, padding: '8px 12px',
                borderRadius: 8, border: '1px dashed var(--border-strong)',
                background: 'transparent', color: 'var(--text-muted)',
                fontFamily: 'var(--font)', fontSize: 12.5, cursor: 'pointer',
              }}>
              <Eraser size={13} /> ล้างตัวกรอง
            </button>
          )}
        </aside>

        {/* Right: grid */}
        <main style={{ flex: 1, padding: '1.25rem 1.5rem', minWidth: 0 }}>
          {contentLoading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, padding: '4rem 0' }}>กำลังโหลด...</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0' }}>
              <Search size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: 15, fontWeight: 500 }}>ไม่พบเนื้อหา</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 18 }}>
              {filtered.map((item, i) => (
                <PhotoCard key={item.id} item={item} index={i} onClick={() => onOpenItem(item.id)} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function PhotoCard({ item, index, onClick }: { item: ContentItem; index: number; onClick: () => void }) {
  const cover = coverFor(item)
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035, duration: 0.3 }}
      whileHover={{ y: -3 }}
      onClick={onClick}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
        boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column',
        transition: 'box-shadow 0.18s',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'}
    >
      <div style={{ aspectRatio: '16/10', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, var(--accent-light), var(--surface-hover))' }}>
        {cover && (
          <img src={cover} alt={item.title} loading="lazy" referrerPolicy="no-referrer"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>
      <div style={{ padding: '0.875rem 1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text)', lineHeight: 1.35, margin: 0 }}>{item.title}</h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.subject}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {item.tags.map(t => {
            const s = getTagStyle(t)
            return (
              <span key={t} style={{ background: s.bg, color: s.color, padding: '2px 9px', borderRadius: 20, fontSize: 10.5, fontWeight: 600 }}>{t}</span>
            )
          })}
        </div>
      </div>
    </motion.article>
  )
}
