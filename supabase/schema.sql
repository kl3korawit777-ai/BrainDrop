-- ════════════════════════════════════════════════════════════
--  BrainDrop — Supabase schema
--  รันใน Supabase Dashboard → SQL Editor → New query → วาง → Run
-- ════════════════════════════════════════════════════════════

-- ตารางเก็บสรุป
create table if not exists public.summaries (
  id                text primary key,
  title             text not null,
  subject           text not null,
  tags              text[] not null default '{}',
  slides_embed_url  text not null,
  drive_url         text,
  cover_url         text,
  pdf_url           text,
  canva_url         text,
  slide_count       int  not null default 0,
  updated_at        date not null default current_date,
  created_at        timestamptz not null default now()
);

-- ถ้าตารางมีอยู่แล้ว (อัปเกรดภายหลัง) ให้เพิ่มคอลัมน์ใหม่:
alter table public.summaries add column if not exists cover_url text;
alter table public.summaries add column if not exists pdf_url   text;
alter table public.summaries add column if not exists canva_url text;

-- ─── ตารางหมวดหมู่/วิชา ──────────────────────────────────────────────
-- จัดการรูปการ์ดวิชาในหน้าแรก + หมวดหมู่ใหญ่ + ลำดับ
create table if not exists public.subject_meta (
  name        text primary key,            -- ชื่อวิชา ตรงกับ summaries.subject
  cover_url   text,                        -- รูปการ์ดในหน้าแรก fan
  category    text,                        -- หมวดหมู่ใหญ่ (เช่น "วิทยาศาสตร์", "ภาษา")
  sort_order  int  not null default 0,     -- ลำดับใน sidebar
  created_at  timestamptz not null default now()
);

alter table public.subject_meta enable row level security;

drop policy if exists "public read meta" on public.subject_meta;
create policy "public read meta"
  on public.subject_meta for select using (true);

drop policy if exists "auth write meta" on public.subject_meta;
create policy "auth write meta"
  on public.subject_meta for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- เปิด Row Level Security
alter table public.summaries enable row level security;

-- ทุกคนอ่านได้ (เว็บสาธารณะ)
drop policy if exists "public read" on public.summaries;
create policy "public read"
  on public.summaries for select
  using (true);

-- เฉพาะผู้ที่ login แล้ว (admin) เท่านั้นที่เพิ่ม/แก้/ลบได้
drop policy if exists "auth write" on public.summaries;
create policy "auth write"
  on public.summaries for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- (ทางเลือก) ข้อมูลตัวอย่างเริ่มต้น
insert into public.summaries (id, title, subject, tags, slides_embed_url, slide_count, updated_at)
values
  ('bio-ch1-3', 'ชีววิทยา บทที่ 1–3 เซลล์และการแบ่งเซลล์', 'ชีววิทยา',
   array['#midterm','#บทที่1','#สรุป'],
   'https://docs.google.com/presentation/d/EXAMPLE_ID/embed?start=false&loop=false&delayms=3000', 22, current_date)
on conflict (id) do nothing;
