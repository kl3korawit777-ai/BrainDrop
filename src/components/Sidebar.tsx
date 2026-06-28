import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, BookOpen, Moon, Sun, X, ChevronsLeft, ChevronsRight, Brain } from 'lucide-react'
import { useStore } from '../store/useStore'
import Logo from './Logo'
import InboxButton from './InboxButton'

interface Props {
  currentView: string
  onNavigate: (view: string) => void
}

const navItems = [
  { id: 'home',     label: 'หน้าหลัก',    Icon: LayoutGrid },
  { id: 'subjects', label: 'วิชาทั้งหมด', Icon: BookOpen },
  { id: 'brain',    label: 'สมอง 3 มิติ', Icon: Brain },
]

export default function Sidebar({ currentView, onNavigate }: Props) {
  const {
    theme, toggleTheme, setActiveSubject, setEntered,
    sidebarOpen, setSidebarOpen,
    sidebarCollapsed, toggleSidebarCollapsed,
  } = useStore()

  /** สำหรับ desktop เท่านั้น — ใช้ตอน inner ของ aside ตัวบน */
  function buildInner(collapsed: boolean) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: collapsed ? '1.25rem 0.5rem' : '1.25rem 0.875rem' }}>
        {/* Header: Logo + ปุ่มย่อ/ขยาย */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: '1.75rem', padding: collapsed ? 0 : '0 0.375rem',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          {!collapsed && (
            <button
              onClick={() => { setActiveSubject('ทั้งหมด'); setEntered(false); setSidebarOpen(false) }}
              aria-label="กลับหน้าแรก"
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flex: 1 }}
            >
              <Logo size={30} withText />
            </button>
          )}
          {collapsed && (
            <button
              onClick={() => { setActiveSubject('ทั้งหมด'); setEntered(false) }}
              aria-label="กลับหน้าแรก"
              style={{ display: 'flex', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <Logo size={26} />
            </button>
          )}
          {/* ปุ่มย่อ — desktop เท่านั้น */}
          <button
            onClick={toggleSidebarCollapsed}
            aria-label={collapsed ? 'ขยาย sidebar' : 'ย่อ sidebar'}
            title={collapsed ? 'ขยาย' : 'ย่อ'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex',
              padding: 5, borderRadius: 6,
              ...(collapsed ? { marginTop: 10 } : {}),
            }}
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
          {/* ปุ่ม X — มือถือเท่านั้น */}
          {sidebarOpen && !collapsed && (
            <button
              aria-label="ปิด sidebar"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4, borderRadius: 6 }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          {!collapsed && (
            <p style={{
              fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)',
              color: 'var(--text-subtle)', letterSpacing: '0.07em', textTransform: 'uppercase',
              padding: '0 0.5rem', marginBottom: 6,
            }}>
              เมนู
            </p>
          )}

          {navItems.map(({ id, label, Icon }) => {
            const active = currentView === id
            return (
              <button key={id}
                onClick={() => {
                  if (id === 'home') setActiveSubject('ทั้งหมด')
                  onNavigate(id); setSidebarOpen(false)
                }}
                title={collapsed ? label : undefined}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: collapsed ? 0 : 9,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  width: '100%',
                  padding: collapsed ? '10px 0' : '7px 10px',
                  borderRadius: 12, border: 'none', cursor: 'pointer',
                  marginBottom: 2,
                  fontSize: 'var(--text-sm)', fontWeight: active ? 'var(--fw-semibold)' : 'var(--fw-regular)',
                  fontFamily: 'var(--font)',
                  background: active ? 'var(--accent-light)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={collapsed ? 18 : 15} />
                {!collapsed && label}
              </button>
            )
          })}
        </nav>

        {/* Inbox + Dark mode */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <InboxButton collapsed={collapsed} />
        <button onClick={toggleTheme} aria-label="สลับ dark/light mode"
          title={collapsed ? (theme === 'light' ? 'Dark mode' : 'Light mode') : undefined}
          style={{
            display: 'flex', alignItems: 'center',
            gap: collapsed ? 0 : 9,
            justifyContent: 'center',
            padding: collapsed ? '10px 0' : '7px 10px',
            borderRadius: 12,
            border: '1px solid var(--border-strong)',
            background: 'var(--surface-hover)', cursor: 'pointer',
            color: 'var(--text-muted)', fontFamily: 'var(--font)',
            fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)',
            width: '100%', transition: 'all 0.15s',
          }}
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          {!collapsed && (theme === 'light' ? 'Dark mode' : 'Light mode')}
        </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop sidebar — ปรับ width ตาม collapsed */}
      <aside style={{
        width: sidebarCollapsed ? 64 : 'var(--sidebar-w)', flexShrink: 0,
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        height: '100vh', position: 'sticky', top: 0,
        transition: 'width 0.2s ease',
      }} className="hidden md:block">
        {buildInner(sidebarCollapsed)}
      </aside>

      {/* Mobile overlay sidebar — ไม่ย่อ */}
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
              {buildInner(false)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
