import { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html, Environment, useGLTF, Center, Bounds } from '@react-three/drei'
import { ArrowLeft, Pause, Play, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

const MODEL_URL = '/Brain_Model_(Right)_-_General_anatomy/Brain_Model_(Right)_-_General_anatomy.gltf'

/** Warm aurora palette — โทนแสงธรรมชาติ (ไม่ neon ไม่ AI slop)
 *  แต่ละสีถูก eyedrop จากภาพรุ่งอรุณ + เซรามิคโบราณ */
const BRAIN_PARTS = [
  { id: 'frontal',    name: 'Frontal Lobe',   thai: 'สมองส่วนหน้า',  desc: 'การคิด · ตัดสินใจ',      color: '#E68C7E', pos: [0.9,  1.2,  0.4] },
  { id: 'parietal',   name: 'Parietal Lobe',  thai: 'สมองส่วนกลาง',  desc: 'รับสัมผัส · ภาษา',       color: '#7BAFA3', pos: [0.2,  1.6, -0.3] },
  { id: 'occipital',  name: 'Occipital Lobe', thai: 'สมองส่วนหลัง',  desc: 'การมองเห็น',              color: '#A5BF8A', pos: [-1.1, 0.7, -0.5] },
  { id: 'temporal',   name: 'Temporal Lobe',  thai: 'สมองด้านข้าง',  desc: 'ความจำ · การได้ยิน',     color: '#E0A867', pos: [0.6,  0.0,  1.0] },
  { id: 'cerebellum', name: 'Cerebellum',     thai: 'สมองน้อย',       desc: 'การทรงตัว · เคลื่อนไหว', color: '#B49AD1', pos: [-1.0,-0.3,  0.3] },
  { id: 'stem',       name: 'Brain Stem',     thai: 'ก้านสมอง',       desc: 'หายใจ · หัวใจ',          color: '#A99685', pos: [-0.3,-1.0,  0.4] },
] as const

type PartId = typeof BRAIN_PARTS[number]['id']

/** SVG arrow แทนเส้นตรงเฉยๆ — ตัวลูกศรเป็น chevron ปลายมน */
function ArrowSVG({ color }: { color: string }) {
  return (
    <svg width="14" height="52" viewBox="0 0 14 52" style={{ display: 'block', overflow: 'visible' }} aria-hidden>
      <defs>
        <linearGradient id={`g-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="35%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="0.95" />
        </linearGradient>
      </defs>
      {/* เส้นโค้งเล็กน้อย ไม่แข็งทื่อ */}
      <path
        d="M 7 0 Q 7 14, 7 38"
        stroke={`url(#g-${color.replace('#','')})`}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
      {/* หัวลูกศร chevron ปลายมน */}
      <path
        d="M 2 38 L 7 45 L 12 38"
        stroke={color}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BrainAnnotation({
  name, thai, desc, color, position, focused, onHover, onLeave,
}: {
  name: string; thai: string; desc: string; color: string
  position: [number, number, number]
  focused: boolean
  onHover: () => void; onLeave: () => void
}) {
  return (
    <group position={position}>
      {/* Halo สีนุ่มรอบจุด — additive blending ให้กลืนกับเนื้อสมอง */}
      <mesh>
        <sphereGeometry args={[focused ? 0.22 : 0.16, 24, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={focused ? 0.45 : 0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* จุดศูนย์กลาง */}
      <mesh>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* การ์ดข้อความ + ลูกศร */}
      <Html
        position={[0, 0.45, 0]}
        center
        distanceFactor={6}
        zIndexRange={[40, 0]}
        style={{ pointerEvents: 'auto' }}
      >
        <div
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            transform: 'translate3d(0, -100%, 0)',
            cursor: 'help',
          }}
        >
          {/* การ์ดข้อความ — glass อุ่น */}
          <motion.div
            animate={{
              scale: focused ? 1.04 : 1,
              y: focused ? -2 : 0,
            }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            style={{
              position: 'relative',
              background: 'rgba(253, 246, 235, 0.94)',
              backdropFilter: 'blur(14px) saturate(1.1)',
              WebkitBackdropFilter: 'blur(14px) saturate(1.1)',
              border: `1px solid ${color}33`,
              borderRadius: 18,
              padding: '8px 13px 9px',
              boxShadow: focused
                ? `0 14px 32px ${color}33, 0 4px 12px rgba(120, 80, 50, 0.10)`
                : '0 8px 22px rgba(120, 80, 50, 0.10)',
              textAlign: 'left',
              minWidth: 132,
              marginBottom: 0,
              transition: 'box-shadow 250ms ease',
            }}
          >
            {/* แถบสีบางๆ ด้านซ้าย แทน border-top เหลี่ยมๆ */}
            <span style={{
              position: 'absolute', left: 6, top: 8, bottom: 8, width: 2.5,
              borderRadius: 999, background: color,
              boxShadow: `0 0 6px ${color}88`,
            }} />
            <div style={{ paddingLeft: 10 }}>
              <p style={{
                fontSize: 11.5, fontWeight: 700, color: '#3A2618',
                margin: 0, lineHeight: 1.15, letterSpacing: '-0.005em',
                fontFamily: 'var(--font)',
              }}>{name}</p>
              <p style={{
                fontSize: 9.5, color: '#7A5A45', margin: '1px 0 0',
                lineHeight: 1.2, fontWeight: 500, letterSpacing: '0.01em',
                fontFamily: 'var(--font)',
              }}>{thai}</p>
              <p style={{
                fontSize: 9, color: '#9A7858', margin: '3px 0 0',
                lineHeight: 1.25, fontFamily: 'var(--font)',
              }}>{desc}</p>
            </div>
          </motion.div>
          {/* ลูกศร SVG ปลายมน */}
          <div style={{ marginTop: -2 }}>
            <ArrowSVG color={color} />
          </div>
        </div>
      </Html>
    </group>
  )
}

/** ทาสีสมองให้เป็น warm coral แบบกายวิภาค — แทนสีเทาเริ่มต้นของ GLTF */
function BrainModel({ tint }: { tint: string }) {
  const { scene } = useGLTF(MODEL_URL)
  useEffect(() => {
    scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return
      // ตั้งวัสดุใหม่: physical material คล้ายผิว / องค์ประกอบทางชีวภาพ
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(tint),
        roughness: 0.62,
        metalness: 0.02,
        clearcoat: 0.35,
        clearcoatRoughness: 0.45,
        sheen: 0.55,
        sheenColor: new THREE.Color('#FFD8C8'),
        sheenRoughness: 0.6,
        emissive: new THREE.Color('#3E1A14'),
        emissiveIntensity: 0.08,
      })
      obj.material = mat
      obj.castShadow = true
      obj.receiveShadow = true
    })
  }, [scene, tint])
  return <primitive object={scene} />
}

useGLTF.preload(MODEL_URL)

interface BrainViewerProps {
  onBack: () => void
}

export default function BrainViewer({ onBack }: BrainViewerProps) {
  const [autoRotate, setAutoRotate] = useState(false)
  const [focusedId, setFocusedId] = useState<PartId | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // r3f ResizeObserver kick — กรณี mount แรกไม่วัดขนาด canvas
  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      ref={wrapperRef}
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
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28, fontWeight: 800, letterSpacing: '-0.022em',
            color: 'var(--text)', margin: '2px 0 0', lineHeight: 1.1,
          }}>
            สมอง 3 มิติ
          </h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: '4px 0 0', fontWeight: 500 }}>
            ลากเพื่อหมุน · เลื่อนเพื่อซูม · คลิกชื่อในเลเจนด์เพื่อโฟกัส
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
          <span>หมุนอัตโนมัติ</span>
        </button>
      </motion.div>

      {/* ── Legend (interactive) — ซ้ายล่าง ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.45, ease: [0.22, 0.9, 0.3, 1] }}
        style={{
          position: 'absolute', bottom: 22, left: 22, zIndex: 12,
          background: 'color-mix(in oklab, var(--surface) 82%, transparent)',
          backdropFilter: 'blur(16px) saturate(1.1)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.1)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)', padding: '14px 16px 12px',
          boxShadow: 'var(--shadow-md)',
          maxWidth: 244,
        }}
      >
        <p style={{
          fontSize: 10, fontWeight: 700, color: 'var(--accent)',
          margin: '0 0 9px', letterSpacing: '0.16em', textTransform: 'uppercase',
        }}>
          ส่วนประกอบ · Regions
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {BRAIN_PARTS.map(p => {
            const active = focusedId === p.id
            return (
              <button
                key={p.id}
                onMouseEnter={() => setFocusedId(p.id)}
                onMouseLeave={() => setFocusedId(null)}
                onFocus={() => setFocusedId(p.id)}
                onBlur={() => setFocusedId(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '6px 9px', borderRadius: 12,
                  background: active ? `${p.color}1F` : 'transparent',
                  border: 'none', cursor: 'pointer',
                  textAlign: 'left', width: '100%',
                  transition: 'background 180ms ease',
                  fontFamily: 'var(--font)',
                }}
              >
                <span style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: p.color, flexShrink: 0,
                  boxShadow: active
                    ? `0 0 0 3px ${p.color}33, 0 0 10px ${p.color}AA`
                    : `0 0 6px ${p.color}66`,
                  transition: 'box-shadow 200ms ease',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12, color: 'var(--text)', fontWeight: 600,
                    lineHeight: 1.15, letterSpacing: '-0.005em',
                  }}>
                    {p.name}
                  </div>
                  <div style={{
                    fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 500,
                    lineHeight: 1.2, marginTop: 1,
                  }}>
                    {p.thai}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* ── Hint chip — ขวาล่าง ── */}
      <AnimatePresence>
        {!focusedId && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            style={{
              position: 'absolute', bottom: 26, right: 26, zIndex: 12,
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 14px', borderRadius: 'var(--radius-pill)',
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)',
              color: '#FFFFFF',
              fontSize: 11.5, fontWeight: 600, letterSpacing: '0.01em',
              backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
              boxShadow: 'var(--shadow-glow)',
              border: '1px solid color-mix(in oklab, var(--accent-3) 30%, transparent)',
              pointerEvents: 'none',
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--accent-3)', boxShadow: '0 0 8px var(--accent-3)',
              animation: 'braindrop-pulse 1.6s ease-in-out infinite',
            }} />
            ลากเมาส์เพื่อหมุนสมอง
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes braindrop-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }`}</style>

      {/* ── 3D Canvas ── */}
      <div className="r3f-fill" style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
        <Canvas
          camera={{ position: [3.5, 1.6, 4.6], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <Suspense fallback={
            <Html center>
              <div style={{
                padding: '12px 18px', borderRadius: 'var(--radius)',
                background: 'color-mix(in oklab, var(--surface) 94%, transparent)',
                border: '1px solid var(--border-strong)',
                fontSize: 13, color: 'var(--text)', fontWeight: 600,
                fontFamily: 'var(--font)',
                boxShadow: 'var(--shadow-md)',
              }}>
                กำลังโหลดโมเดล…
              </div>
            </Html>
          }>
            <Environment preset="apartment" />
            <ambientLight intensity={0.55} color="#FFF1DC" />
            {/* Key light — soft warm rim */}
            <directionalLight position={[5, 7, 4]} intensity={1.0} color="#FFE3C2" />
            {/* Fill — cool to balance */}
            <directionalLight position={[-5, -2, -3]} intensity={0.35} color="#B8D5E0" />
            {/* Bottom kiss — sage */}
            <pointLight position={[0, -3, 2]} intensity={0.4} color="#C8DBB4" distance={8} />

            <Bounds fit clip observe margin={1.6}>
              <Center>
                <BrainModel tint="#E0A398" />
              </Center>
            </Bounds>

            {BRAIN_PARTS.map(p => (
              <BrainAnnotation
                key={p.id}
                name={p.name}
                thai={p.thai}
                desc={p.desc}
                color={p.color}
                position={p.pos as unknown as [number, number, number]}
                focused={focusedId === p.id}
                onHover={() => setFocusedId(p.id)}
                onLeave={() => setFocusedId(null)}
              />
            ))}

            <OrbitControls
              enablePan enableZoom enableRotate
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
