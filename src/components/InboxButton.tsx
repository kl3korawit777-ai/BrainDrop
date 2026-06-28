import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Inbox, Mail, X, ExternalLink } from 'lucide-react'

// ─── แก้ข้อมูลตรงนี้ ────────────────────────────────────────────────
const CONTACT = {
  email: 'kl3korawit777@gmail.com',
  line: 'https://line.me/ti/p/yxyLZ4jMA8',
}
// ────────────────────────────────────────────────────────────────────

const LineIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
  </svg>
)

interface Props {
  collapsed: boolean
}

export default function InboxButton({ collapsed }: Props) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Trigger button */}
      <button
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        aria-label="ช่องทางติดต่อ"
        title={collapsed ? 'ติดต่อเรา' : undefined}
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
          position: 'relative',
        }}
      >
        <Inbox size={15} />
        {!collapsed && 'ติดต่อเรา'}

        {/* Notification dot */}
        <span style={{
          position: 'absolute',
          top: collapsed ? 6 : 6,
          right: collapsed ? 14 : 8,
          width: 7, height: 7,
          borderRadius: '50%',
          background: '#06C755',
          border: '1.5px solid var(--surface-hover)',
          boxShadow: '0 0 6px rgba(6,199,85,0.5)',
        }} />
      </button>

      {/* Popup panel */}
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
              width: collapsed ? 260 : '100%',
              minWidth: 240,
              background: 'var(--surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: 14,
              boxShadow: '0 12px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              zIndex: 100,
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px 10px',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Inbox size={14} color="#fff" />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>
                    ติดต่อเรา
                  </p>
                  <p style={{ fontSize: 10.5, color: 'var(--text-subtle)', lineHeight: 1.3 }}>
                    เลือกช่องทางที่สะดวก
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="ปิด"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-subtle)', display: 'flex', padding: 4,
                  borderRadius: 6, transition: 'color 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-subtle)' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Contact options */}
            <div style={{ padding: '8px 8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Email */}
              <a
                href={`mailto:${CONTACT.email}`}
                onClick={(e) => { 
                  e.preventDefault(); 
                  window.open(`https://mail.google.com/mail/?view=cm&to=${CONTACT.email}`, '_blank'); 
                  setOpen(false) 
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 10px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  color: 'var(--text)',
                  transition: 'background 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Mail size={17} color="#fff" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, color: 'var(--text)' }}>
                    Email
                  </p>
                  <p style={{
                    fontSize: 11, color: 'var(--text-subtle)', lineHeight: 1.3,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {CONTACT.email}
                  </p>
                </div>
                <ExternalLink size={13} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
              </a>

              {/* LINE */}
              <a
                href={CONTACT.line}
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
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'linear-gradient(135deg, #06C755, #00B843)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: '#fff',
                }}>
                  <LineIcon size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, color: 'var(--text)' }}>
                    LINE
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-subtle)', lineHeight: 1.3 }}>
                    แชทกับเราผ่าน LINE
                  </p>
                </div>
                <ExternalLink size={13} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
              </a>
            </div>

            {/* Footer hint */}
            <div style={{
              padding: '8px 16px 12px',
              borderTop: '1px solid var(--border)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 10.5, color: 'var(--text-subtle)', lineHeight: 1.4 }}>
                ตอบกลับภายใน 24 ชม. ✨
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
