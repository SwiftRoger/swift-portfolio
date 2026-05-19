import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import api from '../utils/api'

function ProjectionRoom() {
  const beamRef = useRef()
  const screenGlowRef = useRef()

  useFrame((state) => {
    if (beamRef.current) {
      beamRef.current.material.opacity = 0.04 + Math.sin(state.clock.elapsedTime * 0.4) * 0.01
    }
    if (screenGlowRef.current) {
      screenGlowRef.current.intensity = 1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.05
    }
  })

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#04040a" roughness={1} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#020208" roughness={1} />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 1, -9]}>
        <boxGeometry args={[30, 16, 0.2]} />
        <meshStandardMaterial color="#030308" roughness={1} />
      </mesh>
      <mesh position={[-8, 1, 0]}>
        <boxGeometry args={[0.2, 16, 30]} />
        <meshStandardMaterial color="#030308" roughness={1} />
      </mesh>
      <mesh position={[8, 1, 0]}>
        <boxGeometry args={[0.2, 16, 30]} />
        <meshStandardMaterial color="#030308" roughness={1} />
      </mesh>

      {/* Projection screen */}
      <mesh position={[0, 1, -8.7]}>
        <boxGeometry args={[10, 6, 0.05]} />
        <meshStandardMaterial color="#e8e8f0" emissive="#c0c0d8" emissiveIntensity={0.15} roughness={0.9} />
      </mesh>

      {/* Screen glow light */}
      <pointLight ref={screenGlowRef} position={[0, 1, -7]} intensity={1.2} distance={12} color="#c0c8e0" decay={2} />

      {/* Projection beam */}
      <mesh ref={beamRef} position={[0, 1, -1]} rotation={[0, 0, 0]}>
        <coneGeometry args={[3, 14, 32, 1, true]} />
        <meshBasicMaterial color="#d0d0ff" transparent opacity={0.04} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Projector box */}
      <group position={[0, 3.5, 5]}>
        <mesh>
          <boxGeometry args={[0.8, 0.4, 1.2]} />
          <meshStandardMaterial color="#111118" roughness={0.5} metalness={0.6} />
        </mesh>
        <pointLight position={[0, -0.5, -1]} intensity={0.8} distance={18} color="#d8d8ff" decay={2} />
      </group>

      {/* Theater seats suggestion — rows of dark boxes */}
      {Array.from({ length: 3 }).map((_, row) => (
        Array.from({ length: 5 }).map((_, col) => (
          <group key={`${row}-${col}`} position={[(col - 2) * 1.8, -2, row * 2 + 1]}>
            <mesh position={[0, 0.3, 0]}>
              <boxGeometry args={[1.2, 0.08, 0.5]} />
              <meshStandardMaterial color="#0a0a14" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.1, 0.2]}>
              <boxGeometry args={[1.2, 0.4, 0.08]} />
              <meshStandardMaterial color="#080810" roughness={0.9} />
            </mesh>
          </group>
        ))
      ))}

      {/* Aisle strip lights on floor */}
      {[-1, 1].map((side, i) => (
        Array.from({ length: 8 }).map((_, j) => (
          <mesh key={`aisle${i}${j}`} rotation={[-Math.PI / 2, 0, 0]} position={[side * 4.5, -2.48, j * 1.5]}>
            <planeGeometry args={[0.06, 0.8]} />
            <meshBasicMaterial color="#1a1a3a" />
          </mesh>
        ))
      ))}

      <ambientLight intensity={0.01} color="#0808ff" />
    </group>
  )
}

function CameraFloat() {
  useFrame((state) => {
    state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.4
    state.camera.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 0.07) * 0.1
    state.camera.lookAt(0, 0.5, -5)
  })
  return null
}

function FogSetup() {
  const { scene } = useThree()
  useEffect(() => {
    scene.fog = new THREE.FogExp2('#020208', 0.06)
    return () => { scene.fog = null }
  }, [scene])
  return null
}

function TunnelBack({ active, onComplete }) {
  useEffect(() => {
    if (active) { const t = setTimeout(onComplete, 900); return () => clearTimeout(t) }
  }, [active])
  if (!active) return null
  return <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#000', animation: 'fadeIn 0.9s ease forwards' }} />
}

export default function Video({ onBack }) {
  const [items, setItems] = useState([])
  const [tunneling, setTunneling] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api.get('/api/videos').then(r => { setItems(r.data || []); setLoaded(true) }).catch(() => setLoaded(true))
  }, [])

  const getEmbedUrl = (url) => {
    try {
      const u = new URL(url)
      const id = u.searchParams.get('v') || u.pathname.split('/').pop()
      return `https://www.youtube.com/embed/${id}`
    } catch { return url }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#020208', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Noto+Serif+JP:wght@300&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .return-btn { background:transparent; border:1px solid rgba(192,200,224,0.2); color:#c0c8e0; font-family:'Space Mono',monospace; font-size:0.6rem; letter-spacing:0.3em; padding:0.6rem 1.2rem; cursor:pointer; transition:all 0.3s; }
        .return-btn:hover { border-color:rgba(192,200,224,0.5); }
        ::-webkit-scrollbar { width:2px; } ::-webkit-scrollbar-track { background:#020208; } ::-webkit-scrollbar-thumb { background:#1a1a2e; }
      `}</style>

      <Canvas camera={{ position: [0, 0.5, 6], fov: 65 }} style={{ position: 'absolute', inset: 0 }}>
        <Suspense fallback={null}>
          <FogSetup />
          <CameraFloat />
          <ProjectionRoom />
        </Suspense>
      </Canvas>

      {/* Grain overlay */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, opacity: 0.05, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* Vignette */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at center, rgba(2,2,8,0.2) 0%, rgba(2,2,8,0.85) 100%)', pointerEvents: 'none', zIndex: 2 }} />

      {/* Fixed header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 3rem', background: 'linear-gradient(to bottom, rgba(2,2,8,0.9), transparent)', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'all', animation: 'fadeInUp 0.8s ease forwards' }}>
          <button className="return-btn" onClick={() => setTunneling(true)}>← STATION</button>
        </div>
        <div>
          <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(192,200,224,0.2)', letterSpacing: '0.4em' }}>// PLATFORM 03 — VIDEO</p>
        </div>
      </div>

      {/* Scrollable video list */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 10, overflowY: 'auto', paddingTop: '6rem', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 3rem' }}>
          {loaded && items.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
              <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.7rem', color: 'rgba(192,200,224,0.1)', letterSpacing: '0.3em' }}>// NO VIDEOS YET</p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', animation: 'fadeIn 0.8s ease forwards', animationDelay: '0.3s', opacity: 0 }}>
            {items.map((item, i) => (
              <div key={item.id}>
                <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(192,200,224,0.2)', letterSpacing: '0.4em', marginBottom: '0.75rem' }}>
                  // {String(i + 1).padStart(2, '0')}
                </p>
                <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#010106', border: '1px solid rgba(192,200,224,0.05)', overflow: 'hidden' }}>
                  <iframe
                    src={getEmbedUrl(item.youtube_url)}
                    title={item.title}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                    allowFullScreen
                  />
                </div>
                <p style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '1rem', color: 'rgba(192,200,224,0.5)', marginTop: '0.75rem', fontWeight: 300, letterSpacing: '0.05em' }}>
                  {item.title}
                </p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <p style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '0.75rem', color: 'rgba(192,200,224,0.07)', letterSpacing: '0.3em' }}>映写室</p>
          </div>
        </div>
      </div>

      <TunnelBack active={tunneling} onComplete={onBack} />
    </div>
  )
}
