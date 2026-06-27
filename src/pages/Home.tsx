import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Menu, SlidersHorizontal } from 'lucide-react'
import { getTagStyle } from '../data/content'
import ContentCard from '../components/ContentCard'
import SlidesViewer from '../components/SlidesViewer'
import ContactFooter from '../components/ContactFooter'
import { useStore } from '../store/useStore'

export default function Home() {
  const { searchQuery, setSearchQuery, activeTags, toggleTag, activeSubject, setSidebarOpen, content, contentLoading } = useStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const ALL_TAGS = useMemo(() => [...new Set(content.flatMap(c => c.tags))].sort(), [content])

  const selectedItem = content.find(c => c.id === selectedId)

  const filtered = useMemo(() => content.filter(item => {
    const q = searchQuery.toLowerCase()
    const matchSearch = !q
      || item.title.toLowerCase().includes(q)
      || item.subject.toLowerCase().includes(q)
      || item.tags.some(t => t.includes(q))
    const matchTags = activeTags.length === 0 || activeTags.every(t => item.tags.includes(t))
    const matchSubject = activeSubject === 'ทั้งหมด' || item.subject === activeSubject
    return matchSearch && matchTags && matchSubject
  }), [content, searchQuery, activeTags, activeSubject])

  if (selectedItem) {
    return <SlidesViewer item={selectedItem} onBack={() => setSelectedId(null)} />
  }

  return (
    <div style={{ padding: '1.5rem 1.25rem', maxWidth: 960, margin: '0 auto' }}>

      {/* Mobile top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }} className="flex md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="เปิดเมนู"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}
        >
          <Menu size={22} />
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px' }}>BrainDrop</h1>
      </div>

      {/* Desktop heading */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{ marginBottom: '1.25rem' }}
        className="hidden md:block"
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px' }}>
          {activeSubject === 'ทั้งหมด' ? 'สรุปทั้งหมด' : activeSubject}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginTop: 4 }}>
          {content.length} ชุดสรุป · อัปเดตล่าสุดวันนี้
          {' '}<a href="/admin" style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)', marginLeft: 6 }}>· จัดการ</a>
        </p>
      </motion.div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.38 }}
        style={{ position: 'relative', marginBottom: '0.875rem', display: 'flex', gap: 8 }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} style={{
            position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            type="search"
            placeholder="ค้นหาวิชา, หัวข้อ, หรือ tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 38, paddingRight: searchQuery ? 36 : 16 }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="ล้างการค้นหา"
              style={{
                position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                display: 'flex', padding: 2,
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          aria-label="แสดง/ซ่อน filters"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 14px', borderRadius: 'var(--radius)',
            border: `1px solid ${showFilters || activeTags.length > 0 ? 'var(--accent)' : 'var(--border-strong)'}`,
            background: showFilters || activeTags.length > 0 ? 'var(--accent-light)' : 'var(--surface)',
            color: showFilters || activeTags.length > 0 ? 'var(--accent)' : 'var(--text-muted)',
            cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 500,
            boxShadow: 'var(--shadow-sm)', whiteSpace: 'nowrap',
            transition: 'all 0.15s',
          }}
        >
          <SlidersHorizontal size={15} />
          <span className="hidden sm:inline">Filters</span>
          {activeTags.length > 0 && (
            <span style={{
              background: 'var(--accent)', color: 'white',
              fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10,
            }}>
              {activeTags.length}
            </span>
          )}
        </button>
      </motion.div>

      {/* Tag filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ overflow: 'hidden', marginBottom: '1rem' }}
          >
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '0.875rem 1rem',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  กรองตาม Tag
                </p>
                {activeTags.length > 0 && (
                  <button
                    onClick={() => activeTags.forEach(t => toggleTag(t))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 12, fontFamily: 'inherit', fontWeight: 500 }}
                  >
                    ล้างทั้งหมด
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ALL_TAGS.map(tag => {
                  const active = activeTags.includes(tag)
                  const s = getTagStyle(tag)
                  return (
                    <button key={tag} onClick={() => toggleTag(tag)} style={{
                      padding: '4px 12px', borderRadius: 20, cursor: 'pointer',
                      border: active ? `1.5px solid ${s.color}` : '1px solid var(--border-strong)',
                      background: active ? s.bg : 'transparent',
                      color: active ? s.color : 'var(--text-muted)',
                      fontSize: 12, fontWeight: active ? 600 : 400,
                      fontFamily: 'inherit', transition: 'all 0.15s',
                    }}>
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result count */}
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
        {filtered.length} รายการ{activeTags.length > 0 || searchQuery ? ' (กรองแล้ว)' : ''}
      </p>

      {/* Card grid */}
      <AnimatePresence mode="wait">
        {contentLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}
          >
            <p style={{ fontSize: 14 }}>กำลังโหลด...</p>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: 'center', padding: '4rem 0',
              color: 'var(--text-muted)',
            }}
          >
            <Search size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>ไม่พบเนื้อหาที่ตรงกัน</p>
            <p style={{ fontSize: 13 }}>ลองเปลี่ยน keyword หรือ tag ที่กรองไว้</p>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 14 }}>
            {filtered.map((item, i) => (
              <ContentCard key={item.id} item={item} index={i} onClick={() => setSelectedId(item.id)} />
            ))}
          </div>
        )}
      </AnimatePresence>

      <ContactFooter />
    </div>
  )
}
