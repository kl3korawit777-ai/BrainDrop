export interface ContentItem {
  id: string
  title: string
  subject: string
  tags: string[]
  slidesEmbedUrl: string
  driveUrl?: string
  pdfUrl?: string
  slideCount: number
  updatedAt: string
}

// ─── เพิ่มวิชาใหม่ที่นี่ที่เดียว ──────────────────────────────────────────────
export interface SubjectMeta {
  label: string
  iconType: 'atom' | 'file-text' | 'presentation' | 'calculator' | 'book' | 'flask' | 'globe' | 'music' | 'code'
  gradient: [string, string]
  iconColor: string
}

export const SUBJECT_CONFIG: Record<string, SubjectMeta> = {
  'ชีววิทยา':    { label: 'ชีววิทยา',    iconType: 'atom',         gradient: ['#D1FAE5', '#6EE7B7'], iconColor: '#065F46' },
  'เคมี':        { label: 'เคมี',         iconType: 'flask',        gradient: ['#EDE9FE', '#C4B5FD'], iconColor: '#4C1D95' },
  'ฟิสิกส์':     { label: 'ฟิสิกส์',     iconType: 'presentation', gradient: ['#DBEAFE', '#93C5FD'], iconColor: '#1E3A8A' },
  'คณิตศาสตร์':  { label: 'คณิตศาสตร์',  iconType: 'calculator',   gradient: ['#FEF3C7', '#FCD34D'], iconColor: '#78350F' },
  // ── เพิ่มวิชาใหม่ตรงนี้ ──
  // 'ภาษาอังกฤษ': { label: 'ภาษาอังกฤษ', iconType: 'book',         gradient: ['#FCE7F3', '#F9A8D4'], iconColor: '#831843' },
  // 'ประวัติศาสตร์':{ label: 'ประวัติศาสตร์',iconType: 'globe',        gradient: ['#FEF9C3', '#FDE047'], iconColor: '#713F12' },
  // 'วิทยาการคอมฯ':{ label: 'วิทยาการคอมฯ',iconType: 'code',         gradient: ['#E0F2FE', '#7DD3FC'], iconColor: '#0C4A6E' },
  // 'ดนตรี':       { label: 'ดนตรี',       iconType: 'music',        gradient: ['#F3E8FF', '#D8B4FE'], iconColor: '#581C87' },
}

// List สำหรับ Sidebar filter — 'ทั้งหมด' จะถูกเพิ่มอัตโนมัติ
export const SUBJECTS = ['ทั้งหมด', ...Object.keys(SUBJECT_CONFIG)]

// ─── Tag colors ────────────────────────────────────────────────────────────────
export const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  '#midterm': { bg: '#EEEDFE', color: '#3C3489' },
  '#final':   { bg: '#E1F5EE', color: '#085041' },
  '#quiz':    { bg: '#E6F1FB', color: '#0C447C' },
  '#บทที่1':  { bg: '#FAEEDA', color: '#633806' },
  '#บทที่2':  { bg: '#FAEEDA', color: '#633806' },
  '#บทที่3':  { bg: '#FAEEDA', color: '#633806' },
  '#บทที่4':  { bg: '#FAEEDA', color: '#633806' },
  '#บทที่5':  { bg: '#FAEEDA', color: '#633806' },
  '#บทที่6':  { bg: '#FAEEDA', color: '#633806' },
  '#สรุป':    { bg: '#FAECE7', color: '#4A1B0C' },
  '#สูตร':    { bg: '#EAF3DE', color: '#27500A' },
}

export function getTagStyle(tag: string) {
  return TAG_COLORS[tag] ?? { bg: '#F1EFE8', color: '#444441' }
}

// ─── Google Slides URL helpers ───────────────────────────────────────────────
// ดึง presentation ID จาก Google Slides URL ทุกรูปแบบ
// รองรับ:  /d/<ID>/edit     (เอกสารปกติ — แชร์ "ทุกคนที่มีลิงก์")
//          /d/e/<ID>/pub    (Publish to web — สะอาดที่สุด ไม่ต้องล็อกอิน)
function parseSlidesId(raw: string): { id: string; published: boolean } | null {
  const pub = raw.match(/\/presentation\/d\/e\/([^/?#]+)/)
  if (pub) return { id: pub[1], published: true }
  const doc = raw.match(/\/presentation\/d\/([^/?#]+)/)
  if (doc) return { id: doc[1], published: false }
  return null
}

/** แปลง URL อะไรก็ตามที่วางมา → embed ที่สะอาด (ไม่มี toolbar/เมนู) */
export function toSlidesEmbedUrl(raw: string): string {
  if (!raw || raw.includes('EXAMPLE_ID')) return raw
  const p = parseSlidesId(raw)
  if (!p) return raw
  const q = 'start=false&loop=false&delayms=3000&rm=minimal'
  return p.published
    ? `https://docs.google.com/presentation/d/e/${p.id}/embed?${q}`
    : `https://docs.google.com/presentation/d/${p.id}/embed?${q}`
}

/** ลิงก์ "เปิดใน Slides" สำหรับเปิดดูแบบเต็มหน้าจอในแท็บใหม่ */
export function toSlidesOpenUrl(raw: string): string {
  if (!raw || raw.includes('EXAMPLE_ID')) return raw
  const p = parseSlidesId(raw)
  if (!p) return raw
  return p.published
    ? `https://docs.google.com/presentation/d/e/${p.id}/pub?start=false&loop=false`
    : `https://docs.google.com/presentation/d/${p.id}/edit`
}
// ─── เนื้อหา — เพิ่ม item ใหม่ที่นี่ ──────────────────────────────────────────
export const content: ContentItem[] = [
  {
    id: 'bio-ch1-3',
    title: 'ชีววิทยา บทที่ 1–3 เซลล์และการแบ่งเซลล์',
    subject: 'ชีววิทยา',
    tags: ['#midterm', '#บทที่1', '#สรุป'],
    slidesEmbedUrl: 'https://docs.google.com/presentation/d/EXAMPLE_ID/embed?start=false&loop=false&delayms=3000',
    slideCount: 22,
    updatedAt: '2026-06-20',
  },
  {
    id: 'chem-organic',
    title: 'เคมี Organic สารประกอบไฮโดรคาร์บอน',
    subject: 'เคมี',
    tags: ['#final', '#สรุป'],
    slidesEmbedUrl: 'https://docs.google.com/presentation/d/EXAMPLE_ID2/embed?start=false&loop=false&delayms=3000',
    slideCount: 18,
    updatedAt: '2026-06-15',
  },
  {
    id: 'physics-formula',
    title: 'ฟิสิกส์ สรุปสูตรทั้งหมด',
    subject: 'ฟิสิกส์',
    tags: ['#quiz', '#บทที่3', '#สูตร'],
    slidesEmbedUrl: 'https://docs.google.com/presentation/d/EXAMPLE_ID3/embed?start=false&loop=false&delayms=3000',
    slideCount: 14,
    updatedAt: '2026-06-10',
  },
]
