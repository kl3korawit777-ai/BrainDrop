import { motion } from 'framer-motion'
import {
  Presentation, FileText, Atom, Calculator,
  Book, FlaskConical, Globe, Music, Code,
} from 'lucide-react'
import type { ContentItem } from '../data/content'
import { getTagStyle, SUBJECT_CONFIG, coverFor } from '../data/content'
import { useStore } from '../store/useStore'

// Map iconType string → Lucide component
const ICON_MAP = {
  'atom':         Atom,
  'file-text':    FileText,
  'presentation': Presentation,
  'calculator':   Calculator,
  'book':         Book,
  'flask':        FlaskConical,
  'globe':        Globe,
  'music':        Music,
  'code':         Code,
} as const

const DEFAULT_META = {
  gradient: ['#EFF6FF', '#BAE6FD'] as [string, string],
  iconColor: '#1D4ED8',
  iconType: 'presentation' as const,
}

interface Props {
  item: ContentItem
  index: number
  onClick: () => void
}

export default function ContentCard({ item, index, onClick }: Props) {
  const readProgress = useStore(s => s.readProgress[item.id] ?? 0)
  const pct = item.slideCount > 0 ? Math.round((readProgress / item.slideCount) * 100) : 0

  const meta = SUBJECT_CONFIG[item.subject] ?? DEFAULT_META
  const Icon = ICON_MAP[meta.iconType] ?? Presentation
  const [gradFrom, gradTo] = meta.gradient

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.055, duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden', cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow 0.18s, border-color 0.18s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = 'var(--shadow-md)'
        el.style.borderColor = 'var(--border-strong)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = 'var(--shadow-sm)'
        el.style.borderColor = 'var(--border)'
      }}
    >
      {/* Thumbnail — รูปปกถ้ามี ไม่งั้น gradient + ไอคอน */}
      <div style={{
        height: 92,
        background: `linear-gradient(135deg, ${gradFrom} 0%, ${gradTo} 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {(() => {
          const cover = coverFor(item)
          return cover ? (
            <img src={cover} alt={item.title} loading="lazy" referrerPolicy="no-referrer" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Icon size={34} color={meta.iconColor} strokeWidth={1.5} />
          )
        })()}
        {pct === 100 && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: '#10B981', color: 'white',
            fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-bold)',
            padding: '2px 8px', borderRadius: 20, letterSpacing: '0.05em',
          }}>
            DONE
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '0.875rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{
          fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)',
          color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase',
        }}>
          {item.subject}
        </p>

        <h3 style={{
          fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-semibold)',
          color: 'var(--text)', lineHeight: 1.45, margin: 0,
        }}>
          {item.title}
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {item.tags.map(tag => {
            const s = getTagStyle(tag)
            return (
              <span key={tag} style={{
                background: s.bg, color: s.color,
                padding: '2px 8px', borderRadius: 20,
                fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)',
              }}>
                {tag}
              </span>
            )
          })}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 6 }}>
          <div style={{ height: 3, borderRadius: 2, background: 'var(--border-strong)', overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', borderRadius: 2, background: pct === 100 ? '#10B981' : 'var(--accent)' }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: index * 0.055 + 0.2, duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-subtle)', marginTop: 5 }}>
            {pct === 0
              ? `${item.slideCount} สไลด์`
              : pct === 100
              ? 'อ่านครบแล้ว'
              : `${pct}% · เหลืออีก ${item.slideCount - readProgress} สไลด์`}
          </p>
        </div>
      </div>
    </motion.article>
  )
}
