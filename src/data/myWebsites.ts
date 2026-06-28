/** รายชื่อเว็บไซต์อื่นๆ ของฉัน — แก้ไขที่นี่
 *  - icon รับชื่อจาก lucide-react (เช่น 'Globe', 'Github', 'BookOpen', 'Notebook')
 *  - gradient ใช้กับวงกลมไอคอนใน popover */
export interface MyWebsite {
  id: string
  name: string
  description: string
  url: string
  icon: string
  gradient: string
}

export const MY_WEBSITES: MyWebsite[] = [
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'ผลงานและโปรเจกต์ของฉัน',
    url: 'https://example.com',
    icon: 'Globe',
    gradient: 'linear-gradient(135deg, #0B2C9F, #4D7EFF)',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'บันทึก & สรุปวิชาฉบับเต็ม',
    url: 'https://notion.so',
    icon: 'Notebook',
    gradient: 'linear-gradient(135deg, #111827, #374151)',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'โค้ดและรีโพของฉัน',
    url: 'https://github.com',
    icon: 'Code2',
    gradient: 'linear-gradient(135deg, #1F2937, #6B7280)',
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'บทความและข้อคิด',
    url: 'https://example.com/blog',
    icon: 'BookOpen',
    gradient: 'linear-gradient(135deg, #1F7E3E, #A8F4B8)',
  },
]
