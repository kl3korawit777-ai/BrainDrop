import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'

interface Props {
  onDone: () => void
}

export default function SplashScreen({ onDone }: Props) {
  const [phase, setPhase] = useState<'drop' | 'splash' | 'done'>('drop')

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) { onDone(); return }

    // drop → splash at 0.6s, done at 1.8s
    const t1 = setTimeout(() => setPhase('splash'), 600)
    const t2 = setTimeout(() => { setPhase('done'); onDone() }, 1800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="splash"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'var(--bg)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Drop phase — logo falls in */}
          {phase === 'drop' && (
            <motion.div
              key="drop"
              initial={{ y: -120, opacity: 0, scale: 0.6 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 14, stiffness: 200, duration: 0.55 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
            >
              {/* Logo mark */}
              <Logo size={72} />
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                style={{
                  fontSize: 26, fontWeight: 700,
                  fontFamily: 'var(--font)',
                  color: 'var(--text)', letterSpacing: '-0.5px',
                }}
              >
                BrainDrop
              </motion.p>
            </motion.div>
          )}

          {/* Splash phase — ripple + tagline */}
          {phase === 'splash' && (
            <motion.div
              key="splash-inner"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 18, stiffness: 220 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
            >
              {/* Ripple ring */}
              <div style={{ position: 'relative', width: 80, height: 80 }}>
                <motion.div
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    border: '2px solid var(--accent)',
                  }}
                />
                <div style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Logo size={80} />
                </div>
              </div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.35 }}
                style={{ textAlign: 'center' }}
              >
                <p style={{
                  fontSize: 28, fontWeight: 700, fontFamily: 'var(--font)',
                  color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 6,
                }}>
                  BrainDrop
                </p>
                <p style={{
                  fontSize: 14, fontWeight: 400, fontFamily: 'var(--font)',
                  color: 'var(--text-muted)',
                }}>
                  สรุปรายวิชา พร้อมอ่านทุกที่
                </p>
              </motion.div>

              {/* Loading bar */}
              <div style={{
                width: 120, height: 3, borderRadius: 2,
                background: 'var(--border-strong)', overflow: 'hidden',
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.0, ease: 'easeInOut' }}
                  style={{ height: '100%', borderRadius: 2, background: 'var(--accent)' }}
                />
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
