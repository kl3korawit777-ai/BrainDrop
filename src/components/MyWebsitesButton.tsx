import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, X, ExternalLink, Globe, Code2, Notebook, BookOpen } from 'lucide-react'
import { MY_WEBSITES } from '../data/myWebsites'

const ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  Globe, Code2, Notebook, BookOpen,
}

interface Props {
  collapsed: boolean
}

export default function MyWebsitesButton({ collapsed }: Props) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        aria-label="เว็บไซต์ของฉัน"
        title={collapsed ? 'เว็บของฉัน' : undefined}
        style={{
          display: 'flex', alignItems: 'center',
          gap: collapsed ? 0 : 9,
          justifyContent: 'center',
          padding: collapsed ? '10px 0' : '7px 10px',
          borderRadius: 8,
          border: `1px solid ${open ? 'var(--accent)' : 'var(--border-strong)'}`,
          background: open ? 'var(--accent-light)' : 'var(--surface-hover)',
          cursor: 'pointer',
          color: open ? 'var(--accent)' : 'var(--text-muted)',
          fontFamily: 'var(--font)',
          fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)',
          width: '100%', transition: 'all 0.15s',
        }}
      >
        <Link2 size={15} />
        {!collapsed && 'เว็บของฉัน'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: collapsed ? '50%' : 0,
              transform: collapsed ? 'translateX(-50%)' : undefined,
              width: collapsed ? 280 : '100%',
              minWidth: 240,
              background: 'var(--surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: 14,
              boxShadow: '0 12px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              zIndex: 100,
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px 10px',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-mid))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Link2 size={14} color="#fff" />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>
                    เว็บไซต์ของฉัน
                  </p>
                  <p style={{ fontSize: 10.5, color: 'var(--text-subtle)', lineHeight: 1.3 }}>
                    เปิดเว็บอื่นๆ ของฉัน
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="ปิด"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-subtle)', display: 'flex', padding: 4,
                  borderRadius: 6,
                }}
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ padding: '8px 8px 10px', display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 360, overflowY: 'auto' }}>
              {MY_WEBSITES.map(site => {
                const Icon = ICONS[site.icon] ?? Globe
                return (
                  <a
                    key={site.id}
                    href={site.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 10px',
                      borderRadius: 10,
                      textDecoration: 'none',
                      color: 'var(--text)',
                      transition: 'background 0.15s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: site.gradient,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={17} color="#fff" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, color: 'var(--text)' }}>
                        {site.name}
                      </p>
                      <p style={{
                        fontSize: 11, color: 'var(--text-subtle)', lineHeight: 1.3,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {site.description}
                      </p>
                    </div>
                    <ExternalLink size={13} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
                  </a>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
