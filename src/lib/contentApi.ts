import { content as staticContent, toSlidesEmbedUrl, type ContentItem } from '../data/content'

const TABLE = 'summaries'

/** ตัด trailing slash และ /rest/v1 ที่อาจติดมาจาก env ออก เหลือแค่ base URL สะอาด */
function normalizeBaseUrl(raw?: string): string | undefined {
  if (!raw) return raw
  return raw
    .trim()
    .replace(/\/+$/, '')          // ตัด / ท้ายสุด
    .replace(/\/rest\/v1$/, '')   // ตัด /rest/v1 ถ้าเผลอใส่มา
}

const URL = normalizeBaseUrl(import.meta.env.VITE_SUPABASE_URL as string | undefined)
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(URL && ANON)

/** map DB row (snake_case) → ContentItem (camelCase) */
function fromRow(r: Record<string, unknown>): ContentItem {
  return {
    id: String(r.id),
    title: String(r.title ?? ''),
    subject: String(r.subject ?? ''),
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    slidesEmbedUrl: String(r.slides_embed_url ?? ''),
    driveUrl: r.drive_url ? String(r.drive_url) : undefined,
    pdfUrl: r.pdf_url ? String(r.pdf_url) : undefined,
    canvaUrl: r.canva_url ? String(r.canva_url) : undefined,
    coverUrl: r.cover_url ? String(r.cover_url) : undefined,
    slideCount: Number(r.slide_count ?? 0),
    updatedAt: String(r.updated_at ?? '').slice(0, 10),
  }
}

/** map ContentItem → DB row */
export function toRow(item: ContentItem) {
  return {
    id: item.id,
    title: item.title,
    subject: item.subject,
    tags: item.tags,
    slides_embed_url: toSlidesEmbedUrl(item.slidesEmbedUrl),
    drive_url: item.driveUrl ?? null,
    pdf_url: item.pdfUrl ?? null,
    canva_url: item.canvaUrl ?? null,
    cover_url: item.coverUrl ?? null,
    slide_count: item.slideCount,
    updated_at: item.updatedAt || new Date().toISOString().slice(0, 10),
  }
}

/**
 * ดึงเนื้อหาทั้งหมด — ใช้ plain fetch ไปที่ Supabase REST (PostgREST)
 * ไม่ต้องโหลด supabase-js → bundle หน้าสาธารณะเล็ก
 */
export async function fetchContent(): Promise<ContentItem[]> {
  if (!isSupabaseConfigured) return staticContent
  try {
    const res = await fetch(
      `${URL}/rest/v1/${TABLE}?select=*&order=updated_at.desc`,
      { headers: { apikey: ANON!, Authorization: `Bearer ${ANON}` } }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const rows = (await res.json()) as Record<string, unknown>[]
    return rows.map(fromRow)
  } catch (e) {
    console.error('[contentApi] fetch error:', e)
    return staticContent
  }
}

/* ── เขียนข้อมูล (เฉพาะ admin) — ใช้ supabase-js เพื่อ auth ── */

async function client() {
  const { supabase } = await import('./supabase')
  if (!supabase) throw new Error('Supabase ยังไม่ได้ตั้งค่า')
  return supabase
}

/** เพิ่มหรืออัปเดต (upsert by id) */
export async function saveContent(item: ContentItem): Promise<void> {
  const sb = await client()
  const { error } = await sb.from(TABLE).upsert(toRow(item))
  if (error) throw new Error(error.message)
}

/** ลบ */
export async function deleteContent(id: string): Promise<void> {
  const sb = await client()
  const { error } = await sb.from(TABLE).delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/* ── subject_meta — รูปการ์ดวิชา + หมวดหมู่ + ลำดับ ──────────────────── */

export interface SubjectMetaRow {
  name: string
  coverUrl?: string
  category?: string
  sortOrder: number
}

const META_TABLE = 'subject_meta'

function metaFromRow(r: Record<string, unknown>): SubjectMetaRow {
  return {
    name: String(r.name ?? ''),
    coverUrl: r.cover_url ? String(r.cover_url) : undefined,
    category: r.category ? String(r.category) : undefined,
    sortOrder: Number(r.sort_order ?? 0),
  }
}

/** ดึง subject_meta ทั้งหมด — public read */
export async function fetchSubjectMeta(): Promise<SubjectMetaRow[]> {
  if (!isSupabaseConfigured) return []
  try {
    const res = await fetch(
      `${URL}/rest/v1/${META_TABLE}?select=*&order=sort_order.asc`,
      { headers: { apikey: ANON!, Authorization: `Bearer ${ANON}` } },
    )
    if (!res.ok) return []
    const rows = (await res.json()) as Record<string, unknown>[]
    return rows.map(metaFromRow)
  } catch {
    return []
  }
}

export async function saveSubjectMeta(m: SubjectMetaRow): Promise<void> {
  const sb = await client()
  const { error } = await sb.from(META_TABLE).upsert({
    name: m.name,
    cover_url: m.coverUrl ?? null,
    category: m.category ?? null,
    sort_order: m.sortOrder,
  })
  if (error) throw new Error(error.message)
}

export async function deleteSubjectMeta(name: string): Promise<void> {
  const sb = await client()
  const { error } = await sb.from(META_TABLE).delete().eq('name', name)
  if (error) throw new Error(error.message)
}
