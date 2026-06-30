import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html, useGLTF, Center, useProgress } from '@react-three/drei'
import { ArrowLeft, Pause, Play, Sparkles, MousePointerClick, X } from 'lucide-react'
import { motion } from 'framer-motion'
import * as THREE from 'three'

const MODEL_URL = '/Brain_Model_(Right)_-_General_anatomy/Brain_Model_(Right)_-_General_anatomy.gltf'

/** Warm aurora palette — โทนแสงธรรมชาติ (ไม่ neon ไม่ AI slop)
 *  functions[] อ้างอิงตำราของ hopkinsmedicine.org */
const BRAIN_PARTS = [
  {
    id: 'frontal', name: 'Frontal Lobe', thai: 'สมองส่วนหน้า',
    color: '#E68C7E', pos: [-1.1, 0.7, -0.5],
    functions: ['บุคลิกภาพ · ทักษะทางสังคม', 'การตัดสินใจ · การให้เหตุผล', 'การควบคุมอารมณ์', 'การเคลื่อนไหว · การพูด'],
  },
  {
    id: 'parietal', name: 'Parietal Lobe', thai: 'สมองส่วนกลาง',
    color: '#7BAFA3', pos: [0.2, 1.6, -0.3],
    functions: ['รับการนำเข้าของประสาทสัมผัส', 'ประมวลผลภาษา · การอ่าน/เขียน', 'รับรู้ทิศทางและความลึก', 'การคำนวณ'],
  },
  {
    id: 'occipital', name: 'Occipital Lobe', thai: 'สมองส่วนหลัง',
    color: '#A5BF8A', pos: [0.9, 1.2, 0.4],
    functions: ['การมองเห็น · การแยกแยะสี', 'การรับรู้รูปทรง'],
  },
  {
    id: 'temporal', name: 'Temporal Lobe', thai: 'สมองด้านข้าง',
    color: '#E0A867', pos: [0.6, 0.0, 1.0],
    functions: ['ความจำ · การรับรู้วัตถุ', 'การเข้าใจภาษา · การฟัง', 'ศิลปะ · ดนตรี', 'การเชื่อมโยงความจำกับการรับรู้'],
  },
  {
    id: 'cerebellum', name: 'Cerebellum', thai: 'สมองน้อย',
    color: '#B49AD1', pos: [1.0, -0.3, 0.3],
    functions: ['ประสานการเคลื่อนไหว', 'การรักษาสมดุล', 'การควบคุมอารมณ์ · ความตั้งใจ'],
  },
  {
    id: 'basal', name: 'Basal Ganglia', thai: 'แกนกลางสมอง',
    color: '#C77D8F', pos: [-0.1, 0.15, 0.25],
    functions: ['ความจำ · อารมณ์', 'การประสานการเคลื่อนไหว'],
  },
  {
    id: 'stem', name: 'Brain Stem', thai: 'ก้านสมอง',
    color: '#A99685', pos: [-0.3, -1.0, 0.4],
    functions: ['การหายใจ · การเต้นของหัวใจ', 'ส่งสัญญาณไปไขสันหลัง'],
  },
] as const

type PartId = typeof BRAIN_PARTS[number]['id']
type BrainPart = typeof BRAIN_PARTS[number]

