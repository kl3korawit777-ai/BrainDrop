# ตั้งค่า Supabase สำหรับ BrainDrop

ทำครั้งเดียว ใช้เวลา ~10 นาที ทั้งหมดฟรี

## 1. สร้าง Project

1. ไปที่ [supabase.com](https://supabase.com) → Sign in (ใช้ GitHub ได้)
2. **New project** → ตั้งชื่อ เช่น `braindrop` → ตั้ง Database Password (เก็บไว้) → เลือก Region ใกล้ที่สุด (Singapore)
3. รอ ~2 นาทีให้ project สร้างเสร็จ

## 2. สร้างตาราง

1. เมนูซ้าย → **SQL Editor** → **New query**
2. เปิดไฟล์ [`schema.sql`](schema.sql) คัดลอกทั้งหมด → วาง → กด **Run**
3. ควรขึ้น "Success" — ตาราง `summaries` ถูกสร้างพร้อม security

## 3. สร้าง Admin User (ตัวคุณเอง)

1. เมนูซ้าย → **Authentication** → **Users** → **Add user** → **Create new user**
2. ใส่ email + password ที่จะใช้ login เข้า `/admin`
3. ✅ ติ๊ก **Auto Confirm User** (ไม่งั้นต้องยืนยัน email ก่อน)

> ปิดการสมัครสมาชิกของคนอื่น: **Authentication → Providers → Email** แล้วปิด **"Enable sign-ups"** เพื่อให้มีแค่ user ที่คุณสร้างเอง

## 4. เอา API keys มาใส่ในเว็บ

1. เมนูซ้าย → **Project Settings** (รูปเฟือง) → **API**
2. คัดลอก 2 ค่า:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
3. ในโฟลเดอร์โปรเจกต์ คัดลอก `.env.example` เป็น `.env.local` แล้วใส่ค่า:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

4. รีสตาร์ท dev server (`npm run dev`)

## 5. ใช้งาน

- เปิด `http://localhost:5173/admin` → login ด้วย email/password ที่สร้างไว้
- เพิ่ม/แก้/ลบสรุปได้ทันที — หน้าเว็บหลักจะอัปเดตตาม

## Deploy บน Vercel

ใส่ env vars เดียวกันใน **Vercel → Project → Settings → Environment Variables**
(`VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY`) แล้ว redeploy

---

**หมายเหตุความปลอดภัย:** `anon key` เปิดเผยได้ปลอดภัย — Row Level Security (RLS) ในข้อ 2 ทำให้คนทั่วไป "อ่านอย่างเดียว" ส่วนการเพิ่ม/ลบต้อง login เท่านั้น
