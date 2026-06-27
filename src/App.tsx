import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import SplashScreen from './components/SplashScreen'

const SPLASH_KEY = 'braindrop_visited'

function shouldShowSplash() {
  try {
    if (sessionStorage.getItem(SPLASH_KEY)) return false
    sessionStorage.setItem(SPLASH_KEY, '1')
    return true
  } catch {
    return false
  }
}

export default function App() {
  const [view, setView] = useState('home')
  const [splashing, setSplashing] = useState(() => shouldShowSplash())

  const handleSplashDone = useCallback(() => setSplashing(false), [])

  return (
    <>
      {splashing && <SplashScreen onDone={handleSplashDone} />}

      <motion.div
        initial={splashing ? { opacity: 0 } : false}
        animate={{ opacity: splashing ? 0 : 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}
      >
        <Sidebar currentView={view} onNavigate={setView} />
        <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            <Home key={view} />
          </AnimatePresence>
        </main>
      </motion.div>
    </>
  )
}
