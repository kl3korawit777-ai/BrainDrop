import { useState, useEffect, lazy, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Home as HomeIcon } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import AllSubjects from './pages/AllSubjects'
import SlidesViewer from './components/SlidesViewer'
import CoverPage from './components/CoverPage'
import { useStore } from './store/useStore'

const Admin = lazy(() => import('./pages/Admin'))

export default function App() {
  const loadContent = useStore(s => s.loadContent)
  const loadSubjectMeta = useStore(s => s.loadSubjectMeta)
  const isAdmin = window.location.pathname.startsWith('/admin')

  useEffect(() => { loadContent(); loadSubjectMeta() }, [loadContent, loadSubjectMeta])

  if (isAdmin) return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>กำลังโหลด...</div>}>
      <Admin />
    </Suspense>
  )

  return <PublicSite />
}

function PublicSite() {
  const [view, setView] = useState('home')
  const [openItemId, setOpenItemId] = useState<string | null>(null)
  const entered = useStore(s => s.entered)
  const setEntered = useStore(s => s.setEntered)
  const setActiveSubject = useStore(s => s.setActiveSubject)
  const content = useStore(s => s.content)

  // กลับหน้าแรก (หน้าปก) + รีเซ็ตให้เริ่มที่หน้า fan เมื่อกดเข้าใหม่
  function goCover() {
    setActiveSubject('ทั้งหมด')
    setEntered(false)
  }

  return (
    <>
      <AnimatePresence>
        {!entered && <CoverPage key="cover" onEnter={() => setEntered(true)} />}
      </AnimatePresence>

      {/* ปุ่มลอย: กลับหน้าแรกของเว็บ (หน้าปก) */}
      {entered && (
        <button
          onClick={goCover}
          aria-label="กลับหน้าแรก"
          style={{
            position: 'fixed', top: 14, right: 14, zIndex: 45,
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 13px', borderRadius: 999,
            background: 'var(--surface)', border: '1px solid var(--border-strong)',
            boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
            color: 'var(--text-muted)', fontFamily: 'var(--font)',
            fontSize: 13, fontWeight: 500,
          }}
        >
          <HomeIcon size={15} /> หน้าแรก
        </button>
      )}

      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
        <Sidebar currentView={view} onNavigate={setView} />
        <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
          {(() => {
            const openItem = openItemId ? content.find(c => c.id === openItemId) : null
            if (openItem) return <SlidesViewer item={openItem} onBack={() => setOpenItemId(null)} />
            if (view === 'subjects') return <AllSubjects onOpenItem={setOpenItemId} />
            return (
              <AnimatePresence mode="wait">
                <Home key={view} />
              </AnimatePresence>
            )
          })()}
        </main>
      </div>
    </>
  )
}
