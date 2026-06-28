import { useEffect, useRef, useState, type ComponentProps } from 'react'
import * as THREE from 'three'
import { cn } from '@/lib/utils'

type DottedSurfaceProps = Omit<ComponentProps<'div'>, 'ref'>

/** อ่าน data-theme ของ <html> + ติดตามการเปลี่ยน (แทน next-themes ของ Next.js) */
function useDataTheme(): 'dark' | 'light' {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof document === 'undefined') return 'light'
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
  })

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light')
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  return theme
}

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
  const theme = useDataTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    points: THREE.Points
    animationId: number
  } | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const SEPARATION = 150
    const AMOUNTX = 40
    const AMOUNTY = 60

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0xffffff, 2000, 10000)

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      10000,
    )
    camera.position.set(0, 355, 1220)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(scene.fog.color, 0)

    container.appendChild(renderer.domElement)

    const positions: number[] = []
    const colors: number[] = []
    const geometry = new THREE.BufferGeometry()

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2
        const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2
        positions.push(x, 0, z)
        if (theme === 'dark') colors.push(200, 200, 200)
        else colors.push(0, 0, 0)
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 8,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    let count = 0
    let animationId = 0

    const animate = () => {
      animationId = requestAnimationFrame(animate)

      const positionAttribute = geometry.attributes.position
      const arr = positionAttribute.array as Float32Array

      let i = 0
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          const index = i * 3
          arr[index + 1] =
            Math.sin((ix + count) * 0.3) * 50 + Math.sin((iy + count) * 0.5) * 50
          i++
        }
      }

      positionAttribute.needsUpdate = true
      renderer.render(scene, camera)
      count += 0.1
    }

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)
    animate()

    sceneRef.current = { scene, camera, renderer, points, animationId }

    return () => {
      window.removeEventListener('resize', handleResize)
      const s = sceneRef.current
      if (!s) return
      cancelAnimationFrame(s.animationId)
      s.scene.traverse((object) => {
        if (object instanceof THREE.Points) {
          object.geometry.dispose()
          if (Array.isArray(object.material)) object.material.forEach((m) => m.dispose())
          else object.material.dispose()
        }
      })
      s.renderer.dispose()
      if (container && s.renderer.domElement.parentNode === container) {
        container.removeChild(s.renderer.domElement)
      }
      sceneRef.current = null
    }
  }, [theme])

  return (
    <div
      ref={containerRef}
      className={cn('pointer-events-none fixed inset-0 -z-1', className)}
      {...props}
    />
  )
}