/** จุดตัวเลขที่ลอยอยู่บนผิวสมอง — กดเพื่อดูรายละเอียดในแผงซ้าย */
function NumberedHotspot({
  index, color, position, focused, dim, onSelect,
}: {
  index: number
  color: string
  position: [number, number, number]
  focused: boolean
  dim: boolean
  onSelect: () => void
}) {
  return (
    <group position={position}>
      {/* Halo สีนุ่ม — เน้นเมื่อ focused */}
      <mesh>
        <sphereGeometry args={[focused ? 0.26 : 0.16, 24, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={focused ? 0.55 : dim ? 0.16 : 0.28}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* จุดศูนย์กลางบนผิว — anchor */}
      <mesh>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <Html
        center
        occlude
        distanceFactor={7}
        zIndexRange={[40, 0]}
        style={{ pointerEvents: 'auto' }}
      >
        <button
          onClick={onSelect}
          aria-label={`เลือกบริเวณที่ ${index}`}
          style={{
            width: focused ? 32 : 26,
            height: focused ? 32 : 26,
            borderRadius: '50%',
            border: `1.5px solid ${color}`,
            background: focused
              ? `radial-gradient(circle at 32% 28%, #FFF6EB 0%, ${color} 70%)`
              : 'rgba(253, 246, 235, 0.96)',
            color: focused ? '#FFFFFF' : color,
            fontFamily: 'var(--font)',
            fontWeight: 800,
            fontSize: focused ? 13.5 : 12,
            letterSpacing: '-0.01em',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: focused
              ? `0 0 0 5px ${color}26, 0 8px 22px ${color}55`
              : `0 4px 12px ${color}33`,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            opacity: dim ? 0.6 : 1,
            transform: 'translateZ(0)',
            transition: 'width 220ms cubic-bezier(.22,.9,.3,1), height 220ms cubic-bezier(.22,.9,.3,1), box-shadow 220ms ease, opacity 220ms ease, background 220ms ease, color 220ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateZ(0) scale(1.08)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateZ(0) scale(1)' }}
        >
          {index}
        </button>
      </Html>
    </group>
  )
}

/** ทาสีสมองให้เป็น warm coral แบบกายวิภาค + auto-scale ให้แกนยาวสุด ≈ 3 หน่วย
 *  ใช้ MeshStandardMaterial (เบากว่า MeshPhysicalMaterial ~50%) — ไม่ใช้ clearcoat/sheen
 *  คุณภาพยังดูดี เพราะมี emissive + lights หลายดวง */
function BrainModel({ tint }: { tint: string }) {
  const { scene } = useGLTF(MODEL_URL)
  useEffect(() => {
    scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(tint),
        roughness: 0.58,
        metalness: 0.03,
        emissive: new THREE.Color('#3E1A14'),
        emissiveIntensity: 0.1,
      })
      obj.material = mat
    })
    scene.scale.set(1, 1, 1)
    scene.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    if (maxDim > 0) scene.scale.setScalar(3 / maxDim)
  }, [scene, tint])
  return <primitive object={scene} />
}

/** Progress bar — แสดงเปอร์เซ็นต์ขณะดาวน์โหลด .bin (29MB) */
function LoadingProgress() {
  const { progress, active } = useProgress()
  return (
    <Html center>
      <div style={{
        padding: '14px 22px', borderRadius: 'var(--radius)',
        background: 'color-mix(in oklab, var(--surface) 94%, transparent)',
        border: '1px solid var(--border-strong)',
        fontFamily: 'var(--font)',
        boxShadow: 'var(--shadow-md)',
        minWidth: 220,
      }}>
        <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span>กำลังโหลดโมเดล…</span>
          <span style={{ color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
            {active ? Math.round(progress) : 0}%
          </span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-hover) 100%)',
            transition: 'width 200ms ease',
            borderRadius: 2,
          }} />
        </div>
      </div>
    </Html>
  )
}

useGLTF.preload(MODEL_URL)

interface BrainViewerProps {
  onBack: () => void
}

