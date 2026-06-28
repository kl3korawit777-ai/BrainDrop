import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html, Environment, useGLTF, Center, Bounds } from '@react-three/drei'
import { ArrowLeft, RotateCw, Pause, Play } from 'lucide-react'
import { motion } from 'framer-motion'

const MODEL_URL = '/Brain_Model_(Right)_-_General_anatomy/Brain_Model_(Right)_-_General_anatomy.gltf'

/** ตำแหน่งของ annotation จะอยู่ใน "หน่วยสัมพัทธ์" หลังจาก Center+Bounds
 *  (สมองถูก fit ลงในกล่อง ~ -1..1) — ปรับค่าให้ลูกศรชี้ใกล้กับแต่ละ lobe */
const BRAIN_PARTS = [
  { name: 'Frontal Lobe',  desc: 'การคิด / การตัดสินใจ',     color: '#F472B6', pos: [0.9,  1.2,  0.4] },
  { name: 'Parietal Lobe', desc: 'รับความรู้สึก / ภาษา',     color: '#60A5FA', pos: [0.2,  1.6, -0.3] },
  { name: 'Occipital Lobe',desc: 'การมองเห็น',                color: '#34D399', pos: [-1.1, 0.7, -0.5] },
  { name: 'Temporal Lobe', desc: 'ความจำ / การได้ยิน',       color: '#FBBF24', pos: [0.6,  0.0,  1.0] },
  { name: 'Cerebellum',    desc: 'การทรงตัว / เคลื่อนไหว',   color: '#A78BFA', pos: [-1.0,-0.3,  0.3] },
  { name: 'Brain Stem',    desc: 'ระบบหายใจ / หัวใจ',        color: '#9CA3AF', pos: [-0.3,-1.0,  0.4] },
] as const

