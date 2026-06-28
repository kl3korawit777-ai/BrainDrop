import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Logo from './Logo'

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
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 26,
        background: 'radial-gradient(circle at 50% 35%, var(--accent-light) 0%, var(--bg) 60%)',
        padding: '2rem',
      }}
    >
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
        style={{ color: 'var(--text-muted)', fontSize: 15.5, textAlign: 'center', maxWidth: 360, lineHeight: 1.6 }}
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
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '12px 26px', borderRadius: 999,
          background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font)', fontSize: 15, fontWeight: 600,
          boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
        }}
      >
        เข้าสู่เว็บไซต์ <ArrowRight size={18} />
      </motion.button>
    </motion.div>
  )
}
