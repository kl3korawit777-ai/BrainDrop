import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Logo from './Logo'
import { DottedSurface } from './ui/dotted-surface'

interface Props {
  onEnter: () => void
}

/** หน้าปก/intro — หน้าแรกของเว็บ มีปุ่ม "เข้าสู่เว็บไซต์" */
export default function CoverPage({ onEnter }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="aurora-bg aurora-grain"
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 28,
        padding: '2rem',
        overflow: 'hidden',
      }}
    >
      {/* Animation พื้นหลัง dotted surface — absolute (ไม่ fixed) เพื่อให้กระจายเฉพาะกล่อง cover */}
      <DottedSurface style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
      {/* Vignette อ่อนๆ ให้ตัวอักษรอ่านง่ายโดยไม่กลบ aurora */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 50% 42%, color-mix(in oklab, var(--surface) 55%, transparent) 0%, color-mix(in oklab, var(--bg) 35%, transparent) 55%, color-mix(in oklab, var(--bg) 80%, transparent) 100%)',
        }}
      />

      {/* Content layer — เหนือ animation + overlay */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 26,
      }}>
        {/* โลโก้ drop-in */}
        <motion.div
          initial={{ y: -120, opacity: 0, scale: 0.7 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <Logo size={104} withText />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          style={{
            color: 'var(--text-muted)', fontSize: 15.5, textAlign: 'center',
            maxWidth: 380, lineHeight: 1.65, letterSpacing: '0.005em',
          }}
        >
          สรุปรายวิชา อ่านง่าย เข้าใจไว — รวมไว้ในที่เดียว
        </motion.p>

        <motion.button
          onClick={onEnter}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.4 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '13px 28px', borderRadius: 'var(--radius-pill)',
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
            color: '#FFF8EE', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600,
            letterSpacing: '0.01em',
            boxShadow: 'var(--shadow-glow), inset 0 1px 0 rgba(255,255,255,0.25)',
          }}
        >
          เข้าสู่เว็บไซต์ <ArrowRight size={18} />
        </motion.button>
      </div>
    </motion.div>
  )
}
