import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, ArrowLeft, Search, X, SlidersHorizontal } from 'lucide-react'
import { getTagStyle, coverFor } from '../data/content'
import ContentCard from '../components/ContentCard'
import SlidesViewer from '../components/SlidesViewer'
import SubjectCover from '../components/SubjectCover'
import SocialCards, { type CardItem } from '@/components/ui/card-fan-carousel'
import { useTypewriter, SEARCH_TYPEWRITER_WORDS } from '../components/TypewriterPlaceholder'
import { useStore } from '../store/useStore'

export default function Home() {
  const { searchQuery, setSearchQuery, activeTags, toggleTag, activeSubject, setActiveSubject, setSidebarOpen, content, contentLoading, subjectMeta } = useStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const typedPlaceholder = useTypewriter({ words: SEARCH_TYPEWRITER_WORDS })

  const ALL_TAGS = useMemo(() => [...new Set(content.flatMap(c => c.tags))].sort(), [content])
  const selectedItem = content.find(c => c.id === selectedId)

  // หน้าปกวิชา: แสดงเฉพาะวิชาที่มีสรุปจริง
  // รูปปก: subjectMeta.coverUrl (ตั้งในแอดมิน) > coverUrl ของสรุปแรก > slides thumbnail
  // ลำดับ: ตาม subjectMeta.sortOrder (ถ้ามี) ก่อน
  const subjectCards: CardItem[] = useMemo(() => {
    const counts = new Map<string, number>()
    const slideCover = new Map<string, string>()
    content.forEach(c => {
      counts.set(c.subject, (counts.get(c.subject) ?? 0) + 1)
      if (!slideCover.has(c.subject)) {
        const cv = coverFor(c)
        if (cv) slideCover.set(c.subject, cv)
      }
    })
    const metaMap = new Map(subjectMeta.map(m => [m.name, m]))
    const subjects = [...counts.keys()].sort((a, b) => {
      const oa = metaMap.get(a)?.sortOrder ?? 9999
      const ob = metaMap.get(b)?.sortOrder ?? 9999
      return oa - ob || a.localeCompare(b, 'th')
    })
    return subjects.map(subject => ({
      alt: subject,
      onClick: () => setActiveSubject(subject),
      node: <SubjectCover
        subject={subject}
        count={counts.get(subject) ?? 0}
        coverUrl={metaMap.get(subject)?.coverUrl ?? slideCover.get(subject)}
      />,
    }))
  }, [content, subjectMeta, setActiveSubject])

  // ค้นหาข้ามทุกวิชา (ใช้บนหน้า "ทั้งหมด")
  const searchResults = useMemo(() => content.filter(item => {
    const q = searchQuery.toLowerCase()
    const matchSearch = !q
      || item.title.toLowerCase().includes(q)
      || item.subject.toLowerCase().includes(q)
      || item.tags.some(t => t.includes(q))
    const matchTags = activeTags.length === 0 || activeTags.every(t => item.tags.includes(t))
    return matchSearch && matchTags
  }), [content, searchQuery, activeTags])

  // รายการสรุปของวิชาที่เลือก
  const subjectItems = useMemo(
    () => content.filter(item => item.subject === activeSubject),
    [content, activeSubject],
  )

  if (selectedItem) {
    return <SlidesViewer item={selectedItem} onBack={() => setSelectedId(null)} />
  }

  // ───────── หน้า "ทั้งหมด": fan วิชา + ค้นหา/filter ด้านบน ─────────
  if (activeSubject === 'ทั้งหมด') {
    const searching = searchQuery.trim() !== '' || activeTags.length > 0
    return (
      <div className="home-fan-wrap" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        {/* แถบค้นหา/filter ด้านบน */}
        <div className="home-search-row" style={{ padding: '1.4rem 1.25rem 0', maxWidth: 720, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="เปิดเมนู"
              className="flex md:hidden"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', alignItems: 'center', padding: 4 }}
            >
              <Menu size={22} />
            </button>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="search"
                placeholder={typedPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 38, paddingRight: searchQuery ? 36 : 16 }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="ล้างการค้นหา"
                  style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              aria-label="แสดง/ซ่อน filters"
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', borderRadius: 'var(--radius)',
                border: `1px solid ${showFilters || activeTags.length > 0 ? 'var(--accent)' : 'var(--border-strong)'}`,
                background: showFilters || activeTags.length > 0 ? 'var(--accent-light)' : 'var(--surface)',
                color: showFilters || activeTags.length > 0 ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 500,
                boxShadow: 'var(--shadow-sm)', whiteSpace: 'nowrap', transition: 'all 0.15s',
              }}
            >
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline">Filters</span>
              {activeTags.length > 0 && (
                <span style={{ background: 'var(--accent)', color: 'white', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>
                  {activeTags.length}
                </span>
              )}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ overflow: 'hidden', marginTop: 10 }}
              >
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.875rem 1rem', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>กรองตาม Tag</p>
                    {activeTags.length > 0 && (
                      <button onClick={() => activeTags.forEach(t => toggleTag(t))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 12, fontFamily: 'inherit', fontWeight: 500 }}>
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
                          fontSize: 12, fontWeight: active ? 600 : 400, fontFamily: 'inherit', transition: 'all 0.15s',
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
        </div>

        {/* ผลลัพธ์: ถ้ากำลังค้นหา → รายการสรุป, ไม่งั้น → fan วิชา */}
        {searching ? (
          <div style={{ maxWidth: 960, margin: '0 auto', width: '100%', padding: '1.25rem 1.25rem 2rem' }}>
            {searchResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                <Search size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p style={{ fontSize: 15, fontWeight: 500 }}>ไม่พบเนื้อหาที่ตรงกัน</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 14 }}>
                {searchResults.map((item, i) => (
                  <ContentCard key={item.id} item={item} index={i} onClick={() => setSelectedId(item.id)} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <div style={{ width: '100%' }}>
              {contentLoading
                ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>กำลังโหลด...</p>
                : <SocialCards cards={subjectCards} />}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ───────── หน้ารายวิชา: ชื่อวิชา + รายการสไลด์เท่านั้น ─────────
  return (
    <div style={{ padding: '1.5rem 1.25rem', maxWidth: 960, margin: '0 auto' }}>

      {/* Mobile: hamburger + ชื่อวิชา */}
      <div className="flex md:hidden" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="เปิดเมนู"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}
        >
          <Menu size={22} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>{activeSubject}</h1>
      </div>

      {/* Desktop: ปุ่มกลับ + ชื่อวิชา */}
      <motion.div
        className="hidden md:flex"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}
      >
        <button
          onClick={() => setActiveSubject('ทั้งหมด')}
          aria-label="กลับหน้าหลัก"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px' }}>{activeSubject}</h1>
      </motion.div>

      {/* รายการสไลด์ */}
      <AnimatePresence mode="wait">
        {contentLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 14 }}>กำลังโหลด...</p>
          </motion.div>
        ) : subjectItems.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            <Search size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 15, fontWeight: 500 }}>ยังไม่มีสรุปในวิชานี้</p>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 14 }}>
            {subjectItems.map((item, i) => (
              <ContentCard key={item.id} item={item} index={i} onClick={() => setSelectedId(item.id)} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