export default function BrainViewer({ onBack }: BrainViewerProps) {
  const [autoRotate, setAutoRotate] = useState(false)
  const [selectedId, setSelectedId] = useState<PartId | null>(null)

  const selected: BrainPart | null =
    BRAIN_PARTS.find(p => p.id === selectedId) ?? null

  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className="aurora-bg aurora-grain"
      style={{
        position: 'relative',
        width: '100%', height: '100vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font)',
      }}
    >
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 0.9, 0.3, 1] }}
        className="brain-header"
        style={{
          position: 'absolute', top: 20, left: 20, right: 20, zIndex: 12,
          display: 'flex', alignItems: 'center', gap: 14,
          pointerEvents: 'none',
        }}
      >
        <button
          onClick={onBack}
          aria-label="กลับ"
          style={{
            background: 'color-mix(in oklab, var(--surface) 85%, transparent)',
            border: '1px solid var(--border-strong)',
            cursor: 'pointer', color: 'var(--text)',
            display: 'flex', padding: 11, borderRadius: 'var(--radius-pill)',
            boxShadow: 'var(--shadow-sm)',
            pointerEvents: 'auto',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            transition: 'transform 180ms ease, box-shadow 180ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <ArrowLeft size={18} />
        </button>

        <div style={{ pointerEvents: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Sparkles size={14} style={{ color: 'var(--accent)' }} />
            <span style={{
              fontSize: 10.5, fontWeight: 700, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--accent)',
            }}>
              Anatomy · 3D
            </span>
          </div>
          <h1 className="brain-title" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28, fontWeight: 800, letterSpacing: '-0.022em',
            color: 'var(--text)', margin: '2px 0 0', lineHeight: 1.1,
          }}>
            สมอง 3 มิติ
          </h1>
          <p className="brain-subtitle" style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: '4px 0 0', fontWeight: 500 }}>
            กดที่ตัวเลขบนสมอง · รายละเอียดจะปรากฏทางซ้าย
          </p>
        </div>

        <button
          onClick={() => setAutoRotate(v => !v)}
          aria-label={autoRotate ? 'หยุดหมุนอัตโนมัติ' : 'หมุนอัตโนมัติ'}
          title={autoRotate ? 'หยุดหมุนอัตโนมัติ' : 'หมุนอัตโนมัติ'}
          style={{
            pointerEvents: 'auto',
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 'var(--radius-pill)',
            background: autoRotate
              ? 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)'
              : 'color-mix(in oklab, var(--surface) 85%, transparent)',
            color: autoRotate ? '#FFFFFF' : 'var(--text)',
            border: autoRotate ? 'none' : '1px solid var(--border-strong)',
            boxShadow: autoRotate
              ? 'var(--shadow-glow), inset 0 1px 0 rgba(255,255,255,0.18)'
              : 'var(--shadow-sm)',
            cursor: 'pointer', fontFamily: 'var(--font)',
            fontSize: 12.5, fontWeight: 600,
            backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
            transition: 'transform 180ms ease, box-shadow 200ms ease',
          }}
        >
          {autoRotate ? <Pause size={13} /> : <Play size={13} />}
          <span className="brain-rotate-label">หมุนอัตโนมัติ</span>
        </button>
      </motion.div>

      {/* ── Left info panel ── */}
      <motion.aside
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.45, ease: [0.22, 0.9, 0.3, 1] }}
        className="brain-info-panel"
        style={{
          position: 'absolute', left: 22, top: 122, zIndex: 12,
          width: 320, maxHeight: 'calc(100vh - 160px)',
          background: 'color-mix(in oklab, var(--surface) 86%, transparent)',
          backdropFilter: 'blur(18px) saturate(1.15)',
          WebkitBackdropFilter: 'blur(18px) saturate(1.15)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 0.9, 0.3, 1] }}
              style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'auto' }}
            >
              {/* Header: index chip + close */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: `radial-gradient(circle at 32% 28%, #FFF6EB 0%, ${selected.color} 70%)`,
                    color: '#FFFFFF', fontWeight: 800, fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 6px 16px ${selected.color}55, inset 0 0 0 1.5px ${selected.color}`,
                    fontFamily: 'var(--font)',
                  }}>
                    {BRAIN_PARTS.findIndex(p => p.id === selected.id) + 1}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: selected.color,
                    letterSpacing: '0.16em', textTransform: 'uppercase',
                  }}>
                    Region
                  </span>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  aria-label="ปิด"
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    border: '1px solid var(--border)',
                    background: 'transparent', color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 160ms ease, color 160ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--border)'; e.currentTarget.style.color = 'var(--text)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Name */}
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22, fontWeight: 800, letterSpacing: '-0.018em',
                  color: 'var(--text)', margin: 0, lineHeight: 1.1,
                }}>
                  {selected.thai}
                </h2>
                <p style={{
                  fontSize: 12.5, color: 'var(--text-muted)',
                  fontWeight: 600, letterSpacing: '0.01em',
                  margin: '4px 0 0',
                }}>
                  {selected.name}
                </p>
              </div>

              {/* Color bar */}
              <div style={{
                height: 3, borderRadius: 999,
                background: `linear-gradient(90deg, ${selected.color} 0%, ${selected.color}66 60%, transparent 100%)`,
                boxShadow: `0 0 10px ${selected.color}66`,
              }} />

              {/* Functions */}
              <div>
                <p style={{
                  fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                  letterSpacing: '0.16em', textTransform: 'uppercase',
                  margin: '0 0 8px',
                }}>
                  หน้าที่ · Functions
                </p>
                <ul style={{
                  listStyle: 'none', margin: 0, padding: 0,
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                  {selected.functions.map((f, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * i + 0.05, duration: 0.25 }}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        fontSize: 13, color: 'var(--text)', lineHeight: 1.45,
                        fontWeight: 500,
                      }}
                    >
                      <span style={{
                        marginTop: 7, flexShrink: 0,
                        width: 6, height: 6, borderRadius: '50%',
                        background: selected.color,
                        boxShadow: `0 0 6px ${selected.color}99`,
                      }} />
                      <span>{f}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              style={{ padding: '18px 20px 16px', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'color-mix(in oklab, var(--accent) 14%, transparent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent)',
                }}>
                  <MousePointerClick size={15} />
                </div>
                <div>
                  <p style={{
                    fontSize: 10, fontWeight: 700, color: 'var(--accent)',
                    letterSpacing: '0.16em', textTransform: 'uppercase',
                    margin: 0,
                  }}>
                    เริ่มสำรวจ
                  </p>
                  <p style={{
                    fontSize: 13, color: 'var(--text)', fontWeight: 600,
                    margin: '1px 0 0',
                  }}>
                    กดตัวเลขบนสมอง
                  </p>
                </div>
              </div>

              <p style={{
                fontSize: 12.5, color: 'var(--text-muted)',
                lineHeight: 1.5, margin: 0, fontWeight: 500,
              }}>
                เลือกบริเวณที่อยากรู้ — ตัวเลขจะลอยบนผิวสมอง
                หรือกดจากรายการด้านล่างเพื่อเริ่ม
              </p>

              <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {BRAIN_PARTS.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 11,
                      padding: '8px 10px', borderRadius: 12,
                      background: 'transparent', border: 'none',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                      transition: 'background 160ms ease',
                      fontFamily: 'var(--font)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${p.color}14` }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <span style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'rgba(253, 246, 235, 0.96)',
                      border: `1.5px solid ${p.color}`,
                      color: p.color,
                      fontWeight: 800, fontSize: 11,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: `0 2px 6px ${p.color}33`,
                    }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 12.5, color: 'var(--text)', fontWeight: 600,
                        lineHeight: 1.2, letterSpacing: '-0.005em',
                      }}>
                        {p.thai}
                      </div>
                      <div style={{
                        fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 500,
                        lineHeight: 1.2, marginTop: 1,
                      }}>
                        {p.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
      </motion.aside>

      <style>{`
        @keyframes braindrop-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
        .brain-info-panel { scrollbar-width: thin; }
        .brain-info-panel ::-webkit-scrollbar { width: 6px; }
        .brain-info-panel ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
        @media (max-width: 720px) {
          .brain-header { top: 12px !important; left: 12px !important; right: 12px !important; gap: 8px !important; }
          .brain-title { font-size: 18px !important; }
          .brain-subtitle { display: none !important; }
          .brain-rotate-label { display: none !important; }
          .brain-info-panel {
            left: 12px !important; right: 12px !important;
            top: auto !important; bottom: 12px !important;
            width: auto !important;
            max-height: 46vh !important;
          }
        }
      `}</style>

      {/* ── 3D Canvas ── */}
      <div className="r3f-fill" style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
        <Canvas
          camera={{ position: [4.2, 1.8, 5.4], fov: 42 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' }}
          frameloop="always"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <Suspense fallback={<LoadingProgress />}>
            {/* ไม่ใช้ Environment HDR (ประหยัด ~1-3MB) — ใช้ลำแสง 3 ดวงให้ดูอบอุ่นพอ */}
            <ambientLight intensity={0.85} color="#FFF1DC" />
            <directionalLight position={[5, 7, 4]} intensity={1.15} color="#FFE3C2" />
            <directionalLight position={[-5, -2, -3]} intensity={0.45} color="#B8D5E0" />
            <pointLight position={[0, -3, 2]} intensity={0.5} color="#C8DBB4" distance={8} />

            <Center>
              <BrainModel tint="#E0A398" />
            </Center>

            {BRAIN_PARTS.map((p, i) => (
              <NumberedHotspot
                key={p.id}
                index={i + 1}
                color={p.color}
                position={p.pos as unknown as [number, number, number]}
                focused={selectedId === p.id}
                dim={selectedId !== null && selectedId !== p.id}
                onSelect={() => setSelectedId(prev => prev === p.id ? null : p.id)}
              />
            ))}

            <OrbitControls
              enablePan enableZoom enableRotate
              enableDamping
              dampingFactor={0.08}
              zoomSpeed={0.6}
              rotateSpeed={0.85}
              panSpeed={0.7}
              zoomToCursor
              minDistance={2.5} maxDistance={12}
              autoRotate={autoRotate}
              autoRotateSpeed={0.8}
              makeDefault
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}
