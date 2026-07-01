import { useState } from 'react'
import {
  Presentation, FileText, Atom, Calculator,
  Book, FlaskConical, Globe, Music, Code,
} from 'lucide-react'
import { SUBJECT_CONFIG } from '../data/content'

// iconType → Lucide component (ชุดเดียวกับ ContentCard)
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
  subject: string
  count: number
  coverUrl?: string
}

/** หน้าปกของวิชา — ใช้รูปถ้ามี (coverUrl) ไม่งั้น gradient + ไอคอน */
export default function SubjectCover({ subject, count, coverUrl }: Props) {
  const meta = SUBJECT_CONFIG[subject] ?? DEFAULT_META
  const Icon = ICON_MAP[meta.iconType] ?? Presentation
  const [from, to] = meta.gradient
  const [coverFailed, setCoverFailed] = useState(false)

  // มีรูปปก → แสดงรูปเต็มการ์ด + overlay ให้ตัวอักษรอ่านออก
  if (coverUrl && !coverFailed) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <img
          src={coverUrl}
          alt={subject}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setCoverFailed(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.05) 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '0.9rem', gap: 2,
        }}>
          <div style={{ fontSize: 'clamp(14px, 1.3vw, 18px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            {subject}
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
            {count > 0 ? `${count} ชุดสรุป` : 'เร็วๆ นี้'}
          </div>
        </div>
      </div>
    )
  }

  // ไม่มีรูป → gradient + ไอคอน
  return (
    <div style={{
      width: '100%', height: '100%',
      background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 12, padding: '1rem', textAlign: 'center',
    }}>
      <Icon size={46} color={meta.iconColor} strokeWidth={1.5} />
      <div>
        <div style={{ fontSize: 'clamp(14px, 1.3vw, 18px)', fontWeight: 700, color: meta.iconColor, lineHeight: 1.2 }}>
          {subject}
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 500, color: meta.iconColor, opacity: 0.72, marginTop: 5 }}>
          {count > 0 ? `${count} ชุดสรุป` : 'เร็วๆ นี้'}
        </div>
      </div>
    </div>
  )
}
