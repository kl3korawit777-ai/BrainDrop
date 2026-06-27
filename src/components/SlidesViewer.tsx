import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronLeft, ChevronRight, Download, ExternalLink } from 'lucide-react'
import type { ContentItem } from '../data/content'
import { getTagStyle } from '../data/content'
import { useStore } from '../store/useStore'

interface Props {
  item: ContentItem
  onBack: () => void
}

export default function SlidesViewer({ item, onBack }: Props) {
  const { readProgress, setReadProgress } = useStore()
  const currentPage = readProgress[item.id] ?? 1
  const pct = Math.round((currentPage / item.slideCount) * 100)

  function go(delta: number) {
    const next = Math.max(1, Math.min(item.slideCount, currentPage + delta))
    setReadProgress(item.id, next)
  }

  useEffect(() => {
    if (!readProgress[item.id]) setReadProgress(item.id, 1)
  }, [item.id])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1)
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   go(-1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentPage])

  const isPlaceholder = item.slidesEmbedUrl.includes('EXAMPLE_ID')

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
      style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' }}
    >
      {/* Back + title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: '1rem' }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: 14, flexShrink: 0, paddingTop: 2,
        }}>
          <ArrowLeft size={16} /> กลับ
        </button>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3 }}>{item.title}</h2>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
            {item.tags.map(tag => {
              const s = getTagStyle(tag)
              return <span key={tag} style={{ ...s, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>{tag}</span>
            })}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexShrink: 0 }}>
          {item.driveUrl && (
            <a href={item.driveUrl} target="_blank" rel="noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 8,
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', fontSize: 13,
            }}>
              <Download size={14} /> PDF
            </a>
          )}
          <a href={item.slidesEmbedUrl.replace('/embed', '/pub')} target="_blank" rel="noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 12px', borderRadius: 8,
            background: 'var(--surface)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', fontSize: 13,
          }}>
            <ExternalLink size={14} /> เปิดใน Slides
          </a>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: 'var(--text-muted)' }}>
          <span>หน้า {currentPage} / {item.slideCount}</span>
          <span>{pct}%{pct === 100 ? ' · อ่านครบแล้ว ✓' : ''}</span>
        </div>
        <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', background: 'var(--accent)', borderRadius: 3 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Slides iframe */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', overflow: 'hidden',
        aspectRatio: '16/9', position: 'relative',
      }}>
        {isPlaceholder ? (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 12, color: 'var(--text-muted)',
          }}>
            <span style={{ fontSize: 40 }}>🎞️</span>
            <p style={{ fontSize: 14, textAlign: 'center' }}>
              วาง Google Slides embed URL ใน <code style={{ background: 'var(--border)', padding: '2px 6px', borderRadius: 4 }}>content.ts</code>
            </p>
          </div>
        ) : (
          <iframe
            src={item.slidesEmbedUrl}
            title={item.title}
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        )}
      </div>

      {/* Navigation controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: '0.875rem' }}>
        <button onClick={() => go(-1)} disabled={currentPage <= 1} style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '8px 16px',
          borderRadius: 8, border: '1px solid var(--border)',
          background: 'var(--surface)', color: currentPage <= 1 ? 'var(--text-muted)' : 'var(--text)',
          cursor: currentPage <= 1 ? 'default' : 'pointer', fontSize: 13,
        }}>
          <ChevronLeft size={16} /> ก่อนหน้า
        </button>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {currentPage} / {item.slideCount}
        </span>
        <button onClick={() => go(1)} disabled={currentPage >= item.slideCount} style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '8px 16px',
          borderRadius: 8, border: '1px solid var(--border)',
          background: currentPage >= item.slideCount ? 'var(--surface)' : 'var(--accent)',
          color: currentPage >= item.slideCount ? 'var(--text-muted)' : 'white',
          cursor: currentPage >= item.slideCount ? 'default' : 'pointer', fontSize: 13,
        }}>
          ถัดไป <ChevronRight size={16} />
        </button>
      </div>
      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
        กด ← → เพื่อเปลี่ยนหน้า
      </p>
    </motion.div>
  )
}
