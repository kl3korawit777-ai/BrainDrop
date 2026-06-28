import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, ExternalLink, Maximize2, Check, MoveHorizontal } from 'lucide-react'
import type { ContentItem } from '../data/content'
import { getTagStyle, toSlidesOpenUrl, chooseEmbedSrc } from '../data/content'
import { useStore } from '../store/useStore'

interface Props {
  item: ContentItem
  onBack: () => void
}

export default function SlidesViewer({ item, onBack }: Props) {
  const { readProgress, setReadProgress } = useStore()
  const isDone = (readProgress[item.id] ?? 0) >= item.slideCount
  const iframeRef = useRef<HTMLIFrameElement>(null)

  function goFullscreen() {
    iframeRef.current?.requestFullscreen?.()
  }

  function toggleDone() {
    setReadProgress(item.id, isDone ? 0 : item.slideCount)
  }

  const embedSrc = chooseEmbedSrc(item)
  const hasSlides = item.slidesEmbedUrl && !item.slidesEmbedUrl.includes('EXAMPLE_ID')
  const isPdfFallback = !hasSlides && !!item.pdfUrl

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
      style={{ maxWidth: 1180, margin: '0 auto', padding: '1.25rem 1.5rem' }}
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
          <button onClick={goFullscreen} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
            background: 'var(--surface)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', fontSize: 13,
          }}>
            <Maximize2 size={14} /> เต็มจอ
          </button>
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
          {hasSlides && (
            <a href={toSlidesOpenUrl(item.slidesEmbedUrl)} target="_blank" rel="noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 8,
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', fontSize: 13,
            }}>
              <ExternalLink size={14} /> เปิดใน Slides
            </a>
          )}
          {item.canvaUrl && (
            <a href={item.canvaUrl} target="_blank" rel="noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 8,
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', fontSize: 13,
            }}>
              <ExternalLink size={14} /> เปิดใน Canva
            </a>
          )}
        </div>
      </div>

      {/* Slides iframe — บนมือถือจอใหญ่ขึ้น + touch-action ให้กดปุ่ม < > ใน Slides ง่าย */}
      <div
        className="slides-frame"
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', overflow: 'hidden',
          position: 'relative',
          touchAction: 'manipulation',
        }}
      >
        {!embedSrc ? (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 12, color: 'var(--text-muted)', padding: 20, textAlign: 'center',
          }}>
            <span style={{ fontSize: 40 }}>🎞️</span>
            <p style={{ fontSize: 14 }}>
              ยังไม่มีเนื้อหา — ใส่ Google Slides URL หรือลิงก์ Drive/PDF ใน Admin
            </p>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            key={item.id}
            src={embedSrc}
            title={item.title}
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          />
        )}
      </div>
      <style>{`
        .slides-frame { aspect-ratio: 16 / 9; }
        @media (max-width: 720px) {
          .slides-frame {
            aspect-ratio: auto;
            height: 62dvh;
            min-height: 360px;
          }
        }
      `}</style>

      {/* Hint + mark-as-read */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, marginTop: '0.875rem',
      }}>
        <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-muted)' }}>
          <MoveHorizontal size={15} />
          {isPdfFallback
            ? <>หน้าเดียวจาก Drive · กด <strong style={{ color: 'var(--text)' }}>เต็มจอ</strong> เพื่อดูใหญ่</>
            : <>มือถือ: กด <strong style={{ color: 'var(--text)' }}>เต็มจอ</strong> จะ swipe ซ้าย/ขวา ได้สะดวกกว่า · หรือใช้ลูกศร <strong style={{ color: 'var(--text)' }}>‹ ›</strong> มุมล่างของสไลด์</>}
        </p>
        <button onClick={toggleDone} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
          borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          border: isDone ? '1px solid var(--accent)' : '1px solid var(--border)',
          background: isDone ? 'var(--accent)' : 'var(--surface)',
          color: isDone ? 'white' : 'var(--text-muted)',
          transition: 'all 0.2s',
        }}>
          <Check size={16} /> {isDone ? 'อ่านจบแล้ว' : 'ทำเครื่องหมายว่าอ่านจบ'}
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: '0.75rem' }}>
        <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', background: 'var(--accent)', borderRadius: 3 }}
            animate={{ width: isDone ? '100%' : '0%' }}
            transition={{ duration: 0.35 }}
          />
        </div>
      </div>
    </motion.div>
  )
}
