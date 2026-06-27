import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, BookOpen, Tag, Search, Moon, Sun, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { SUBJECT_CONFIG } from '../data/content'
import Logo from './Logo'

interface Props {
  currentView: string
  onNavigate: (view: string) => void
}

const navItems = [
  { id: 'home',     label: 'หน้าหลัก',    Icon: LayoutGrid },
  { id: 'subjects', label: 'วิชาทั้งหมด', Icon: BookOpen },
  { id: 'tags',     label: 'Tags',         Icon: Tag },
  { id: 'search',   label: 'ค้นหา',        Icon: Search },
]

export default function Sidebar({ currentView, onNavigate }: Props) {
  const { theme, toggleTheme, activeSubject, setActiveSubject, sidebarOpen, setSidebarOpen, content } = useStore()

  // วิชา = config ที่ตั้งไว้ + วิชาใหม่ที่มีใน content (จาก admin)
  const SUBJECTS = useMemo(() => {
    const fromConfig = Object.keys(SUBJECT_CONFIG)
    const fromContent = content.map(c => c.subject)
    return ['ทั้งหมด', ...new Set([...fromConfig, ...fromContent])]
  }, [content])

  const inner = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.25rem 0.875rem' }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.75rem', padding: '0 0.375rem' }}>
        <Logo size={30} withText />
        {sidebarOpen && (
          <button
            aria-label="ปิด sidebar"
            onClick={() => setSidebarOpen(false)}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', padding: 4, borderRadius: 6,
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        <p style={{
          fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)',
          color: 'var(--text-subtle)', letterSpacing: '0.07em', textTransform: 'uppercase',
          padding: '0 0.5rem', marginBottom: 6,
        }}>
          เมนู
        </p>

        {navItems.map(({ id, label, Icon }) => {
          const active = currentView === id
          return (
            <button key={id} onClick={() => { onNavigate(id); setSidebarOpen(false) }} style={{
              display: 'flex', alignItems: 'center', gap: 9, width: '100%',
              padding: '7px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
              marginBottom: 2,
              fontSize: 'var(--text-sm)', fontWeight: active ? 'var(--fw-semibold)' : 'var(--fw-regular)',
              fontFamily: 'var(--font)',
              background: active ? 'var(--accent-light)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}>
              <Icon size={15} />
              {label}
            </button>
          )
        })}

        {/* Subjects */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <p style={{
            fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)',
            color: 'var(--text-subtle)', letterSpacing: '0.07em', textTransform: 'uppercase',
            padding: '0 0.5rem', marginBottom: 6,
          }}>
            วิชา
          </p>
          {SUBJECTS.map(s => (
            <button key={s} onClick={() => { setActiveSubject(s); onNavigate('home') }} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 'var(--text-sm)', fontFamily: 'var(--font)', marginBottom: 1,
              fontWeight: activeSubject === s ? 'var(--fw-semibold)' : 'var(--fw-regular)',
              background: activeSubject === s ? 'var(--accent-light)' : 'transparent',
              color: activeSubject === s ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}>
              {s}
            </button>
          ))}
        </div>
      </nav>

      {/* Dark mode toggle */}
      <button onClick={toggleTheme} aria-label="สลับ dark/light mode" style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '7px 10px', borderRadius: 8,
        border: '1px solid var(--border-strong)',
        background: 'var(--surface-hover)', cursor: 'pointer',
        color: 'var(--text-muted)', fontFamily: 'var(--font)',
        fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)',
        width: '100%', transition: 'all 0.15s',
      }}>
        {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
        {theme === 'light' ? 'Dark mode' : 'Light mode'}
      </button>
    </div>
  )

  return (
    <>
      <aside style={{
        width: 'var(--sidebar-w)', flexShrink: 0,
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        height: '100vh', position: 'sticky', top: 0,
      }} className="hidden md:block">
        {inner}
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 40, backdropFilter: 'blur(2px)' }}
              className="md:hidden"
            />
            <motion.aside
              initial={{ x: -264 }} animate={{ x: 0 }} exit={{ x: -264 }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0, width: 264,
                background: 'var(--surface)', zIndex: 50,
                boxShadow: '4px 0 24px rgba(15,23,42,0.15)',
              }}
              className="md:hidden"
            >
              {inner}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
