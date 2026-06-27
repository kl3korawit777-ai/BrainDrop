import { content as staticContent, type ContentItem } from '../data/content'

const TABLE = 'summaries'
const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
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
    slides_embed_url: item.slidesEmbedUrl,
    drive_url: item.driveUrl ?? null,
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