function BrainAnnotation({ name, desc, color, position }: {
  name: string; desc: string; color: string; position: [number, number, number]
}) {
  return (
    <group position={position}>
      {/* จุดจุดที่ส่วนของสมอง */}
      <mesh>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* ป้ายลอย */}
      <Html
        position={[0, 0.3, 0]}
        center
        distanceFactor={6}
        zIndexRange={[20, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          transform: 'translate3d(0, -50%, 0)',
        }}>
          {/* เส้นชี้ */}
          <div style={{
            width: 1, height: 30,
            background: `linear-gradient(to bottom, transparent, ${color})`,
          }} />
          {/* การ์ดข้อความ */}
          <div style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${color}55`,
            borderTop: `3px solid ${color}`,
            borderRadius: 10,
            padding: '7px 11px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
            textAlign: 'center',
            minWidth: 110,
            marginBottom: 4,
          }}>
            <p style={{
              fontSize: 12, fontWeight: 800, color: '#0F172A',
              margin: 0, lineHeight: 1.15, letterSpacing: '-0.01em',
            }}>{name}</p>
            <p style={{
              fontSize: 10.5, color: '#475569', margin: '2px 0 0', lineHeight: 1.2,
            }}>{desc}</p>
          </div>
        </div>
      </Html>
    </group>
  )
}

function BrainModel() {
  const { scene } = useGLTF(MODEL_URL)
  return <primitive object={scene} />
}

useGLTF.preload(MODEL_URL)

interface BrainViewerProps {
  onBack: () => void
}

export default function BrainViewer({ onBack }: BrainViewerProps) {
  const [autoRotate, setAutoRotate] = useState(false)

  // r3f บางจังหวะ ResizeObserver ไม่ยิงตอน mount แรก — kick a resize ให้ canvas วัดขนาดถูก
  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      position: 'relative',
      width: '100%', height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: 'radial-gradient(ellipse at 50% 40%, #EEF2FF 0%, #F8FAFC 60%, #E2E8F0 100%)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          padding: '1.25rem 1.25rem 0.5rem',
          display: 'flex', alignItems: 'center', gap: 12,
          pointerEvents: 'none',
        }}
      >
        <button
          onClick={onBack}
          aria-label="กลับ"
          style={{
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(0,0,0,0.06)',
            cursor: 'pointer', color: '#334155',
            display: 'flex', padding: 9, borderRadius: 999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            pointerEvents: 'auto',
            backdropFilter: 'blur(10px)',
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ pointerEvents: 'auto' }}>
          <h1 style={{
            fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em',
            color: '#0F172A', margin: 0,
          }}>
            สมอง 3 มิติ
          </h1>
          <p style={{ fontSize: 12.5, color: '#475569', margin: '2px 0 0' }}>
            ลากเพื่อหมุน · scroll เพื่อ zoom · คลิกขวาเพื่อเลื่อน
          </p>
        </div>

        {/* ปุ่ม Auto-rotate toggle (มุมขวา) */}
        <button
          onClick={() => setAutoRotate(v => !v)}
          aria-label={autoRotate ? 'หยุดหมุนอัตโนมัติ' : 'หมุนอัตโนมัติ'}
          title={autoRotate ? 'หยุดหมุนอัตโนมัติ' : 'หมุนอัตโนมัติ'}
          style={{
            marginLeft: 'auto', pointerEvents: 'auto',
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 13px', borderRadius: 999,
            background: autoRotate ? '#0F172A' : 'rgba(255,255,255,0.85)',
            color: autoRotate ? '#fff' : '#334155',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            cursor: 'pointer', fontFamily: 'var(--font)',
            fontSize: 12.5, fontWeight: 600,
            backdropFilter: 'blur(10px)',
          }}
        >
          {autoRotate ? <Pause size={13} /> : <Play size={13} />}
          <span>หมุนอัตโนมัติ</span>
        </button>
      </motion.div>

      {/* Legend / คำอธิบายมุมล่าง */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        style={{
          position: 'absolute', bottom: 18, left: 18, zIndex: 10,
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: 12, padding: '10px 14px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          maxWidth: 220,
        }}
      >
        <p style={{
          fontSize: 11, fontWeight: 700, color: '#0F172A',
          margin: '0 0 6px', letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          ส่วนประกอบ
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {BRAIN_PARTS.map(p => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 9, height: 9, borderRadius: '50%',
                background: p.color, flexShrink: 0,
                boxShadow: `0 0 8px ${p.color}66`,
              }} />
              <span style={{ fontSize: 11.5, color: '#334155', fontWeight: 500 }}>
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 3D Canvas */}
      <div className="r3f-fill" style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Canvas
          camera={{ position: [3.5, 1.5, 4.5], fov: 45 }}
          dpr={[1, 2]}
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <Suspense fallback={
            <Html center>
              <div style={{
                padding: '10px 16px', borderRadius: 10,
                background: 'rgba(255,255,255,0.92)',
                border: '1px solid rgba(0,0,0,0.06)',
                fontSize: 13, color: '#475569', fontWeight: 600,
              }}>
                กำลังโหลดโมเดล 3D...
              </div>
            </Html>
          }>
            <Environment preset="city" />
            <ambientLight intensity={0.7} />
            <directionalLight position={[6, 8, 4]} intensity={1.1} />
            <directionalLight position={[-6, -4, -3]} intensity={0.45} />

            {/* Center + Bounds จัด brain ให้อยู่ตรงกลางและขนาดสม่ำเสมอ
                margin=1.6 = เว้นรอบขอบให้เห็นป้ายข้อความ */}
            <Bounds fit clip observe margin={1.6}>
              <Center>
                <BrainModel />
              </Center>
            </Bounds>

            {/* Annotations อยู่ในพิกัดโลก (ไม่ผูกกับ Bounds/Center)
                — จะลอยรอบสมองในระยะที่เห็นชัด */}
            {BRAIN_PARTS.map(p => (
              <BrainAnnotation
                key={p.name}
                name={p.name}
                desc={p.desc}
                color={p.color}
                position={p.pos as unknown as [number, number, number]}
              />
            ))}

            <OrbitControls
              enablePan
              enableZoom
              enableRotate
              minDistance={2.5}
              maxDistance={12}
              autoRotate={autoRotate}
              autoRotateSpeed={0.8}
              makeDefault
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Floating hint chip ที่มุมขวาล่าง */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        style={{
          position: 'absolute', bottom: 18, right: 18, zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 12px', borderRadius: 999,
          background: 'rgba(15,23,42,0.85)', color: '#fff',
          fontSize: 11.5, fontWeight: 600, letterSpacing: '0.01em',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
        }}
      >
        <RotateCw size={12} />
        ลากเพื่อหมุนรอบสมอง
      </motion.div>
    </div>
  )
}
